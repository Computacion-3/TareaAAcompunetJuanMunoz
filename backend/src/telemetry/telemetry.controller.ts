import { Controller, Get, Post, Query } from '@nestjs/common';
import type {
  TelemetryReading,
  TelemetryTopicSummary,
} from './interfaces/telemetry-reading.interface';
import { TelemetryService } from './telemetry.service';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get('topics')
  getTopics(): TelemetryTopicSummary[] {
    return this.telemetryService.getTopics();
  }

  @Get('readings')
  getReadings(
    @Query('topic') topic = 'telemetry:day-1',
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ): TelemetryReading[] {
    const parsedOffset = offset ? Number.parseInt(offset, 10) : 0;
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 50;
    return this.telemetryService.getReadings(
      topic,
      Number.isNaN(parsedOffset) ? 0 : parsedOffset,
      Number.isNaN(parsedLimit) ? 50 : parsedLimit,
    );
  }

  @Get('next')
  getNextReading(@Query('topic') topic = 'telemetry:day-1'): TelemetryReading {
    return this.telemetryService.getNextReading(topic);
  }

  @Post('reset')
  resetCursor(@Query('topic') topic = 'telemetry:day-1') {
    return this.telemetryService.resetCursor(topic);
  }
}
