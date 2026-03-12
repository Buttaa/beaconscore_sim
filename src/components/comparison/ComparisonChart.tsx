import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { EntityBreakdown } from "../../lib/types";

interface ComparisonChartProps {
  entityBreakdowns: EntityBreakdown[];
}

export function ComparisonChart({ entityBreakdowns }: ComparisonChartProps) {
  const data = useMemo(() => {
    return [
      {
        metric: "Overall",
        ...Object.fromEntries(
          entityBreakdowns.map((eb) => [
            eb.entity.name,
            +(eb.aggregateScore * 100).toFixed(2),
          ])
        ),
      },
      {
        metric: "Attestation",
        ...Object.fromEntries(
          entityBreakdowns.map((eb) => [
            eb.entity.name,
            +(eb.aggregateAttestation * 100).toFixed(2),
          ])
        ),
      },
      {
        metric: "Proposals",
        ...Object.fromEntries(
          entityBreakdowns.map((eb) => [
            eb.entity.name,
            eb.aggregateProposal != null
              ? +(eb.aggregateProposal * 100).toFixed(2)
              : null,
          ])
        ),
      },
      {
        metric: "Sync",
        ...Object.fromEntries(
          entityBreakdowns.map((eb) => [
            eb.entity.name,
            eb.aggregateSync != null
              ? +(eb.aggregateSync * 100).toFixed(2)
              : null,
          ])
        ),
      },
    ];
  }, [entityBreakdowns]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-secondary">
        Entity Comparison
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <XAxis
            dataKey="metric"
            tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
          />
          <YAxis
            domain={[
              (dataMin: number) => Math.max(0, Math.floor(dataMin - 2)),
              100,
            ]}
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              color: "var(--color-text-primary)",
              fontSize: "13px",
            }}
            formatter={(value) =>
              value != null ? `${Number(value).toFixed(2)}%` : "N/A"
            }
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "var(--color-text-muted)" }}
          />
          {entityBreakdowns.map((eb) => (
            <Bar
              key={eb.entity.id}
              dataKey={eb.entity.name}
              fill={eb.entity.color}
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
