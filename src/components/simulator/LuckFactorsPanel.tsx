import * as Collapsible from "@radix-ui/react-collapsible";
import * as Switch from "@radix-ui/react-switch";
import { useState } from "react";
import { ChevronDown, ChevronRight, Dice5 } from "lucide-react";
import { SliderInput } from "./SliderInput";
import { InfoTooltip } from "../education/InfoTooltip";
import type { LuckFactors } from "../../lib/types";

interface LuckFactorsPanelProps {
  factors: LuckFactors;
  onChange: (factors: LuckFactors) => void;
}

export function LuckFactorsPanel({ factors, onChange }: LuckFactorsPanelProps) {
  const [open, setOpen] = useState(true);

  const update = (partial: Partial<LuckFactors>) => {
    onChange({ ...factors, ...partial });
  };

  const hasActiveLuck =
    factors.missedSlotRate > 0 ||
    factors.nonFinalityActive ||
    factors.timingGameImpact > 0 ||
    factors.missedBlocksDuringSyncRate > 0 ||
    factors.proposerContext !== "average";

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button className="flex items-center justify-between w-full group">
          <div className="flex items-center gap-2">
            <Dice5 size={16} className="text-text-muted" />
            <h3 className="text-sm font-semibold text-text-primary">
              Network Conditions / Luck Factors
            </h3>
            {hasActiveLuck && (
              <span className="w-2 h-2 rounded-full bg-score-warning animate-pulse" />
            )}
          </div>
          {open ? (
            <ChevronDown size={16} className="text-text-muted" />
          ) : (
            <ChevronRight size={16} className="text-text-muted" />
          )}
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content className="mt-4 space-y-4">
        <div className="bg-bg-secondary/50 border border-border/50 rounded-lg p-3">
          <p className="text-xs text-text-muted leading-relaxed">
            These factors are outside your control and stochastic — they tend to
            even out over 30+ day evaluation windows. Short windows (24h, 7d)
            can be significantly influenced by these effects.
          </p>
        </div>

        <SliderInput
          label="Network Missed Slot Rate"
          value={factors.missedSlotRate}
          onChange={(v) => update({ missedSlotRate: v })}
          min={0}
          max={0.1}
          step={0.001}
          formatValue={(v) => `${(v * 100).toFixed(1)}%`}
          tooltip="When the next block proposer misses their slot, your correct attestation gets delayed or excluded — increasing your inclusion delay through no fault of your own."
          accentColor="#f97316"
        />

        <SliderInput
          label="Timing Game Impact"
          value={factors.timingGameImpact}
          onChange={(v) => update({ timingGameImpact: v })}
          min={0}
          max={0.2}
          step={0.005}
          formatValue={(v) => `${(v * 100).toFixed(1)}%`}
          tooltip="Some large staking pools delay publishing blocks to capture additional MEV. This causes honest validators to not see the correct chain head in time, leading to incorrect head votes."
          accentColor="#f97316"
        />

        <SliderInput
          label="Missed Blocks During Sync Duty"
          value={factors.missedBlocksDuringSyncRate}
          onChange={(v) => update({ missedBlocksDuringSyncRate: v })}
          min={0}
          max={0.3}
          step={0.01}
          formatValue={(v) => `${(v * 100).toFixed(0)}%`}
          tooltip="If elected to sync committee during a period when many block proposers miss their slots, your sync participation cannot be included in a block, reducing sync efficiency."
          accentColor="#f97316"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="text-sm text-text-secondary">
                Proposer Context
              </label>
              <InfoTooltip content="Proposer efficiency is measured against the median CL reward of 32 surrounding proposals. If surrounding proposals are unusually high-value, your efficiency looks worse — and vice versa." />
            </div>
            <select
              value={factors.proposerContext}
              onChange={(e) =>
                update({
                  proposerContext: e.target.value as LuckFactors["proposerContext"],
                })
              }
              className="bg-bg-secondary border border-border rounded px-2 py-1 text-sm text-text-primary"
            >
              <option value="low">Low Activity (+15%)</option>
              <option value="average">Average</option>
              <option value="high">High Activity (-15%)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="text-sm text-text-secondary">
                Non-Finality Event
              </label>
              <InfoTooltip content="If more than 1/3 of the network goes offline, the chain enters a non-finality state. During this period, correctly performing validators still receive reduced rewards." />
            </div>
            <Switch.Root
              checked={factors.nonFinalityActive}
              onCheckedChange={(v) => update({ nonFinalityActive: v })}
              className={`w-9 h-5 rounded-full transition-colors ${
                factors.nonFinalityActive ? "bg-score-warning" : "bg-border"
              }`}
            >
              <Switch.Thumb
                className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                  factors.nonFinalityActive
                    ? "translate-x-[18px]"
                    : "translate-x-[2px]"
                }`}
              />
            </Switch.Root>
          </div>

          {factors.nonFinalityActive && (
            <SliderInput
              label="Reward Reduction Severity"
              value={factors.nonFinalitySeverity}
              onChange={(v) => update({ nonFinalitySeverity: v })}
              min={0.5}
              max={1}
              step={0.01}
              formatValue={(v) => `${(v * 100).toFixed(0)}% of normal`}
              tooltip="How severely rewards are reduced during the non-finality event. 50% means rewards are halved."
              accentColor="#ef4444"
            />
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
