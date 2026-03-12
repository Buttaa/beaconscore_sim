import type { ValidatorConfig, ScoreBreakdown, Preset, EntityConfig, EntityBreakdown } from "./types";
import {
  WEIGHT_ATTESTER,
  WEIGHT_PROPOSER,
  WEIGHT_SYNC,
  ATTEST_SOURCE_WEIGHT,
  ATTEST_TARGET_WEIGHT,
  ATTEST_HEAD_WEIGHT,
  PROPOSER_CONTEXT_MULTIPLIERS,
  PRESETS,
  DEFAULT_LUCK_FACTORS,
} from "./constants";

/**
 * Calculate the full BeaconScore breakdown for a validator configuration.
 *
 * BeaconScore = actual_rewards / ideal_rewards, using protocol-native weights.
 * When a component is absent (no proposals / not on sync committee),
 * its weight is redistributed proportionally among active components.
 */
export function calculateBeaconScore(config: ValidatorConfig): ScoreBreakdown {
  const luck = config.luckFactors;

  // --- Attestation Efficiency ---
  // Apply luck factors: timing games reduce effective head vote rate
  const effectiveHeadRate = Math.max(
    0,
    config.headVoteRate - luck.timingGameImpact
  );

  // Sub-component efficiencies
  const sourceComponent = config.sourceVoteRate;
  const targetComponent = config.targetVoteRate;
  const headComponent = effectiveHeadRate;

  // Weighted attestation accuracy (before inclusion delay)
  const attestAccuracy =
    sourceComponent * ATTEST_SOURCE_WEIGHT +
    targetComponent * ATTEST_TARGET_WEIGHT +
    headComponent * ATTEST_HEAD_WEIGHT;

  // Effective inclusion delay: base delay increased by network missed slot rate
  // Each missed slot adds ~1 to the delay for affected attestations
  const effectiveInclusionDelay =
    config.avgInclusionDelay + luck.missedSlotRate * 3; // 3x amplification factor

  // Attester efficiency = accuracy * (1 / inclusionDelay)
  let attesterEfficiency = attestAccuracy * (1 / effectiveInclusionDelay);

  // Non-finality reduces all rewards
  if (luck.nonFinalityActive) {
    attesterEfficiency *= luck.nonFinalitySeverity;
  }

  // --- Proposer Efficiency ---
  let proposerEfficiency = config.proposalEfficiency;

  // Apply proposer context (surrounding proposal activity affects comparison)
  const contextMultiplier =
    PROPOSER_CONTEXT_MULTIPLIERS[luck.proposerContext];
  proposerEfficiency = Math.min(1, proposerEfficiency * contextMultiplier);

  if (luck.nonFinalityActive) {
    proposerEfficiency *= luck.nonFinalitySeverity;
  }

  // --- Sync Efficiency ---
  // Missed blocks during sync duty reduce effective sync participation
  let syncEfficiency =
    config.syncParticipationRate * (1 - luck.missedBlocksDuringSyncRate);

  if (luck.nonFinalityActive) {
    syncEfficiency *= luck.nonFinalitySeverity;
  }

  // --- Weight Redistribution ---
  const hasProposals = config.onProposalDuty;
  const hasSync = config.onSyncCommittee;

  let attesterWeight = WEIGHT_ATTESTER;
  let proposerWeight = hasProposals ? WEIGHT_PROPOSER : 0;
  let syncWeight = hasSync ? WEIGHT_SYNC : 0;

  // Normalize weights to sum to 1
  const totalWeight = attesterWeight + proposerWeight + syncWeight;
  attesterWeight /= totalWeight;
  proposerWeight /= totalWeight;
  syncWeight /= totalWeight;

  // --- Final Score ---
  const attesterContribution = attesterEfficiency * attesterWeight;
  const proposerContribution = proposerEfficiency * proposerWeight;
  const syncContribution = syncEfficiency * syncWeight;

  const overall = attesterContribution + proposerContribution + syncContribution;

  return {
    overall: clamp(overall, 0, 1),
    attesterEfficiency: clamp(attesterEfficiency, 0, 1),
    proposerEfficiency: clamp(proposerEfficiency, 0, 1),
    syncEfficiency: clamp(syncEfficiency, 0, 1),
    attesterContribution,
    proposerContribution,
    syncContribution,
    attesterWeight,
    proposerWeight,
    syncWeight,
    sourceComponent,
    targetComponent,
    headComponent,
    effectiveInclusionDelay,
  };
}

/**
 * Get the score color based on thresholds.
 */
export function getScoreColor(score: number): string {
  const pct = score * 100;
  if (pct >= 99.5) return "#22c55e";
  if (pct >= 99.0) return "#84cc16";
  if (pct >= 98.0) return "#f59e0b";
  return "#ef4444";
}

/**
 * Get a human-readable label for the score.
 */
export function getScoreLabel(score: number): string {
  const pct = score * 100;
  if (pct >= 99.5) return "Exceptional";
  if (pct >= 99.0) return "Good";
  if (pct >= 98.0) return "Needs Attention";
  return "Poor";
}

/**
 * Generate a dynamic explanation of the score.
 */
export function generateExplanation(
  config: ValidatorConfig,
  breakdown: ScoreBreakdown
): string {
  const pct = (breakdown.overall * 100).toFixed(2);
  const parts: string[] = [];

  parts.push(`Your BeaconScore is ${pct}%.`);

  if (breakdown.overall >= 0.999) {
    parts.push("This is near-perfect performance across all duties.");
    return parts.join(" ");
  }

  // Find the biggest drag
  const drags: { name: string; impact: number; detail: string }[] = [];

  if (breakdown.attesterEfficiency < 1) {
    const loss = (1 - breakdown.attesterEfficiency) * breakdown.attesterWeight * 100;
    const details: string[] = [];

    if (config.targetVoteRate < 1) {
      details.push(
        `target vote rate (${(config.targetVoteRate * 100).toFixed(1)}%, carries 48% of attestation weight)`
      );
    }
    if (config.sourceVoteRate < 1) {
      details.push(
        `source vote rate (${(config.sourceVoteRate * 100).toFixed(1)}%)`
      );
    }
    if (breakdown.headComponent < config.headVoteRate) {
      details.push(
        `head vote rate reduced by timing games to ${(breakdown.headComponent * 100).toFixed(1)}%`
      );
    } else if (config.headVoteRate < 1) {
      details.push(
        `head vote rate (${(config.headVoteRate * 100).toFixed(1)}%)`
      );
    }
    if (breakdown.effectiveInclusionDelay > 1.05) {
      details.push(
        `effective inclusion delay of ${breakdown.effectiveInclusionDelay.toFixed(2)} slots`
      );
    }

    drags.push({
      name: "Attestation",
      impact: loss,
      detail: details.length > 0 ? details.join(", ") : "reduced attestation performance",
    });
  }

  if (config.onProposalDuty && breakdown.proposerEfficiency < 1) {
    const loss = (1 - breakdown.proposerEfficiency) * breakdown.proposerWeight * 100;
    drags.push({
      name: "Proposals",
      impact: loss,
      detail: `proposal efficiency at ${(breakdown.proposerEfficiency * 100).toFixed(1)}%`,
    });
  }

  if (config.onSyncCommittee && breakdown.syncEfficiency < 1) {
    const loss = (1 - breakdown.syncEfficiency) * breakdown.syncWeight * 100;
    drags.push({
      name: "Sync Committee",
      impact: loss,
      detail: `sync participation at ${(breakdown.syncEfficiency * 100).toFixed(1)}%`,
    });
  }

  drags.sort((a, b) => b.impact - a.impact);

  if (drags.length > 0) {
    const main = drags[0];
    parts.push(
      `The main drag is ${main.name.toLowerCase()} performance (−${main.impact.toFixed(2)}pp): ${main.detail}.`
    );

    if (drags.length > 1) {
      const others = drags
        .slice(1)
        .map((d) => `${d.name.toLowerCase()} (−${d.impact.toFixed(2)}pp)`)
        .join(", ");
      parts.push(`Also affected by ${others}.`);
    }
  }

  if (config.luckFactors.nonFinalityActive) {
    parts.push(
      "Non-finality event is active, reducing all rewards — this is outside your control."
    );
  }

  return parts.join(" ");
}

/**
 * Generate a description of what a preset changed from default and why.
 */
export function generatePresetChanges(presetId: string): {
  preset: Preset;
  changes: string[];
} | null {
  const preset = PRESETS.find((p) => p.id === presetId);
  if (!preset) return null;

  const cfg = preset.config;
  const changes: string[] = [];

  // Attestation changes
  if (cfg.sourceVoteRate !== undefined && cfg.sourceVoteRate < 1) {
    changes.push(
      `Source vote rate → ${(cfg.sourceVoteRate * 100).toFixed(1)}% (default: 100%)`
    );
  }
  if (cfg.targetVoteRate !== undefined && cfg.targetVoteRate < 1) {
    changes.push(
      `Target vote rate → ${(cfg.targetVoteRate * 100).toFixed(1)}% (default: 100%, carries 48% of attestation weight)`
    );
  }
  if (cfg.headVoteRate !== undefined && cfg.headVoteRate < 1) {
    changes.push(
      `Head vote rate → ${(cfg.headVoteRate * 100).toFixed(1)}% (default: 100%)`
    );
  }
  if (cfg.avgInclusionDelay !== undefined && cfg.avgInclusionDelay > 1) {
    changes.push(
      `Avg. inclusion delay → ${cfg.avgInclusionDelay.toFixed(1)} slots (default: 1.0, rewards scale as 1/delay)`
    );
  }

  // Proposal changes
  if (cfg.onProposalDuty === false) {
    changes.push("Block proposals → disabled (weight redistributed)");
  } else if (cfg.proposalEfficiency !== undefined && cfg.proposalEfficiency < 1) {
    changes.push(
      `Proposal efficiency → ${(cfg.proposalEfficiency * 100).toFixed(0)}% (default: 100%, 12.5% of total weight)`
    );
  }

  // Sync changes
  if (cfg.onSyncCommittee === false) {
    changes.push("Sync committee → disabled (weight redistributed)");
  } else if (
    cfg.syncParticipationRate !== undefined &&
    cfg.syncParticipationRate < 1
  ) {
    changes.push(
      `Sync participation → ${(cfg.syncParticipationRate * 100).toFixed(0)}% (default: 100%, 3.1% of total weight)`
    );
  }

  // Luck factor changes
  const lf = cfg.luckFactors;
  if (lf) {
    if (lf.missedSlotRate && lf.missedSlotRate > DEFAULT_LUCK_FACTORS.missedSlotRate) {
      changes.push(
        `Network missed slot rate → ${(lf.missedSlotRate * 100).toFixed(1)}% (increases inclusion delay through no fault of your own)`
      );
    }
    if (lf.timingGameImpact && lf.timingGameImpact > DEFAULT_LUCK_FACTORS.timingGameImpact) {
      changes.push(
        `Timing game impact → ${(lf.timingGameImpact * 100).toFixed(1)}% (large operators delay blocks for MEV, reducing your head vote accuracy)`
      );
    }
    if (
      lf.missedBlocksDuringSyncRate &&
      lf.missedBlocksDuringSyncRate > DEFAULT_LUCK_FACTORS.missedBlocksDuringSyncRate
    ) {
      changes.push(
        `Missed blocks during sync → ${(lf.missedBlocksDuringSyncRate * 100).toFixed(0)}% (proposers missing slots while you're on sync committee)`
      );
    }
    if (lf.proposerContext && lf.proposerContext !== "average") {
      const label =
        lf.proposerContext === "high"
          ? "High activity (your proposals look worse vs. high-value neighbors)"
          : "Low activity (your proposals look better vs. low-value neighbors)";
      changes.push(`Proposer context → ${label}`);
    }
    if (lf.nonFinalityActive) {
      changes.push(
        `Non-finality event → active at ${((lf.nonFinalitySeverity ?? 1) * 100).toFixed(0)}% reward severity (>1/3 of network offline)`
      );
    }
  }

  return { preset, changes };
}

/**
 * Calculate aggregate breakdown for an entity (multiple validators).
 */
export function calculateEntityBreakdown(entity: EntityConfig): EntityBreakdown {
  const validatorBreakdowns = entity.validators.map((v) => ({
    config: v,
    breakdown: calculateBeaconScore(v),
  }));

  const scores = validatorBreakdowns.map((vb) => vb.breakdown.overall);
  const aggregateScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const aggregateAttestation =
    validatorBreakdowns.reduce((a, vb) => a + vb.breakdown.attesterEfficiency, 0) /
    validatorBreakdowns.length;

  // Only average over validators that have the duty active
  const proposerVbs = validatorBreakdowns.filter((vb) => vb.config.onProposalDuty);
  const aggregateProposal =
    proposerVbs.length > 0
      ? proposerVbs.reduce((a, vb) => a + vb.breakdown.proposerEfficiency, 0) /
        proposerVbs.length
      : null;

  const syncVbs = validatorBreakdowns.filter((vb) => vb.config.onSyncCommittee);
  const aggregateSync =
    syncVbs.length > 0
      ? syncVbs.reduce((a, vb) => a + vb.breakdown.syncEfficiency, 0) / syncVbs.length
      : null;

  return {
    entity,
    validatorBreakdowns,
    aggregateScore,
    aggregateAttestation,
    aggregateProposal,
    aggregateSync,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
