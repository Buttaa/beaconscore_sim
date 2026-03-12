import { useMemo } from "react";
import { useValidatorStore } from "../../store/validator-store";
import { calculateBeaconScore } from "../../lib/calculator";
import { ControlPanel } from "./ControlPanel";
import { ScoreGauge } from "../visualizations/ScoreGauge";
import { ComponentBreakdown } from "../visualizations/ComponentBreakdown";
import { ImpactRadar } from "../visualizations/ImpactRadar";
import { ScoreExplanation } from "../visualizations/ScoreExplanation";
import { HowItWorks } from "../education/HowItWorks";

export function SimulatorView() {
  const {
    simulator,
    updateSimulator,
    applyPreset,
    activePresetId,
    advancedAttestation,
    setAdvancedAttestation,
  } = useValidatorStore();

  const breakdown = useMemo(
    () => calculateBeaconScore(simulator),
    [simulator]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <HowItWorks />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Controls */}
        <div className="lg:col-span-2">
          <div className="bg-bg-card border border-border rounded-xl p-5 sticky top-6">
            <ControlPanel
              config={simulator}
              onChange={updateSimulator}
              onApplyPreset={applyPreset}
              advanced={advancedAttestation}
              onToggleAdvanced={() =>
                setAdvancedAttestation(!advancedAttestation)
              }
              activePreset={activePresetId ?? undefined}
            />
          </div>
        </div>

        {/* Visualizations */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <ScoreGauge score={breakdown.overall} />
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-5">
            <ScoreExplanation
              config={simulator}
              breakdown={breakdown}
              activePresetId={activePresetId}
            />
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-5">
            <ComponentBreakdown
              breakdown={breakdown}
              showProposals={simulator.onProposalDuty}
              showSync={simulator.onSyncCommittee}
            />
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-5">
            <ImpactRadar
              breakdown={breakdown}
              showProposals={simulator.onProposalDuty}
              showSync={simulator.onSyncCommittee}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
