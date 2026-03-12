import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getScoreColor } from "../../lib/calculator";
import { computePercentile } from "./PercentileChart";
import type { EntityBreakdown } from "../../lib/types";

interface ComparisonTableProps {
  entityBreakdowns: EntityBreakdown[];
  allValidatorScores: number[];
}

export function ComparisonTable({
  entityBreakdowns,
  allValidatorScores,
}: ComparisonTableProps) {
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(
    new Set(entityBreakdowns.map((eb) => eb.entity.id))
  );

  const toggleEntity = (id: string) => {
    setExpandedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-secondary">
        Summary Table
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-text-muted font-medium">
                Entity / Validator
              </th>
              <th className="text-right py-2 px-3 text-text-muted font-medium">
                BeaconScore
              </th>
              <th className="text-right py-2 px-3 text-text-muted font-medium">
                Percentile
              </th>
              <th className="text-right py-2 px-3 text-text-muted font-medium">
                Attestation
              </th>
              <th className="text-right py-2 px-3 text-text-muted font-medium">
                Proposals
              </th>
              <th className="text-right py-2 px-3 text-text-muted font-medium">
                Sync
              </th>
            </tr>
          </thead>
          <tbody>
            {entityBreakdowns.map((eb) => {
              const isExpanded = expandedEntities.has(eb.entity.id);
              const percentile = computePercentile(
                eb.aggregateScore * 100,
                allValidatorScores
              );

              return (
                <EntityRow
                  key={eb.entity.id}
                  eb={eb}
                  percentile={percentile}
                  allValidatorScores={allValidatorScores}
                  isExpanded={isExpanded}
                  onToggle={() => toggleEntity(eb.entity.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EntityRow({
  eb,
  percentile,
  allValidatorScores,
  isExpanded,
  onToggle,
}: {
  eb: EntityBreakdown;
  percentile: number;
  allValidatorScores: number[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      {/* Entity aggregate row */}
      <tr
        className="border-b border-border/50 hover:bg-bg-card-hover/50 cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-2.5 px-3">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown size={14} className="text-text-muted" />
            ) : (
              <ChevronRight size={14} className="text-text-muted" />
            )}
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: eb.entity.color }}
            />
            <span className="text-text-primary font-semibold">
              {eb.entity.name}
            </span>
            <span className="text-xs text-text-muted">
              ({eb.entity.validators.length})
            </span>
          </div>
        </td>
        <td className="text-right py-2.5 px-3">
          <span
            className="font-mono font-bold"
            style={{ color: getScoreColor(eb.aggregateScore) }}
          >
            {(eb.aggregateScore * 100).toFixed(2)}%
          </span>
        </td>
        <td className="text-right py-2.5 px-3 font-mono text-text-secondary">
          P{percentile.toFixed(0)}
        </td>
        <td className="text-right py-2.5 px-3 font-mono text-text-secondary">
          {(eb.aggregateAttestation * 100).toFixed(2)}%
        </td>
        <td className="text-right py-2.5 px-3 font-mono text-text-secondary">
          {eb.aggregateProposal != null
            ? `${(eb.aggregateProposal * 100).toFixed(2)}%`
            : "—"}
        </td>
        <td className="text-right py-2.5 px-3 font-mono text-text-secondary">
          {eb.aggregateSync != null
            ? `${(eb.aggregateSync * 100).toFixed(2)}%`
            : "—"}
        </td>
      </tr>

      {/* Individual validator rows */}
      {isExpanded &&
        eb.validatorBreakdowns.map(({ config, breakdown }) => {
          const vPercentile = computePercentile(
            breakdown.overall * 100,
            allValidatorScores
          );
          return (
            <tr
              key={config.id}
              className="border-b border-border/30 hover:bg-bg-card-hover/30"
            >
              <td className="py-2 px-3 pl-12">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-text-secondary text-xs">
                    {config.name}
                  </span>
                </div>
              </td>
              <td className="text-right py-2 px-3">
                <span
                  className="font-mono text-xs"
                  style={{ color: getScoreColor(breakdown.overall) }}
                >
                  {(breakdown.overall * 100).toFixed(2)}%
                </span>
              </td>
              <td className="text-right py-2 px-3 font-mono text-xs text-text-muted">
                P{vPercentile.toFixed(0)}
              </td>
              <td className="text-right py-2 px-3 font-mono text-xs text-text-muted">
                {(breakdown.attesterEfficiency * 100).toFixed(2)}%
              </td>
              <td className="text-right py-2 px-3 font-mono text-xs text-text-muted">
                {config.onProposalDuty
                  ? `${(breakdown.proposerEfficiency * 100).toFixed(2)}%`
                  : "—"}
              </td>
              <td className="text-right py-2 px-3 font-mono text-xs text-text-muted">
                {config.onSyncCommittee
                  ? `${(breakdown.syncEfficiency * 100).toFixed(2)}%`
                  : "—"}
              </td>
            </tr>
          );
        })}
    </>
  );
}
