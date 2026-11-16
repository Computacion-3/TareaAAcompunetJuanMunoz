import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TELEMETRY_TOPICS,
  TelemetryReading,
  TelemetryTopic,
  TelemetryTopicSummary,
} from './interfaces/telemetry-reading.interface';
import { TelemetryRepository } from './repositories/telemetry.repository';

/**
 * Application service that serves telemetry readings from memory and tracks
 * sequential streaming cursors per topic for real-time emitters.
 */
@Injectable()
export class TelemetryService {
  private readonly cursors = new Map<TelemetryTopic, number>(
    TELEMETRY_TOPICS.map((topic) => [topic, 0]),
  );

  constructor(private readonly telemetryRepository: TelemetryRepository) {}

  getTopics(): TelemetryTopicSummary[] {
    return this.telemetryRepository.getTopics();
  }

  getReadings(topic: string, offset = 0, limit = 50): TelemetryReading[] {
    const validTopic = this.assertTopic(topic);
    return this.telemetryRepository.findSliceByTopic(validTopic, offset, limit);
  }

  /**
   * Returns the next sequential sensor reading for the given topic and advances
   * its in-memory cursor circularly.
   */
  getNextReading(topic: string): TelemetryReading {
    const validTopic = this.assertTopic(topic);
    const total = this.telemetryRepository.countByTopic(validTopic);
    if (total === 0) {
      throw new NotFoundException(
        `No telemetry readings loaded for topic "${validTopic}"`,
      );
    }

    const currentIndex = this.cursors.get(validTopic) ?? 0;
    const reading = this.telemetryRepository.findByTopicAtIndex(
      validTopic,
      currentIndex,
    );

    if (!reading) {
      throw new NotFoundException(
        `Reading not found at index ${currentIndex} for topic "${validTopic}"`,
      );
    }

    this.cursors.set(validTopic, (currentIndex + 1) % total);
    return reading;
  }

  resetCursor(topic: string): { topic: TelemetryTopic; cursor: number } {
    const validTopic = this.assertTopic(topic);
    this.cursors.set(validTopic, 0);
    return { topic: validTopic, cursor: 0 };
  }

  private assertTopic(topic: string): TelemetryTopic {
    if (!this.telemetryRepository.isValidTopic(topic)) {
      throw new NotFoundException(
        `Unknown telemetry topic "${topic}". Available topics: ${TELEMETRY_TOPICS.join(', ')}`,
      );
    }
    return topic;
  }
}
