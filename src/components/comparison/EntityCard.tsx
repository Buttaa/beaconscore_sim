import { useMemo, useState } from "react";
import { X, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { calculateEntityBreakdown, getScoreColor } from "../../lib/calculator";
import { computePercentile } from "./PercentileChart";
import { ValidatorSubCard } from "./ValidatorSubCard";
import type { EntityConfig, ValidatorConfig } from "../../lib/types";

interface EntityCardProps {
  entity: EntityConfig;
  allValidatorScores: number[];
  onUpdateEntity: (updates: Partial<Pick<EntityConfig, "name" | "color">>) => void;
  onRemoveEntity: () => void;
  onAddValidator: () => void;
  onRemoveValidator: (validatorId: string) => void;
  onUpdateValidator: (validatorId: string, updates: Partial<ValidatorConfig>) => void;
  onApplyPresetToValidator: (validatorId: string, presetId: string) => void;
  canRemoveEntity: boolean;
}

export function EntityCard({
  entity,
  allValidatorScores,
  onUpdateEntity,
  onRemoveEntity,
  onAddValidator,
  onRemoveValidator,
  onUpdateValidator,
  onApplyPresetToValidator,
  canRemoveEntity,
}: EntityCardProps) {
  const [expanded, setExpanded] = useState(true);
  const entityBreakdown = useMemo(
    () => calculateEntityBreakdown(entity),
    [entity]
  );
  const aggregatePct = (entityBreakdown.aggregateScore * 100).toFixed(2);
  const scoreColor = getScoreColor(entityBreakdown.aggregateScore);
  const percentile = computePercentile(
    entityBreakdown.aggregateScore * 100,
    allValidatorScores
  );

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      {/* Entity header */}
      <div
        className="p-4 cursor-pointer hover:bg-bg-card-hover transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-3.5 rounded-sm"
              style={{ backgroundColor: entity.color }}
            />
            <input
              type="text"
              value={entity.name}
              onChange={(e) => onUpdateEntity({ name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border-none text-text-primary font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-accent rounded px-1 -ml-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-bold font-mono"
                style={{ color: scoreColor }}
              >
                {aggregatePct}%
              </span>
              <span className="text-xs text-text-muted bg-bg-secondary rounded-md px-2 py-0.5 font-medium">
                P{percentile.toFixed(0)}
              </span>
            </div>
            <span className="text-xs text-text-muted">
              {entity.validators.length} validator{entity.validators.length !== 1 ? "s" : ""}
            </span>
            {canRemoveEntity && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveEntity();
                }}
                className="text-text-muted hover:text-score-poor transition-colors"
              >
                <X size={16} />
              </button>
            )}
            {expanded ? (
              <ChevronDown size={16} className="text-text-muted" />
            ) : (
              <ChevronRight size={16} className="text-text-muted" />
            )}
          </div>
        </div>
      </div>

      {/* Validators list */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 space-y-2 pt-3">
          {entity.validators.map((v) => (
            <ValidatorSubCard
              key={v.id}
              config={v}
              allValidatorScores={allValidatorScores}
              onChange={(updates) => onUpdateValidator(v.id, updates)}
              onRemove={() => onRemoveValidator(v.id)}
              onApplyPreset={(presetId) =>
                onApplyPresetToValidator(v.id, presetId)
              }
              canRemove={entity.validators.length > 1}
            />
          ))}

          {entity.validators.length < 6 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddValidator();
              }}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors mt-2"
            >
              <Plus size={14} />
              Add Validator
            </button>
          )}
        </div>
      )}
    </div>
  );
}
