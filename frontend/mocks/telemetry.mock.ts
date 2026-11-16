import { TelemetryReading, TelemetryTopic } from '@/types/telemetry';

function buildMockSeries(
  day: 'day-1' | 'day-2',
  count = 40,
): TelemetryReading[] {
  const isDayOne = day === 'day-1';
  const startSeconds = 6 * 3600;

  return Array.from({ length: count }, (_, idx) => {
    const totalSeconds = startSeconds + idx * 3;
    const hrs = Math.floor(totalSeconds / 3600) % 24;
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const time = [hrs, mins, secs]
      .map((n) => String(n).padStart(2, '0'))
      .join(':');

    const wave = Math.sin(idx * 0.35 + (isDayOne ? 0.2 : 1.7));
    const micro = Math.cos(idx * 0.8);

    return {
      day,
      time,
      temperature: Number(
        ((isDayOne ? 21.5 : 17.4) + idx * 0.08 + wave * 1.1).toFixed(2),
      ),
      humidity: Number(
        ((isDayOne ? 71.0 : 85.0) - idx * 0.18 - wave * 2.5).toFixed(1),
      ),
      powerKw: Number(
        ((isDayOne ? 1.55 : 1.95) + idx * 0.03 + micro * 0.22).toFixed(2),
      ),
      pressureHpa: Number(
        ((isDayOne ? 1014.4 : 1010.1) + wave * 0.8).toFixed(2),
      ),
      co2Ppm: Math.round((isDayOne ? 430 : 520) + wave * 35 + micro * 12),
      lux: Math.round((isDayOne ? 4200 : 1200) + idx * (isDayOne ? 240 : 90)),
      windSpeedMs: Number(
        Math.max(0.2, (isDayOne ? 1.8 : 3.6) + micro * 0.7).toFixed(2),
      ),
      batteryPct: Number(
        Math.min(100, (isDayOne ? 89.2 : 94.8) + idx * (isDayOne ? 0.08 : -0.05)).toFixed(1),
      ),
    };
  });
}

export const MOCK_TELEMETRY_BY_TOPIC: Record<
  TelemetryTopic,
  TelemetryReading[]
> = {
  'telemetry:day-1': buildMockSeries('day-1'),
  'telemetry:day-2': buildMockSeries('day-2'),
};

export function getNextMockReading(
  topic: TelemetryTopic,
  index: number,
): TelemetryReading {
  const series = MOCK_TELEMETRY_BY_TOPIC[topic];
  return series[index % series.length];
}
