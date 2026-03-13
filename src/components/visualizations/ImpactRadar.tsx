import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Text,
} from "recharts";
import type { ScoreBreakdown } from "../../lib/types";

interface ImpactRadarProps {
  breakdown: ScoreBreakdown;
  showProposals: boolean;
  showSync: boolean;
}

function renderAxisTick({
  payload,
  x,
  y,
  cx,
  cy,
  value,
}: {
  payload: { value: string };
  x: number;
  y: number;
  cx: number;
  cy: number;
  value: number;
}) {
  const label = payload.value;
  const displayValue = value.toFixed(1);

  // Offset the label away from center
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offsetX = dist > 0 ? (dx / dist) * 14 : 0;
  const offsetY = dist > 0 ? (dy / dist) * 14 : 0;

  return (
    <g>
      <Text
        x={x + offsetX}
        y={y + offsetY - 6}
        textAnchor="middle"
        fill="var(--color-text-muted)"
        fontSize={11}
      >
        {label}
      </Text>
      <Text
        x={x + offsetX}
        y={y + offsetY + 8}
        textAnchor="middle"
        fill="var(--color-text-primary)"
        fontSize={10}
        fontWeight={600}
      >
        {displayValue}
      </Text>
    </g>
  );
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
      axis: "Timeliness",
      value: Math.min(breakdown.flagCaps.source, breakdown.flagCaps.target, breakdown.flagCaps.head) * 100,
    },
    ...(showProposals
      ? [{ axis: "Proposals", value: breakdown.proposerEfficiency * 100 }]
      : []),
    ...(showSync
      ? [{ axis: "Sync", value: breakdown.syncEfficiency * 100 }]
      : []),
  ];

  const overallScore = (breakdown.overall * 100).toFixed(1);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-secondary">
        Performance Shape
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={(props: Record<string, unknown>) => {
              const index = props.index as number;
              return renderAxisTick({
                payload: props.payload as { value: string },
                x: props.x as number,
                y: props.y as number,
                cx: props.cx as number,
                cy: props.cy as number,
                value: data[index].value,
              });
            }}
          />
          <Radar
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          {/* Center BeaconScore label */}
          <text
            x="50%"
            y="47%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-text-primary)"
            fontSize={22}
            fontWeight={700}
          >
            {overallScore}
          </text>
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-text-muted)"
            fontSize={10}
          >
            BeaconScore
          </text>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
