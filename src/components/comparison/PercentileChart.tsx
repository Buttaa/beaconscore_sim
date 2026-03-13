import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import type { EntityBreakdown } from "../../lib/types";

interface PercentileChartProps {
  entityBreakdowns: EntityBreakdown[];
}

/**
 * Compute rank-based percentile for a score within a sorted array of all scores.
 * Uses: percentile = (number of scores below) / (total - 1) * 100
 */
function computePercentile(score: number, allScoresSorted: number[]): number {
  if (allScoresSorted.length <= 1) return 100;
  const below = allScoresSorted.filter((s) => s < score).length;
  return (below / (allScoresSorted.length - 1)) * 100;
}

/**
 * Generate a density curve from the actual validator scores using KDE (kernel density estimation).
 */
function generateDensityCurve(
  scores: number[],
  minScore: number,
  maxScore: number
): { score: number; density: number }[] {
  const points: { score: number; density: number }[] = [];
  const steps = 200;
  // Bandwidth: adaptive based on score spread, minimum 0.1
  const bandwidth = Math.max(0.1, (maxScore - minScore) / 8);

  for (let i = 0; i <= steps; i++) {
    const x = minScore + (maxScore - minScore) * (i / steps);
    let density = 0;
    for (const s of scores) {
      // Gaussian kernel
      const z = (x - s) / bandwidth;
      density += Math.exp(-0.5 * z * z);
    }
    density /= scores.length * bandwidth * Math.sqrt(2 * Math.PI);
    points.push({ score: x, density });
  }
  return points;
}

export function PercentileChart({ entityBreakdowns }: PercentileChartProps) {
  // Collect all validator scores
  const allValidatorScores = useMemo(
    () =>
      entityBreakdowns
        .flatMap((eb) => eb.validatorBreakdowns.map((vb) => vb.breakdown.overall * 100))
        .sort((a, b) => a - b),
    [entityBreakdowns]
  );

  // Dynamic range: show from slightly below the min score to 100%
  const minChartScore = Math.max(90, Math.floor(Math.min(...allValidatorScores) - 1));
  const maxChartScore = 100;

  const curve = useMemo(
    () => generateDensityCurve(allValidatorScores, minChartScore, maxChartScore),
    [allValidatorScores, minChartScore]
  );

  const entityMarkers = useMemo(
    () =>
      entityBreakdowns.map((eb) => {
        const aggPct = eb.aggregateScore * 100;
        return {
          name: eb.entity.name,
          color: eb.entity.color,
          score: aggPct,
          percentile: computePercentile(aggPct, allValidatorScores),
        };
      }),
    [entityBreakdowns, allValidatorScores]
  );

  const validatorMarkers = useMemo(
    () =>
      entityBreakdowns.flatMap((eb) =>
        eb.validatorBreakdowns.map((vb) => {
          const scorePct = vb.breakdown.overall * 100;
          return {
            name: vb.config.name,
            entityName: eb.entity.name,
            color: vb.config.color,
            score: scorePct,
            percentile: computePercentile(scorePct, allValidatorScores),
            rank:
              allValidatorScores.length -
              allValidatorScores.filter((s) => s <= scorePct).length +
              1,
          };
        })
      ),
    [entityBreakdowns, allValidatorScores]
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-secondary">
        Network Percentile Distribution
      </h3>
      <p className="text-xs text-text-muted">
        Distribution of all {allValidatorScores.length} validators across entities.
        Entity aggregates shown as dashed lines, individual validators as thin lines.
        Percentiles are ranked within this validator pool.
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={curve}
          margin={{ top: 30, right: 20, bottom: 20, left: 10 }}
        >
          <defs>
            <linearGradient id="densityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="score"
            type="number"
            domain={[minChartScore, maxChartScore]}
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            label={{
              value: "BeaconScore",
              position: "bottom",
              offset: 5,
              style: { fill: "var(--color-text-muted)", fontSize: 11 },
            }}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              color: "var(--color-text-primary)",
              fontSize: "12px",
            }}
            formatter={(value) => [Number(value).toFixed(2), "Density"]}
            labelFormatter={(label) => `Score: ${Number(label).toFixed(2)}%`}
          />
          <Area
            type="monotone"
            dataKey="density"
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            fill="url(#densityGradient)"
          />

          {/* Entity aggregate markers */}
          {entityMarkers.map((marker) => (
            <ReferenceLine
              key={`entity-${marker.name}`}
              x={marker.score}
              stroke={marker.color}
              strokeWidth={2}
              strokeDasharray="4 2"
              label={{
                value: `${marker.name} (P${marker.percentile.toFixed(0)})`,
                position: "top",
                fill: marker.color,
                fontSize: 10,
                fontWeight: 600,
              }}
            />
          ))}

          {/* Individual validator markers with labels */}
          {validatorMarkers.map((marker) => (
            <ReferenceLine
              key={`val-${marker.name}`}
              x={marker.score}
              stroke={marker.color}
              strokeWidth={1}
              strokeOpacity={0.6}
              label={{
                value: marker.name,
                position: "insideBottomLeft",
                fill: marker.color,
                fontSize: 9,
                fontWeight: 500,
                angle: -90,
                offset: 10,
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
        {entityMarkers.map((marker) => (
          <div key={marker.name} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-3 h-0.5"
              style={{ backgroundColor: marker.color }}
            />
            <span className="text-text-muted">
              {marker.name}: {marker.score.toFixed(2)}% (P{marker.percentile.toFixed(0)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Export for use by other components */
export { computePercentile };
