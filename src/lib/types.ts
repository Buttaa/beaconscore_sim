export interface ValidatorConfig {
  id: string;
  name: string;
  color: string;

  // Attestation
  sourceVoteRate: number; // 0-1
  targetVoteRate: number; // 0-1
  headVoteRate: number; // 0-1
  avgInclusionDelay: number; // 1-5

  // Proposals
  onProposalDuty: boolean;
  proposalEfficiency: number; // 0-1

  // Sync Committee
  onSyncCommittee: boolean;
  syncParticipationRate: number; // 0-1

  // Luck / Network Conditions
  luckFactors: LuckFactors;
}

export interface LuckFactors {
  missedSlotRate: number; // 0-0.1 (0-10%) - increases inclusion delay
  nonFinalityActive: boolean;
  nonFinalitySeverity: number; // 0.5-1.0 reward multiplier
  timingGameImpact: number; // 0-0.2 - reduces head vote rate
  missedBlocksDuringSyncRate: number; // 0-0.3 - reduces sync efficiency
  proposerContext: "low" | "average" | "high"; // surrounding proposal activity
}

export interface ScoreBreakdown {
  overall: number;
  attesterEfficiency: number;
  proposerEfficiency: number;
  syncEfficiency: number;

  // Weighted contributions
  attesterContribution: number;
  proposerContribution: number;
  syncContribution: number;

  // Active weights (after redistribution)
  attesterWeight: number;
  proposerWeight: number;
  syncWeight: number;

  // Sub-components for attestation
  sourceComponent: number;
  targetComponent: number;
  headComponent: number;
  effectiveDelay: number;
  flagCaps: { source: number; target: number; head: number };
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: Partial<ValidatorConfig>;
}

export interface EntityConfig {
  id: string;
  name: string;
  color: string;
  validators: ValidatorConfig[];
}

export interface EntityBreakdown {
  entity: EntityConfig;
  validatorBreakdowns: { config: ValidatorConfig; breakdown: ScoreBreakdown }[];
  aggregateScore: number;
  aggregateAttestation: number;
  aggregateProposal: number | null;
  aggregateSync: number | null;
}

export type AppMode = "simulator" | "compare";
