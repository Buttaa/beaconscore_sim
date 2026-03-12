import { AttestationControls } from "./AttestationControls";
import { ProposalControls } from "./ProposalControls";
import { SyncControls } from "./SyncControls";
import { LuckFactorsPanel } from "./LuckFactorsPanel";
import { PresetBar } from "./PresetBar";
import type { ValidatorConfig, LuckFactors } from "../../lib/types";

interface ControlPanelProps {
  config: ValidatorConfig;
  onChange: (updates: Partial<ValidatorConfig>) => void;
  onApplyPreset: (presetId: string) => void;
  advanced: boolean;
  onToggleAdvanced: () => void;
  activePreset?: string;
}

export function ControlPanel({
  config,
  onChange,
  onApplyPreset,
  advanced,
  onToggleAdvanced,
  activePreset,
}: ControlPanelProps) {
  const handleLuckChange = (luckFactors: LuckFactors) => {
    onChange({ luckFactors });
  };

  return (
    <div className="space-y-6">
      <PresetBar onSelect={onApplyPreset} activePreset={activePreset} />

      <div className="space-y-6 divide-y divide-border/50">
        <AttestationControls
          config={config}
          onChange={onChange}
          advanced={advanced}
          onToggleAdvanced={onToggleAdvanced}
        />

        <div className="pt-6">
          <ProposalControls config={config} onChange={onChange} />
        </div>

        <div className="pt-6">
          <SyncControls config={config} onChange={onChange} />
        </div>

        <div className="pt-6">
          <LuckFactorsPanel
            factors={config.luckFactors}
            onChange={handleLuckChange}
          />
        </div>
      </div>
    </div>
  );
}
