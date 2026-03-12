import * as Switch from "@radix-ui/react-switch";
import { SliderInput } from "./SliderInput";
import type { ValidatorConfig } from "../../lib/types";

interface ProposalControlsProps {
  config: ValidatorConfig;
  onChange: (updates: Partial<ValidatorConfig>) => void;
}

export function ProposalControls({ config, onChange }: ProposalControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <h3 className="text-sm font-semibold text-text-primary">
            Block Proposals
          </h3>
          <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded">
            12.5% weight
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm text-text-secondary">
          Assigned proposals this period
        </label>
        <Switch.Root
          checked={config.onProposalDuty}
          onCheckedChange={(v) => onChange({ onProposalDuty: v })}
          className={`w-9 h-5 rounded-full transition-colors ${
            config.onProposalDuty ? "bg-accent" : "bg-border"
          }`}
        >
          <Switch.Thumb
            className={`block w-4 h-4 bg-white rounded-full transition-transform ${
              config.onProposalDuty ? "translate-x-[18px]" : "translate-x-[2px]"
            }`}
          />
        </Switch.Root>
      </div>

      {config.onProposalDuty ? (
        <SliderInput
          label="Proposal Efficiency"
          value={config.proposalEfficiency}
          onChange={(v) => onChange({ proposalEfficiency: v })}
          min={0}
          max={1}
          step={0.01}
          tooltip="How efficiently you proposed blocks compared to the median of 32 surrounding proposals. Only CL rewards are considered (EL/MEV excluded). 0% = completely missed, 100% = at or above median."
          accentColor="#f59e0b"
        />
      ) : (
        <p className="text-xs text-text-muted italic">
          No proposals assigned — weight redistributed to other components.
          Proposal assignment is purely luck-based (~1 proposal every 2 months
          for a single validator).
        </p>
      )}
    </div>
  );
}
