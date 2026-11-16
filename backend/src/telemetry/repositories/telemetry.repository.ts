import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  TELEMETRY_TOPICS,
  TelemetryReading,
  TelemetryTopic,
  TelemetryTopicSummary,
} from '../interfaces/telemetry-reading.interface';

interface TopicSourceConfig {
  day: string;
  filename: string;
}

const TOPIC_SOURCES: Record<TelemetryTopic, TopicSourceConfig> = {
  'telemetry:day-1': {
    day: 'day-1',
    filename: 'telemetry-day-1.csv',
  },
  'telemetry:day-2': {
    day: 'day-2',
    filename: 'telemetry-day-2.csv',
  },
};

/**
 * In-memory repository that parses and caches sensor CSV files on startup.
 */
@Injectable()
export class TelemetryRepository implements OnModuleInit {
  private readonly logger = new Logger(TelemetryRepository.name);
  private readonly readingsByTopic = new Map<
    TelemetryTopic,
    TelemetryReading[]
  >();
  private columnsByTopic = new Map<TelemetryTopic, string[]>();

  onModuleInit(): void {
    this.loadFromDirectory(path.resolve(process.cwd(), 'data'));
  }

  /**
   * Loads all configured telemetry CSV files from the given directory into memory.
   */
  loadFromDirectory(dataDir: string): void {
    for (const topic of TELEMETRY_TOPICS) {
      const { filename } = TOPIC_SOURCES[topic];
      const filePath = path.join(dataDir, filename);

      if (!fs.existsSync(filePath)) {
        this.logger.warn(`CSV file not found for ${topic}: ${filePath}`);
        this.readingsByTopic.set(topic, []);
        this.columnsByTopic.set(topic, []);
        continue;
      }

      const raw = fs.readFileSync(filePath, 'utf8');
      const { columns, readings } = this.parseCsv(raw);
      this.readingsByTopic.set(topic, readings);
      this.columnsByTopic.set(topic, columns);
      this.logger.log(
        `Loaded ${readings.length} telemetry rows for ${topic} (${filename})`,
      );
    }
  }

  isValidTopic(topic: string): topic is TelemetryTopic {
    return (TELEMETRY_TOPICS as readonly string[]).includes(topic);
  }

  getTopics(): TelemetryTopicSummary[] {
    return TELEMETRY_TOPICS.map((topic) => {
      const config = TOPIC_SOURCES[topic];
      const readings = this.readingsByTopic.get(topic) ?? [];
      const columns = this.columnsByTopic.get(topic) ?? [];
      return {
        topic,
        day: config.day,
        sourceFile: config.filename,
        totalReadings: readings.length,
        columns,
      };
    });
  }

  findAllByTopic(topic: TelemetryTopic): TelemetryReading[] {
    return this.readingsByTopic.get(topic) ?? [];
  }

  findSliceByTopic(
    topic: TelemetryTopic,
    offset = 0,
    limit = 50,
  ): TelemetryReading[] {
    const readings = this.findAllByTopic(topic);
    const safeOffset = Math.max(0, offset);
    const safeLimit = Math.max(1, Math.min(limit, 500));
    return readings.slice(safeOffset, safeOffset + safeLimit);
  }

  findByTopicAtIndex(
    topic: TelemetryTopic,
    index: number,
  ): TelemetryReading | null {
    const readings = this.findAllByTopic(topic);
    if (readings.length === 0) return null;
    const normalizedIndex =
      ((index % readings.length) + readings.length) % readings.length;
    return readings[normalizedIndex];
  }

  countByTopic(topic: TelemetryTopic): number {
    return this.findAllByTopic(topic).length;
  }

  private parseCsv(content: string): {
    columns: string[];
    readings: TelemetryReading[];
  } {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return { columns: [], readings: [] };
    }

    const columns = lines[0].split(',').map((col) => col.trim());
    const readings: TelemetryReading[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < 10) continue;

      readings.push({
        day: values[0].trim(),
        time: values[1].trim(),
        temperature: Number(values[2]),
        humidity: Number(values[3]),
        powerKw: Number(values[4]),
        pressureHpa: Number(values[5]),
        co2Ppm: Number(values[6]),
        lux: Number(values[7]),
        windSpeedMs: Number(values[8]),
        batteryPct: Number(values[9]),
      });
    }

    return { columns, readings };
  }
}
