// src/hooks/emg/useEmgStream.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { emgSerialService, EMGReading } from '../../lib/emg/emg-serial';
import { EMGProcessor, ProcessedEMG, FatigueLevel } from '../../lib/emg/emg-processing';
import { createEmgSession, insertEmgBatch, endEmgSession, EMGBatchReading } from '../../lib/emg/emg-supabase';

export type EMGMode = 'serial' | 'simulation';

export function useEmgStream() {
  const [mode, setMode] = useState<EMGMode>('simulation');
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [history, setHistory] = useState<ProcessedEMG[]>([]);
  const [currentSignal, setCurrentSignal] = useState(0);
  const [fatigueLevel, setFatigueLevel] = useState<FatigueLevel>('low');
  const [strainDetected, setStrainDetected] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const processorRef = useRef(new EMGProcessor());
  const bufferRef = useRef<ProcessedEMG[]>([]);
  const batchRef = useRef<EMGBatchReading[]>([]);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Buffer management - keeps UI history at a manageable size (e.g., last 200 points for charts)
  const MAX_HISTORY = 200;

  const handleReading = useCallback((raw: number, timestamp: number) => {
    const processed = processorRef.current.processReading(raw, timestamp);
    
    // Update live state
    setCurrentSignal(Math.round(processed.normalized * 100));
    setFatigueLevel(processed.fatigueLevel);
    setStrainDetected(processed.strainDetected);

    // Add to UI buffer
    bufferRef.current.push(processed);
    if (bufferRef.current.length > MAX_HISTORY) {
      bufferRef.current.shift();
    }
    setHistory([...bufferRef.current]);

    // Add to DB batch if session is active
    if (sessionId) {
      batchRef.current.push({
        signal_value: processed.rawSignal,
        normalized_value: processed.normalized,
        fatigue_index: processed.fatigueIndex,
      });
    }
  }, [sessionId]);

  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Connect to serial port
  const connect = async () => {
    setConnectionError(null);
    if (mode === 'simulation') {
      setIsConnected(true);
      return;
    }
    
    try {
      const connected = await emgSerialService.connect();
      if (connected) {
        setIsConnected(true);
        // Start reading immediately, but won't save to DB until session starts
        emgSerialService.startReading((reading) => {
          handleReading(reading.signal, reading.timestamp);
        });
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      setConnectionError(error.message || 'Failed to connect to device. Ensure your browser supports Web Serial and the device is plugged in.');
      setIsConnected(false);
    }
  };

  const disconnect = async () => {
    if (isSessionActive) {
      await stopSession();
    }

    if (mode === 'serial') {
      await emgSerialService.disconnect();
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    }
    setIsConnected(false);
    
    // Reset state
    processorRef.current.reset();
    bufferRef.current = [];
    setHistory([]);
    setCurrentSignal(0);
    setFatigueLevel('low');
    setStrainDetected(false);
    setDurationSeconds(0);
  };

  // Database Session Controls
  const startSession = async (patientId: string, activityType: string) => {
    if (!isConnected) await connect();
    
    processorRef.current.reset();
    bufferRef.current = [];
    setHistory([]);
    setDurationSeconds(0);

    let newSessionId: string | null = null;
    try {
      if (patientId) {
        newSessionId = await createEmgSession(patientId, activityType);
        setSessionId(newSessionId);
      }
    } catch (error) {
      console.warn('Failed to create DB session, proceeding with local-only session:', error);
    }
    
    setIsSessionActive(true);

    // Start duration timer
    durationIntervalRef.current = setInterval(() => {
      setDurationSeconds(prev => prev + 1);
    }, 1000);

    // If in simulation mode, start pumping fake data
    if (mode === 'simulation') {
      let t = 0;
      let base = 200;
      simulationIntervalRef.current = setInterval(() => {
        // Simulate some muscle bursts
        const burst = Math.random() > 0.95 ? 600 + Math.random() * 300 : 0;
        const noise = Math.random() * 50;
        const raw = Math.max(0, Math.min(1023, base + noise + burst));
        handleReading(raw, Date.now());
        t++;
        // simulate creeping fatigue
        if (t % 100 === 0) base = Math.min(base + 10, 400); 
      }, 50); // 50ms interval like hardware
    }
  };

  const stopSession = async () => {
    setIsSessionActive(false);

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (mode === 'simulation' && simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    if (sessionId) {
      // Flush remaining batch
      if (batchRef.current.length > 0) {
        await insertEmgBatch(sessionId, batchRef.current);
        batchRef.current = [];
      }
      await endEmgSession(sessionId);
      setSessionId(null);
    }
  };

  // Batch flusher (runs every 1 second if session is active)
  useEffect(() => {
    let flushInterval: NodeJS.Timeout;
    
    if (isSessionActive && sessionId) {
      flushInterval = setInterval(async () => {
        if (batchRef.current.length > 0) {
          const toInsert = [...batchRef.current];
          batchRef.current = []; // Clear immediately to catch new readings
          await insertEmgBatch(sessionId, toInsert);
        }
      }, 1000);
    }

    return () => {
      if (flushInterval) clearInterval(flushInterval);
    };
  }, [isSessionActive, sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (mode === 'serial' && isConnected) {
        emgSerialService.disconnect();
      }
    };
  }, []);

  return {
    mode,
    setMode,
    isConnected,
    isSessionActive,
    currentSignal,
    fatigueLevel,
    strainDetected,
    history,
    durationSeconds,
    connectionError,
    connect,
    disconnect,
    startSession,
    stopSession,
  };
}
