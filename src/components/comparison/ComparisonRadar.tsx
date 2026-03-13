import { useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { EntityBreakdown } from "../../lib/types";

interface ComparisonRadarProps {
  entityBreakdowns: EntityBreakdown[];
}

export function ComparisonRadar({ entityBreakdowns }: ComparisonRadarProps) {
  const data = useMemo(() => {
    const axes = [
      "Source",
      "Target",
      "Head",
      "Timeliness",
      "Proposals",
      "Sync",
    ];

    return axes.map((axis) => {
      const point: Record<string, string | number> = { axis };
      entityBreakdowns.forEach((eb) => {
        // Average the axis value across all validators in the entity
        const values = eb.validatorBreakdowns.map(({ config, breakdown }) => {
          switch (axis) {
            case "Source":
              return breakdown.sourceComponent * 100;
            case "Target":
              return breakdown.targetComponent * 100;
            case "Head":
              return breakdown.headComponent * 100;
            case "Timeliness":
              return Math.min(breakdown.flagCaps.source, breakdown.flagCaps.target, breakdown.flagCaps.head) * 100;
            case "Proposals":
              return config.onProposalDuty
                ? breakdown.proposerEfficiency * 100
                : 100;
            case "Sync":
              return config.onSyncCommittee
                ? breakdown.syncEfficiency * 100
                : 100;
            default:
              return 0;
          }
        });
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        point[eb.entity.name] = Math.max(0, +avg.toFixed(2));
      });
      return point;
    });
  }, [entityBreakdowns]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-secondary">
        Performance Overlay
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
          />
          {entityBreakdowns.map((eb) => (
            <Radar
              key={eb.entity.id}
              name={eb.entity.name}
              dataKey={eb.entity.name}
              stroke={eb.entity.color}
              fill={eb.entity.color}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "var(--color-text-muted)" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
