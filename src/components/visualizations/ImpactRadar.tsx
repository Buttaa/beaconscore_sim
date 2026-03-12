import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import type { ScoreBreakdown } from "../../lib/types";

interface ImpactRadarProps {
  breakdown: ScoreBreakdown;
  showProposals: boolean;
  showSync: boolean;
}

export function ImpactRadar({
  breakdown,
  showProposals,
  showSync,
}: ImpactRadarProps) {
  const data = [
    { axis: "Source", value: breakdown.sourceComponent * 100 },
    { axis: "Target", value: breakdown.targetComponent * 100 },
    { axis: "Head", value: breakdown.headComponent * 100 },
    {
      axis: "Incl. Delay",
      value: Math.max(0, (1 / breakdown.effectiveInclusionDelay) * 100),
    },
    ...(showProposals
      ? [{ axis: "Proposals", value: breakdown.proposerEfficiency * 100 }]
      : []),
    ...(showSync
      ? [{ axis: "Sync", value: breakdown.syncEfficiency * 100 }]
      : []),
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-secondary">
        Performance Shape
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
          />
          <Radar
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
