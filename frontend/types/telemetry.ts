export type TelemetryTopic = 'telemetry:day-1' | 'telemetry:day-2';

export interface TelemetryReading {
  day: string;
  time: string;
  temperature: number;
  humidity: number;
  powerKw: number;
  pressureHpa: number;
  co2Ppm: number;
  lux: number;
  windSpeedMs: number;
  batteryPct: number;
}
