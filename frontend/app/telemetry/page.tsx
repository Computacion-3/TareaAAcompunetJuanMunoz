'use client';

import { TelemetryChart } from '@/components/TelemetryChart';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryTopic } from '@/types/telemetry';

export default function TelemetryPage() {
    const {
        topic,
        running,
        points,
        latest,
        maxPoints,
        tickMs,
        subscribe,
        toggle,
        reset,
    } = useTelemetry();

    return (
        <main className="mx-auto w-full max-w-6xl space-y-6 p-6">
            <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Telemetría de Sensores en Tiempo Real
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Visualización de lecturas de sensores por tópico con Apache ECharts.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        aria-label="Seleccionar tópico"
                        value={topic}
                        onChange={(e) => subscribe(e.target.value as TelemetryTopic)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none"
                    >
                        <option value="telemetry:day-1">Día 1 (telemetry:day-1)</option>
                        <option value="telemetry:day-2">Día 2 (telemetry:day-2)</option>
                    </select>

                    <button
                        type="button"
                        onClick={toggle}
                        className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${running
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {running ? 'Pausar' : 'Ejecutar'}
                    </button>

                    <button
                        type="button"
                        onClick={reset}
                        className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Limpiar
                    </button>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <KpiCard
                    label="Temperatura"
                    value={latest ? `${latest.temperature} °C` : '--'}
                    accent="text-blue-600"
                />
                <KpiCard
                    label="Humedad"
                    value={latest ? `${latest.humidity} %` : '--'}
                    accent="text-emerald-600"
                />
                <KpiCard
                    label="Potencia"
                    value={latest ? `${latest.powerKw} kW` : '--'}
                    accent="text-amber-600"
                />
                <KpiCard
                    label="CO₂ / Presión"
                    value={
                        latest ? `${latest.co2Ppm} ppm · ${latest.pressureHpa} hPa` : '--'
                    }
                    accent="text-slate-800"
                />
            </section>

            <section className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Serie temporal — {topic}
                        </h2>
                        <p className="text-xs text-slate-500">
                            Ventana visible de hasta {maxPoints} lecturas (actualización cada{' '}
                            {tickMs / 1000}s)
                        </p>
                    </div>
                    <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${running
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-slate-100 text-slate-600'
                            }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${running ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'
                                }`}
                        />
                        {running ? 'En ejecución' : 'En pausa'}
                    </span>
                </div>

                <TelemetryChart points={points} />
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                    <h3 className="text-sm font-semibold text-slate-800">
                        Últimas lecturas recibidas ({points.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                        <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] uppercase text-slate-500">
                            <tr>
                                <th className="px-3 py-2">Día</th>
                                <th className="px-3 py-2">Hora</th>
                                <th className="px-3 py-2">Temp (°C)</th>
                                <th className="px-3 py-2">Hum (%)</th>
                                <th className="px-3 py-2">Potencia (kW)</th>
                                <th className="px-3 py-2">Presión (hPa)</th>
                                <th className="px-3 py-2">CO₂ (ppm)</th>
                                <th className="px-3 py-2">Lux</th>
                                <th className="px-3 py-2">Viento (m/s)</th>
                                <th className="px-3 py-2">Batería (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                            {points.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="px-3 py-6 text-center font-sans text-slate-400"
                                    >
                                        Sin lecturas todavía.
                                    </td>
                                </tr>
                            ) : (
                                [...points]
                                    .reverse()
                                    .slice(0, 8)
                                    .map((row, idx) => (
                                        <tr
                                            key={`${row.day}-${row.time}-${idx}`}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-3 py-2">{row.day}</td>
                                            <td className="px-3 py-2">{row.time}</td>
                                            <td className="px-3 py-2">{row.temperature}</td>
                                            <td className="px-3 py-2">{row.humidity}</td>
                                            <td className="px-3 py-2">{row.powerKw}</td>
                                            <td className="px-3 py-2">{row.pressureHpa}</td>
                                            <td className="px-3 py-2">{row.co2Ppm}</td>
                                            <td className="px-3 py-2">{row.lux}</td>
                                            <td className="px-3 py-2">{row.windSpeedMs}</td>
                                            <td className="px-3 py-2">{row.batteryPct}</td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}

function KpiCard({
    label,
    value,
    accent,
}: {
    label: string;
    value: string;
    accent: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`mt-1 font-mono text-lg font-bold ${accent}`}>{value}</p>
        </div>
    );
}
