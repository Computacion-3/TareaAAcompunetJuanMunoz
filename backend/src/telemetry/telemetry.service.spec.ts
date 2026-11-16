import { NotFoundException } from '@nestjs/common';
import * as path from 'node:path';
import { TelemetryRepository } from './repositories/telemetry.repository';
import { TelemetryService } from './telemetry.service';

describe('TelemetryService', () => {
  let repository: TelemetryRepository;
  let service: TelemetryService;

  beforeEach(() => {
    repository = new TelemetryRepository();
    repository.loadFromDirectory(path.resolve(process.cwd(), 'data'));
    service = new TelemetryService(repository);
  });

  it('loads 3000 rows and 10 columns for both telemetry CSV files', () => {
    const topics = service.getTopics();
    expect(topics).toHaveLength(2);

    for (const summary of topics) {
      expect(summary.totalReadings).toBe(3000);
      expect(summary.columns).toHaveLength(10);
    }
  });

  it('returns sliced readings for a valid topic', () => {
    const readings = service.getReadings('telemetry:day-1', 0, 5);
    expect(readings).toHaveLength(5);
    expect(readings[0].day).toBe('day-1');
    expect(readings[0].time).toBe('06:00:00');
  });

  it('advances cursor sequentially and resets back to index 0', () => {
    const first = service.getNextReading('telemetry:day-2');
    const second = service.getNextReading('telemetry:day-2');

    expect(first.day).toBe('day-2');
    expect(first.time).toBe('06:00:00');
    expect(second.time).toBe('06:00:03');

    service.resetCursor('telemetry:day-2');
    const afterReset = service.getNextReading('telemetry:day-2');
    expect(afterReset.time).toBe('06:00:00');
  });

  it('throws NotFoundException for unknown topics', () => {
    expect(() => service.getReadings('telemetry:day-99')).toThrow(
      NotFoundException,
    );
  });
});
