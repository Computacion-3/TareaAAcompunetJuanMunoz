'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { TelemetryReading } from '@/types/telemetry';

export interface TelemetryChartProps {
    points: TelemetryReading[];
    height?: number;
    emptyMessage?: string;
}

export function TelemetryChart({
    points,
    height = 380,
    emptyMessage = 'Pulsa Ejecutar para comenzar a graficar las lecturas en Apache ECharts.',
}: TelemetryChartProps) {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        const container = chartRef.current;
        if (!container) return;

        const instance = echarts.init(container);
        chartInstance.current = instance;

        const resizeObserver = new ResizeObserver(() => {
            instance.resize();
        });
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            instance.dispose();
            chartInstance.current = null;
        };
    }, []);

    useEffect(() => {
        chartInstance.current?.setOption(
            {
                tooltip: {
                    trigger: 'axis',
                },
                legend: {
                    top: 6,
                    data: ['Temperatura (°C)', 'Humedad (%)', 'Potencia (kW)'],
                },
                grid: {
                    top: 48,
                    left: 52,
                    right: 56,
                    bottom: 36,
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: points.map((p) => p.time),
                },
                yAxis: [
                    {
                        type: 'value',
                        name: '°C / %',
                        min: 0,
                        max: 100,
                    },
                    {
                        type: 'value',
                        name: 'kW',
                        min: 0,
                        max: 5,
                    },
                ],
                series: [
                    {
                        name: 'Temperatura (°C)',
                        type: 'line',
                        smooth: true,
                        yAxisIndex: 0,
                        showSymbol: true,
                        symbolSize: 6,
                        itemStyle: { color: '#2563eb' },
                        areaStyle: { color: 'rgba(37, 99, 235, 0.12)' },
                        data: points.map((p) => p.temperature),
                    },
                    {
                        name: 'Humedad (%)',
                        type: 'line',
                        smooth: true,
                        yAxisIndex: 0,
                        showSymbol: true,
                        symbolSize: 6,
                        itemStyle: { color: '#059669' },
                        data: points.map((p) => p.humidity),
                    },
                    {
                        name: 'Potencia (kW)',
                        type: 'line',
                        smooth: true,
                        yAxisIndex: 1,
                        showSymbol: false,
                        lineStyle: { type: 'dashed', width: 2 },
                        itemStyle: { color: '#d97706' },
                        data: points.map((p) => p.powerKw),
                    },
                ],
            },
            { notMerge: false },
        );
    }, [points]);

    return (
        <div className="relative">
            <div ref={chartRef} style={{ height }} className="w-full" />
            {points.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <p className="rounded-xl border border-dashed border-slate-300 bg-white/90 px-4 py-2 text-sm font-medium text-slate-500">
                        {emptyMessage}
                    </p>
                </div>
            )}
        </div>
    );
}
