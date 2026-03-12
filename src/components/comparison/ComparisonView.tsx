import { useMemo, useState } from "react";
import { Plus, Share2, ChevronDown, ChevronRight, Settings2 } from "lucide-react";
import { useValidatorStore } from "../../store/validator-store";
import { calculateEntityBreakdown } from "../../lib/calculator";
import { getShareUrl } from "../../lib/url-state";
import { EntityCard } from "./EntityCard";
import { PercentileChart } from "./PercentileChart";
import { ComparisonTable } from "./ComparisonTable";
import { ComparisonChart } from "./ComparisonChart";
import { ComparisonRadar } from "./ComparisonRadar";

export function ComparisonView() {
  const {
    entities,
    addEntity,
    removeEntity,
    updateEntity,
    addValidatorToEntity,
    removeValidatorFromEntity,
    updateValidatorInEntity,
    applyPresetToValidatorInEntity,
  } = useValidatorStore();

  const [entitiesExpanded, setEntitiesExpanded] = useState(false);

  const entityBreakdowns = useMemo(
    () => entities.map(calculateEntityBreakdown),
    [entities]
  );

  // All validator scores sorted for percentile computation
  const allValidatorScores = useMemo(
    () =>
      entityBreakdowns
        .flatMap((eb) => eb.validatorBreakdowns.map((vb) => vb.breakdown.overall * 100))
        .sort((a, b) => a - b),
    [entityBreakdowns]
  );

  const handleShare = async () => {
    const url = getShareUrl(entities);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Compare Entities
          </h2>
          <span className="text-xs text-text-muted">
            {entities.length}/4 entities &middot;{" "}
            {allValidatorScores.length} validators
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-secondary text-text-secondary hover:text-text-primary border border-border/50 transition-colors"
          >
            <Share2 size={14} />
            Share
          </button>
          {entities.length < 4 && (
            <button
              onClick={addEntity}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
            >
              <Plus size={14} />
              Add Entity
            </button>
          )}
        </div>
      </div>

      {/* Full-width: Percentile Distribution Chart */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <PercentileChart entityBreakdowns={entityBreakdowns} />
      </div>

      {/* Full-width: Summary Table */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <ComparisonTable
          entityBreakdowns={entityBreakdowns}
          allValidatorScores={allValidatorScores}
        />
      </div>

      {/* Expandable Entity Configuration Section */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setEntitiesExpanded(!entitiesExpanded)}
          className="flex items-center justify-between w-full p-5 hover:bg-bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 size={16} className="text-text-muted" />
            <h3 className="text-sm font-semibold text-text-primary">
              Entity Configuration
            </h3>
            <span className="text-xs text-text-muted">
              Adjust validator parameters for each entity
            </span>
          </div>
          {entitiesExpanded ? (
            <ChevronDown size={16} className="text-text-muted" />
          ) : (
            <ChevronRight size={16} className="text-text-muted" />
          )}
        </button>

        {entitiesExpanded && (
          <div className="border-t border-border p-5 space-y-4">
            {entities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                allValidatorScores={allValidatorScores}
                onUpdateEntity={(updates) => updateEntity(entity.id, updates)}
                onRemoveEntity={() => removeEntity(entity.id)}
                onAddValidator={() => addValidatorToEntity(entity.id)}
                onRemoveValidator={(vId) =>
                  removeValidatorFromEntity(entity.id, vId)
                }
                onUpdateValidator={(vId, updates) =>
                  updateValidatorInEntity(entity.id, vId, updates)
                }
                onApplyPresetToValidator={(vId, presetId) =>
                  applyPresetToValidatorInEntity(entity.id, vId, presetId)
                }
                canRemoveEntity={entities.length > 2}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full-width charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <ComparisonChart entityBreakdowns={entityBreakdowns} />
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-5">
          <ComparisonRadar entityBreakdowns={entityBreakdowns} />
        </div>
      </div>
    </div>
  );
}
