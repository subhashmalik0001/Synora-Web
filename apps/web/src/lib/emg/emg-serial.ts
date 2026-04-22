// src/lib/emg/emg-serial.ts
export interface EMGReading {
  signal: number;
  timestamp: number;
}

export class EMGSerialService {
  private port: any | null = null;
  private reader: any | null = null;
  private isConnected = false;
  private readingTask: Promise<void> | null = null;
  private keepReading = true;

  async connect(): Promise<boolean> {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API is not supported in this browser. Please use Chrome or Edge.');
    }

    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Failed to connect to serial port:', error);
      throw error;
    }
  }

  async startReading(onData: (reading: EMGReading) => void): Promise<void> {
    if (!this.port || !this.isConnected) {
      throw new Error('Not connected to serial port.');
    }

    this.keepReading = true;
    this.readingTask = this.readLoop(onData);
  }

  private async readLoop(onData: (reading: EMGReading) => void) {
    if (!this.port) return;
    
    // Use TextDecoderStream to convert bytes to text
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable!.pipeTo(textDecoder.writable);
    this.reader = textDecoder.readable.getReader();

    let buffer = '';

    try {
      while (this.keepReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
              try {
                const parsed = JSON.parse(trimmed) as EMGReading;
                if (typeof parsed.signal === 'number' && typeof parsed.timestamp === 'number') {
                  onData(parsed);
                }
              } catch (e) {
                // Ignore incomplete JSON chunks gracefully
                console.warn('Invalid JSON from serial:', trimmed);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Serial read error:', error);
    } finally {
      if (this.reader) {
        await this.reader.cancel();
        this.reader.releaseLock();
        this.reader = null;
      }
    }
  }

  async disconnect(): Promise<void> {
    this.keepReading = false;
    
    if (this.reader) {
      await this.reader.cancel();
    }
    
    if (this.readingTask) {
      await this.readingTask;
    }
    
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
    this.isConnected = false;
  }
}

export const emgSerialService = new EMGSerialService();
