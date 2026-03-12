import { useMemo, useState } from "react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { calculateBeaconScore, getScoreColor } from "../../lib/calculator";
import { computePercentile } from "./PercentileChart";
import { PRESETS } from "../../lib/constants";
import { ControlPanel } from "../simulator/ControlPanel";
import type { ValidatorConfig } from "../../lib/types";

interface ValidatorSubCardProps {
  config: ValidatorConfig;
  allValidatorScores: number[];
  onChange: (updates: Partial<ValidatorConfig>) => void;
  onRemove: () => void;
  onApplyPreset: (presetId: string) => void;
  canRemove: boolean;
}

export function ValidatorSubCard({
  config,
  allValidatorScores,
  onChange,
  onRemove,
  onApplyPreset,
  canRemove,
}: ValidatorSubCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const breakdown = useMemo(() => calculateBeaconScore(config), [config]);
  const color = getScoreColor(breakdown.overall);
  const pct = (breakdown.overall * 100).toFixed(2);
  const percentile = computePercentile(breakdown.overall * 100, allValidatorScores);

  return (
    <div className="bg-bg-secondary/50 border border-border/50 rounded-lg overflow-hidden">
      <div
        className="px-3 py-2.5 cursor-pointer hover:bg-bg-secondary transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <input
              type="text"
              value={config.name}
              onChange={(e) => onChange({ name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border-none text-text-secondary text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent rounded px-1 -ml-1 w-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold font-mono"
              style={{ color }}
            >
              {pct}%
            </span>
            <span className="text-[10px] text-text-muted bg-bg-secondary rounded px-1.5 py-0.5">
              P{percentile.toFixed(0)}
            </span>
            {canRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="text-text-muted hover:text-score-poor transition-colors"
              >
                <X size={14} />
              </button>
            )}
            {expanded ? (
              <ChevronDown size={14} className="text-text-muted" />
            ) : (
              <ChevronRight size={14} className="text-text-muted" />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/50 p-3">
          <div className="mb-3">
            <label className="text-xs text-text-muted">Quick preset:</label>
            <select
              onChange={(e) => {
                if (e.target.value) onApplyPreset(e.target.value);
              }}
              defaultValue=""
              className="ml-2 bg-bg-secondary border border-border rounded px-2 py-1 text-xs text-text-primary"
            >
              <option value="">Select...</option>
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <ControlPanel
            config={config}
            onChange={onChange}
            onApplyPreset={onApplyPreset}
            advanced={advanced}
            onToggleAdvanced={() => setAdvanced(!advanced)}
          />
        </div>
      )}
    </div>
  );
}
