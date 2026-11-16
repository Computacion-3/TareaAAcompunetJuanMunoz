'use client';

import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { TelemetryReading, TelemetryTopic } from '@/types/telemetry';

export interface UseTelemetryOptions {
  initialTopic?: TelemetryTopic;
  maxPoints?: number;
  tickMs?: number;
}

export interface UseTelemetryResult {
  topic: TelemetryTopic;
  running: boolean;
  points: TelemetryReading[];
  latest: TelemetryReading | null;
  maxPoints: number;
  tickMs: number;
  subscribe: (nextTopic: TelemetryTopic) => void;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  pushReading: (reading: TelemetryReading) => void;
}

/**
 * Hook de telemetría desacoplado de la vista.
 * Actualmente emite lecturas mockeadas; en la rama `websockets-end` basta con
 * reemplazar el `useEffect` de streaming por la conexión `socket.io-client`.
 */
export function useTelemetry(
  options: UseTelemetryOptions = {},
): UseTelemetryResult {
  const {
    initialTopic = 'telemetry:day-1',
    maxPoints = 30,
    tickMs = 1500,
  } = options;

  const [topic, setTopic] = useState<TelemetryTopic>(initialTopic);
  const [running, setRunning] = useState(false);
  const [points, setPoints] = useState<TelemetryReading[]>([]);

  const pushReading = useCallback(
    (reading: TelemetryReading) => {
      setPoints((prev) => [...prev.slice(-(maxPoints - 1)), reading]);
    },
    [maxPoints],
  );

  const subscribe = useCallback((nextTopic: TelemetryTopic) => {
    setPoints([]);
    setTopic(nextTopic);
  }, []);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const toggle = useCallback(() => setRunning((prev) => !prev), []);

  const reset = useCallback(() => {
    setRunning(false);
    setPoints([]);
  }, []);

  // Fuente mockeada (reemplazar por socket.io-client en `websockets-end`)
  useEffect(() => {
    if (!running) return;

    const socket = io(
      process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000',
    );

    socket.on('connect', () => {
      socket.emit('telemetry:subscribe', { topic });
    });

    socket.on('telemetry:reading', (reading: TelemetryReading) => {
      pushReading(reading);
    });

    return () => {
      socket.disconnect();
    };
  }, [running, topic, pushReading]);

  return {
    topic,
    running,
    points,
    latest: points.at(-1) ?? null,
    maxPoints,
    tickMs,
    subscribe,
    start,
    pause,
    toggle,
    reset,
    pushReading,
  };
}
