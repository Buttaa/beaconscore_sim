import * as Switch from "@radix-ui/react-switch";
import { SliderInput } from "./SliderInput";
import type { ValidatorConfig } from "../../lib/types";

interface SyncControlsProps {
  config: ValidatorConfig;
  onChange: (updates: Partial<ValidatorConfig>) => void;
}

export function SyncControls({ config, onChange }: SyncControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <h3 className="text-sm font-semibold text-text-primary">
            Sync Committee
          </h3>
          <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded">
            3.1% weight
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm text-text-secondary">
          On sync committee this period
        </label>
        <Switch.Root
          checked={config.onSyncCommittee}
          onCheckedChange={(v) => onChange({ onSyncCommittee: v })}
          className={`w-9 h-5 rounded-full transition-colors ${
            config.onSyncCommittee ? "bg-accent" : "bg-border"
          }`}
        >
          <Switch.Thumb
            className={`block w-4 h-4 bg-white rounded-full transition-transform ${
              config.onSyncCommittee
                ? "translate-x-[18px]"
                : "translate-x-[2px]"
            }`}
          />
        </Switch.Root>
      </div>

      {config.onSyncCommittee ? (
        <SliderInput
          label="Sync Participation Rate"
          value={config.syncParticipationRate}
          onChange={(v) => onChange({ syncParticipationRate: v })}
          min={0}
          max={1}
          step={0.01}
          tooltip="Percentage of sync committee duties performed. 8,192 duties across 256 epochs per assignment. Selection is luck-based (~once every 37 months per validator)."
          accentColor="#34d399"
        />
      ) : (
        <p className="text-xs text-text-muted italic">
          Not on sync committee — weight redistributed to other components.
          Selection is purely luck-based (~once every 37 months with 500K
          validators).
        </p>
      )}
    </div>
  );
}
