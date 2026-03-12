import { ChevronDown, ChevronRight } from "lucide-react";
import { SliderInput } from "./SliderInput";
import type { ValidatorConfig } from "../../lib/types";

interface AttestationControlsProps {
  config: ValidatorConfig;
  onChange: (updates: Partial<ValidatorConfig>) => void;
  advanced: boolean;
  onToggleAdvanced: () => void;
}

export function AttestationControls({
  config,
  onChange,
  advanced,
  onToggleAdvanced,
}: AttestationControlsProps) {
  const simpleRate =
    (config.sourceVoteRate + config.targetVoteRate + config.headVoteRate) / 3;

  const handleSimpleChange = (rate: number) => {
    onChange({
      sourceVoteRate: rate,
      targetVoteRate: rate,
      headVoteRate: rate,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <h3 className="text-sm font-semibold text-text-primary">
            Attestations
          </h3>
          <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded">
            84.4% weight
          </span>
        </div>
        <button
          onClick={onToggleAdvanced}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          {advanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Advanced
        </button>
      </div>

      {!advanced ? (
        <SliderInput
          label="Attestation Success Rate"
          value={simpleRate}
          onChange={handleSimpleChange}
          min={0.8}
          max={1}
          step={0.001}
          tooltip="Percentage of attestation duties performed correctly. In simple mode, all three sub-components (source, target, head) are set to the same rate."
        />
      ) : (
        <div className="space-y-3">
          <SliderInput
            label="Source Vote Rate"
            value={config.sourceVoteRate}
            onChange={(v) => onChange({ sourceVoteRate: v })}
            min={0.8}
            max={1}
            step={0.001}
            tooltip="Source vote accuracy (~26% of attestation weight). Validates the justified checkpoint. Rarely missed unless the validator is offline."
            accentColor="#38bdf8"
          />
          <SliderInput
            label="Target Vote Rate"
            value={config.targetVoteRate}
            onChange={(v) => onChange({ targetVoteRate: v })}
            min={0.8}
            max={1}
            step={0.001}
            tooltip="Target vote accuracy (~48% of attestation weight — the most impactful sub-component). Missing target votes has roughly double the impact of missing head votes."
            accentColor="#a78bfa"
          />
          <SliderInput
            label="Head Vote Rate"
            value={config.headVoteRate}
            onChange={(v) => onChange({ headVoteRate: v })}
            min={0.8}
            max={1}
            step={0.001}
            tooltip="Head vote accuracy (~26% of attestation weight). Can be affected by timing games from large operators who delay block publishing."
            accentColor="#34d399"
          />
          <div className="pt-1 border-t border-border/50">
            <div className="flex gap-3 text-xs text-text-muted mb-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                Source 26%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#a78bfa]" />
                Target 48%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#34d399]" />
                Head 26%
              </span>
            </div>
          </div>
        </div>
      )}

      <SliderInput
        label="Avg. Inclusion Delay"
        value={config.avgInclusionDelay}
        onChange={(v) => onChange({ avgInclusionDelay: v })}
        min={1}
        max={5}
        step={0.1}
        formatValue={(v) => `${v.toFixed(1)} slots`}
        tooltip="Average number of slots before your attestation is included in a block. 1 is perfect (next slot). Higher delays reduce rewards proportionally (1/delay)."
      />
    </div>
  );
}
