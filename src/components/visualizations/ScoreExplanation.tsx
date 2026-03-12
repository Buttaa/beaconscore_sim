import { useMemo } from "react";
import {
  generateExplanation,
  generatePresetChanges,
} from "../../lib/calculator";
import type { ValidatorConfig, ScoreBreakdown } from "../../lib/types";

interface ScoreExplanationProps {
  config: ValidatorConfig;
  breakdown: ScoreBreakdown;
  activePresetId?: string | null;
}

export function ScoreExplanation({
  config,
  breakdown,
  activePresetId,
}: ScoreExplanationProps) {
  const explanation = generateExplanation(config, breakdown);
  const presetInfo = useMemo(
    () => (activePresetId ? generatePresetChanges(activePresetId) : null),
    [activePresetId]
  );

  return (
    <div className="space-y-3">
      {/* Preset context banner */}
      {presetInfo && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Preset
            </span>
            <span className="text-sm font-semibold text-text-primary">
              {presetInfo.preset.name}
            </span>
          </div>
          <p className="text-xs text-text-secondary mb-3 leading-relaxed">
            {presetInfo.preset.description}
          </p>
          {presetInfo.changes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted mb-1.5">
                Modified parameters:
              </p>
              <ul className="space-y-1">
                {presetInfo.changes.map((change, i) => (
                  <li
                    key={i}
                    className="text-xs text-text-secondary flex items-start gap-1.5"
                  >
                    <span className="text-accent mt-0.5 shrink-0">&#x2022;</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Score analysis */}
      <div className="bg-bg-secondary/50 border border-border/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-secondary mb-2">
          Analysis
        </h3>
        <p className="text-sm text-text-primary leading-relaxed">
          {explanation}
        </p>
      </div>
    </div>
  );
}
