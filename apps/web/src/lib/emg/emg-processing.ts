// src/lib/emg/emg-processing.ts

export type FatigueLevel = 'low' | 'moderate' | 'high';

export interface ProcessedEMG {
  timestamp: number;
  rawSignal: number;
  normalized: number;       // 0 to 1
  fatigueIndex: number;     // 0 to 1
  fatigueLevel: FatigueLevel;
  strainDetected: boolean;
}

// Configuration for Arduino Uno (10-bit ADC -> 1023) or ESP32 (12-bit ADC -> 4095)
// Assuming Arduino Uno here, max value is around 1023. Adjust to 4095 if ESP32.
const MAX_RAW_SIGNAL = 1023; 
const FATIGUE_DECAY = 0.98; // Factor by which fatigue drops per tick if resting
const STRAIN_THRESHOLD = 0.85; // 85% of max capacity
const FATIGUE_INCREMENT = 0.05; // How fast fatigue accumulates on high strain

export class EMGProcessor {
  private fatigueIndex = 0;
  private baselineBuffer: number[] = [];
  private baseline = 0;

  processReading(rawSignal: number, timestamp: number): ProcessedEMG {
    // 1. Maintain dynamic baseline (running average of low signals to find 'rest' state)
    if (rawSignal < this.baseline + 50 || this.baselineBuffer.length < 100) {
        this.baselineBuffer.push(rawSignal);
        if (this.baselineBuffer.length > 100) this.baselineBuffer.shift();
        this.baseline = this.baselineBuffer.reduce((a, b) => a + b, 0) / this.baselineBuffer.length;
    }

    // 2. Normalize Signal (0 to 1) based on baseline
    let normalized = (rawSignal - this.baseline) / (MAX_RAW_SIGNAL - this.baseline);
    normalized = Math.max(0, Math.min(1, normalized)); // Clamp between 0 and 1

    // 3. Compute Fatigue Index
    if (normalized > 0.5) {
      this.fatigueIndex += (normalized - 0.5) * FATIGUE_INCREMENT;
    } else {
      this.fatigueIndex *= FATIGUE_DECAY;
    }
    this.fatigueIndex = Math.max(0, Math.min(1, this.fatigueIndex)); // Clamp between 0 and 1

    // 4. Determine Fatigue Level
    let fatigueLevel: FatigueLevel = 'low';
    if (this.fatigueIndex > 0.7) {
      fatigueLevel = 'high';
    } else if (this.fatigueIndex > 0.3) {
      fatigueLevel = 'moderate';
    }

    // 5. Detect Strain (Sudden unnatural peak or sustained high force)
    const strainDetected = normalized > STRAIN_THRESHOLD;

    return {
      timestamp,
      rawSignal,
      normalized,
      fatigueIndex: this.fatigueIndex,
      fatigueLevel,
      strainDetected,
    };
  }

  reset() {
    this.fatigueIndex = 0;
    this.baselineBuffer = [];
    this.baseline = 0;
  }
}
