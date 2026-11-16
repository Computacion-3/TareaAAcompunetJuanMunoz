export const TELEMETRY_TOPICS = ['telemetry:day-1', 'telemetry:day-2'] as const;

export type TelemetryTopic = (typeof TELEMETRY_TOPICS)[number];

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

export interface TelemetryTopicSummary {
  topic: TelemetryTopic;
  day: string;
  sourceFile: string;
  totalReadings: number;
  columns: string[];
}
