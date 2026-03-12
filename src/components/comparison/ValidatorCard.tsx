import { useMemo, useState } from "react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { calculateBeaconScore, getScoreColor } from "../../lib/calculator";
import { PRESETS } from "../../lib/constants";
import { ControlPanel } from "../simulator/ControlPanel";
import type { ValidatorConfig } from "../../lib/types";

interface ValidatorCardProps {
  config: ValidatorConfig;
  onChange: (updates: Partial<ValidatorConfig>) => void;
  onRemove: () => void;
  onApplyPreset: (presetId: string) => void;
  canRemove: boolean;
}

export function ValidatorCard({
  config,
  onChange,
  onRemove,
  onApplyPreset,
  canRemove,
}: ValidatorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const breakdown = useMemo(() => calculateBeaconScore(config), [config]);
  const color = getScoreColor(breakdown.overall);
  const pct = (breakdown.overall * 100).toFixed(2);

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-bg-card-hover transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <input
              type="text"
              value={config.name}
              onChange={(e) => onChange({ name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border-none text-text-primary font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-accent rounded px-1 -ml-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold font-mono" style={{ color }}>
              {pct}%
            </span>
            {canRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
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

        {/* Mini stats row */}
        <div className="flex gap-4 mt-2 text-xs text-text-muted">
          <span>
            Attest: {(breakdown.attesterEfficiency * 100).toFixed(1)}%
          </span>
          {config.onProposalDuty && (
            <span>
              Proposals: {(breakdown.proposerEfficiency * 100).toFixed(1)}%
            </span>
          )}
          {config.onSyncCommittee && (
            <span>
              Sync: {(breakdown.syncEfficiency * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-4">
          {/* Quick preset selector */}
          <div className="mb-4">
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
