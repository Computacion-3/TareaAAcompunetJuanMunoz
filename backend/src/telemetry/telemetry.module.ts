import { Module } from '@nestjs/common';
import { TelemetryController } from './telemetry.controller';
import { TelemetryRepository } from './repositories/telemetry.repository';
import { TelemetryService } from './telemetry.service';
import { TelemetryGateway } from './telemetry.gateway';

@Module({
  controllers: [TelemetryController],
  providers: [TelemetryRepository, TelemetryService, TelemetryGateway],
  exports: [TelemetryService],
})
export class TelemetryModule {}
