import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getScoreColor } from "../../lib/calculator";
import type { ScoreBreakdown } from "../../lib/types";

interface ComponentBreakdownProps {
  breakdown: ScoreBreakdown;
  showProposals: boolean;
  showSync: boolean;
}

function fmt(n: number): string {
  return n.toFixed(2);
}

export function ComponentBreakdown({
  breakdown,
  showProposals,
  showSync,
}: ComponentBreakdownProps) {
  const data = [
    {
      name: "Attestation",
      efficiency: breakdown.attesterEfficiency * 100,
      weight: breakdown.attesterWeight * 100,
      color: "#60a5fa",
    },
    ...(showProposals
      ? [
          {
            name: "Proposals",
            efficiency: breakdown.proposerEfficiency * 100,
            weight: breakdown.proposerWeight * 100,
            color: "#fbbf24",
          },
        ]
      : []),
    ...(showSync
      ? [
          {
            name: "Sync",
            efficiency: breakdown.syncEfficiency * 100,
            weight: breakdown.syncWeight * 100,
            color: "#34d399",
          },
        ]
      : []),
  ];

  const overallPct = breakdown.overall * 100;
  const scoreColor = getScoreColor(breakdown.overall);

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-text-secondary">
        Component Efficiency
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 40, bottom: 0, left: 80 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={75}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              color: "var(--color-text-primary)",
              fontSize: "13px",
            }}
            formatter={(value, _name, entry) => [
              `${Number(value).toFixed(2)}% efficiency (${Number(entry.payload.weight).toFixed(1)}% weight)`,
              entry.payload.name,
            ]}
          />
          <Bar dataKey="efficiency" radius={[0, 4, 4, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Weight indicators */}
      <div className="flex gap-4 justify-center">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-text-muted">
              {d.name}: {d.weight.toFixed(1)}% weight
            </span>
          </div>
        ))}
      </div>

      {/* Dynamic formula visualization */}
      <div className="bg-bg-secondary/50 border border-border/50 rounded-lg p-4 space-y-4">
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Score Calculation
        </h4>

        {/* Top-level weighted sum */}
        <div className="space-y-2">
          <FormulaLine
            label="Attestation"
            color="#60a5fa"
            efficiency={breakdown.attesterEfficiency}
            weight={breakdown.attesterWeight}
            contribution={breakdown.attesterContribution}
          />
          {showProposals && (
            <FormulaLine
              label="Proposals"
              color="#fbbf24"
              efficiency={breakdown.proposerEfficiency}
              weight={breakdown.proposerWeight}
              contribution={breakdown.proposerContribution}
            />
          )}
          {showSync && (
            <FormulaLine
              label="Sync"
              color="#34d399"
              efficiency={breakdown.syncEfficiency}
              weight={breakdown.syncWeight}
              contribution={breakdown.syncContribution}
            />
          )}

          {/* Sum → final score */}
          <div className="border-t border-border/50 pt-2 flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold w-20 shrink-0"
              style={{ color: scoreColor }}
            >
              BeaconScore
            </span>
            <span className="text-xs text-text-muted">=</span>
            <span className="text-xs font-mono text-text-secondary">
              {fmt(breakdown.attesterContribution * 100)}
              {showProposals && (
                <span>
                  {" "}+ {fmt(breakdown.proposerContribution * 100)}
                </span>
              )}
              {showSync && (
                <span>
                  {" "}+ {fmt(breakdown.syncContribution * 100)}
                </span>
              )}
            </span>
            <span className="text-xs text-text-muted">=</span>
            <span
              className="text-sm font-mono font-bold"
              style={{ color: scoreColor }}
            >
              {fmt(overallPct)}%
            </span>
          </div>
        </div>

        {/* Attestation sub-breakdown */}
        <div className="border-t border-border/50 pt-3 space-y-2">
          <p className="text-xs text-text-muted font-medium">
            Attestation efficiency breakdown:
          </p>
          <div className="font-mono text-xs text-text-secondary leading-loose space-y-1">
            <div className="flex items-center flex-wrap gap-x-1">
              <span className="text-text-muted">accuracy =</span>
              <span className="text-[#38bdf8]">
                {fmt(breakdown.sourceComponent * 100)}%
              </span>
              <span className="text-text-muted">&times;</span>
              <span className="text-text-muted opacity-70">14/54</span>
              <span className="text-text-muted">+</span>
              <span className="text-[#a78bfa]">
                {fmt(breakdown.targetComponent * 100)}%
              </span>
              <span className="text-text-muted">&times;</span>
              <span className="text-text-muted opacity-70">26/54</span>
              <span className="text-text-muted">+</span>
              <span className="text-[#34d399]">
                {fmt(breakdown.headComponent * 100)}%
              </span>
              <span className="text-text-muted">&times;</span>
              <span className="text-text-muted opacity-70">14/54</span>
            </div>
            <div className="flex items-center flex-wrap gap-x-1">
              <span className="text-text-muted">attest_eff =</span>
              <span className="text-text-secondary">accuracy</span>
              <span className="text-text-muted">&times;</span>
              <span className="text-text-primary">
                (1 / {fmt(breakdown.effectiveInclusionDelay)})
              </span>
              <span className="text-text-muted">=</span>
              <span className="text-[#60a5fa] font-semibold">
                {fmt(breakdown.attesterEfficiency * 100)}%
              </span>
            </div>
          </div>
          <div className="flex gap-3 text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
              Source 26%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]" />
              Target 48%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
              Head 26%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormulaLine({
  label,
  color,
  efficiency,
  weight,
  contribution,
}: {
  label: string;
  color: string;
  efficiency: number;
  weight: number;
  contribution: number;
}) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <div className="flex items-center gap-1.5 w-20 shrink-0">
        <div
          className="w-2 h-2 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-text-secondary">{label}</span>
      </div>
      <span className="text-text-secondary">
        {fmt(efficiency * 100)}%
      </span>
      <span className="text-text-muted">&times;</span>
      <span className="text-text-secondary">
        {fmt(weight * 100)}%
      </span>
      <span className="text-text-muted">=</span>
      <span className="text-text-primary font-semibold">
        {fmt(contribution * 100)}
      </span>
    </div>
  );
}
