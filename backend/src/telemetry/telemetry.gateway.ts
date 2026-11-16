import { OnModuleDestroy } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  TELEMETRY_TOPICS,
  TelemetryTopic,
} from './interfaces/telemetry-reading.interface';
import { TelemetryService } from './telemetry.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class TelemetryGateway implements OnGatewayInit, OnModuleDestroy {
  @WebSocketServer()
  server: Server;

  private intervalRef?: NodeJS.Timeout;

  constructor(private readonly telemetryService: TelemetryService) {}

  afterInit(): void {
    this.intervalRef = setInterval(() => {
      for (const topic of TELEMETRY_TOPICS) {
        const roomSize =
          this.server.sockets.adapter.rooms.get(topic)?.size ?? 0;
        if (roomSize === 0) continue;

        const reading = this.telemetryService.getNextReading(topic);
        this.server.to(topic).emit('telemetry:reading', reading);
      }
    }, 1500);
  }

  onModuleDestroy(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  @SubscribeMessage('telemetry:subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { topic: TelemetryTopic },
  ): Promise<void> {
    const topic = payload?.topic;
    if (!TELEMETRY_TOPICS.includes(topic)) return;

    for (const t of TELEMETRY_TOPICS) {
      await client.leave(t);
    }
    await client.join(topic);
  }
}
