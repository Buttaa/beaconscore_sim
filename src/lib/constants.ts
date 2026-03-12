import type { EntityConfig, LuckFactors, Preset, ValidatorConfig } from "./types";

// Protocol-native weights from the Ethereum CL spec
export const WEIGHT_ATTESTER = 54 / 64; // 0.84375
export const WEIGHT_PROPOSER = 8 / 64; // 0.125
export const WEIGHT_SYNC = 2 / 64; // 0.03125

// Attestation sub-weights (within the attestation component)
export const ATTEST_SOURCE_WEIGHT = 14 / 54; // ~0.2593
export const ATTEST_TARGET_WEIGHT = 26 / 54; // ~0.4815
export const ATTEST_HEAD_WEIGHT = 14 / 54; // ~0.2593

// Proposer context multipliers (how surrounding proposals affect your efficiency comparison)
export const PROPOSER_CONTEXT_MULTIPLIERS = {
  low: 1.15, // surrounding proposals are low-value, yours looks better
  average: 1.0,
  high: 0.85, // surrounding proposals are high-value, yours looks worse
} as const;

// Score thresholds for color coding
export const SCORE_THRESHOLDS = {
  exceptional: 99.5,
  good: 99.0,
  warning: 98.0,
} as const;

export const SCORE_COLORS = {
  exceptional: "#22c55e", // green-500
  good: "#84cc16", // lime-500
  warning: "#f59e0b", // amber-500
  poor: "#ef4444", // red-500
} as const;

// Validator color palette for comparison mode
export const VALIDATOR_COLORS = [
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
] as const;

export const DEFAULT_LUCK_FACTORS: LuckFactors = {
  missedSlotRate: 0,
  nonFinalityActive: false,
  nonFinalitySeverity: 1.0,
  timingGameImpact: 0,
  missedBlocksDuringSyncRate: 0,
  proposerContext: "average",
};

export function createDefaultValidator(
  id: string,
  name: string,
  colorIndex: number
): ValidatorConfig {
  return {
    id,
    name,
    color: VALIDATOR_COLORS[colorIndex % VALIDATOR_COLORS.length],
    sourceVoteRate: 1,
    targetVoteRate: 1,
    headVoteRate: 1,
    avgInclusionDelay: 1,
    onProposalDuty: true,
    proposalEfficiency: 1,
    onSyncCommittee: true,
    syncParticipationRate: 1,
    luckFactors: { ...DEFAULT_LUCK_FACTORS },
  };
}

// Entity color palette for comparison mode (max 4 entities)
export const ENTITY_COLORS = [
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ec4899", // pink
] as const;

export function createDefaultEntity(
  id: string,
  name: string,
  colorIndex: number,
  validators: ValidatorConfig[]
): EntityConfig {
  return {
    id,
    name,
    color: ENTITY_COLORS[colorIndex % ENTITY_COLORS.length],
    validators,
  };
}

function makeValidator(
  id: string,
  name: string,
  color: string,
  overrides: Partial<ValidatorConfig> = {}
): ValidatorConfig {
  return {
    ...createDefaultValidator(id, name, 0),
    color,
    ...overrides,
    luckFactors: {
      ...DEFAULT_LUCK_FACTORS,
      ...(overrides.luckFactors ?? {}),
    },
  };
}

export function createDefaultEntities(): EntityConfig[] {
  return [
    createDefaultEntity("entity-lido", "Lido", 0, [
      makeValidator("lido-v1", "Lido-V1", "#818cf8", {
        targetVoteRate: 0.999,
        headVoteRate: 0.999,
      }),
      makeValidator("lido-v2", "Lido-V2", "#a5b4fc", {
        targetVoteRate: 0.997,
        headVoteRate: 0.998,
        avgInclusionDelay: 1.01,
      }),
      makeValidator("lido-v3", "Lido-V3", "#c7d2fe", {
        targetVoteRate: 0.995,
        headVoteRate: 0.997,
        avgInclusionDelay: 1.02,
      }),
    ]),
    createDefaultEntity("entity-coinbase", "Coinbase", 1, [
      makeValidator("cb-v1", "CB-V1", "#fbbf24"),
      makeValidator("cb-v2", "CB-V2", "#fcd34d", {
        targetVoteRate: 0.998,
        avgInclusionDelay: 1.01,
      }),
      makeValidator("cb-v3", "CB-V3", "#fde68a", {
        targetVoteRate: 0.993,
        headVoteRate: 0.996,
        syncParticipationRate: 0.97,
      }),
    ]),
    createDefaultEntity("entity-solo", "Solo Staker", 2, [
      makeValidator("solo-v1", "Solo-V1", "#34d399"),
      makeValidator("solo-v2", "Solo-V2", "#6ee7b7", {
        targetVoteRate: 0.995,
        headVoteRate: 0.996,
        avgInclusionDelay: 1.02,
      }),
      makeValidator("solo-v3", "Solo-V3", "#a7f3d0", {
        targetVoteRate: 0.99,
        headVoteRate: 0.995,
        avgInclusionDelay: 1.03,
        luckFactors: {
          ...DEFAULT_LUCK_FACTORS,
          timingGameImpact: 0.01,
        },
      }),
    ]),
  ];
}

export const PRESETS: Preset[] = [
  {
    id: "perfect",
    name: "Perfect Validator",
    description: "All duties performed perfectly with no network issues.",
    config: {
      sourceVoteRate: 1,
      targetVoteRate: 1,
      headVoteRate: 1,
      avgInclusionDelay: 1,
      onProposalDuty: true,
      proposalEfficiency: 1,
      onSyncCommittee: true,
      syncParticipationRate: 1,
      luckFactors: { ...DEFAULT_LUCK_FACTORS },
    },
  },
  {
    id: "missed-1pct-attest",
    name: "Missed 1% Attestations",
    description:
      "Brief network connectivity issues causing ~1% missed attestations.",
    config: {
      sourceVoteRate: 0.99,
      targetVoteRate: 0.99,
      headVoteRate: 0.99,
      avgInclusionDelay: 1,
    },
  },
  {
    id: "missed-5pct-attest",
    name: "Missed 5% Attestations",
    description:
      "Significant downtime or connectivity problems causing 5% missed attestations.",
    config: {
      sourceVoteRate: 0.95,
      targetVoteRate: 0.95,
      headVoteRate: 0.95,
      avgInclusionDelay: 1,
    },
  },
  {
    id: "missed-target",
    name: "Missed Target Votes",
    description:
      "Target vote accuracy dropped to 95% while source and head remain perfect. Target carries ~48% of attestation weight — double the impact of head votes.",
    config: {
      sourceVoteRate: 1,
      targetVoteRate: 0.95,
      headVoteRate: 1,
      avgInclusionDelay: 1,
    },
  },
  {
    id: "late-inclusion",
    name: "Late Inclusion",
    description:
      "All votes correct but average inclusion delay of 1.5 slots, reducing attestation rewards by 33%.",
    config: {
      sourceVoteRate: 1,
      targetVoteRate: 1,
      headVoteRate: 1,
      avgInclusionDelay: 1.5,
    },
  },
  {
    id: "missed-proposal",
    name: "Missed Proposal",
    description:
      "Validator was assigned a block proposal but missed it entirely.",
    config: {
      onProposalDuty: true,
      proposalEfficiency: 0,
    },
  },
  {
    id: "poor-sync",
    name: "Poor Sync Participation",
    description:
      "Only 80% sync committee participation due to intermittent connectivity.",
    config: {
      onSyncCommittee: true,
      syncParticipationRate: 0.8,
    },
  },
  {
    id: "network-congestion",
    name: "Network Congestion",
    description:
      "Simulates high network congestion: 99% attestation rate, slightly elevated inclusion delay, 95% proposal efficiency.",
    config: {
      sourceVoteRate: 0.99,
      targetVoteRate: 0.99,
      headVoteRate: 0.99,
      avgInclusionDelay: 1.2,
      proposalEfficiency: 0.95,
    },
  },
  {
    id: "unlucky-inclusion",
    name: "Unlucky Inclusion Delay",
    description:
      "Validator attests correctly but next block proposers keep missing their slots, delaying inclusion.",
    config: {
      sourceVoteRate: 1,
      targetVoteRate: 1,
      headVoteRate: 1,
      avgInclusionDelay: 1,
      luckFactors: {
        ...DEFAULT_LUCK_FACTORS,
        missedSlotRate: 0.05,
      },
    },
  },
  {
    id: "timing-game-victim",
    name: "Timing Game Victim",
    description:
      "Large operators delay block publishing for MEV, causing this validator to miss head votes.",
    config: {
      sourceVoteRate: 1,
      targetVoteRate: 1,
      headVoteRate: 1,
      avgInclusionDelay: 1,
      luckFactors: {
        ...DEFAULT_LUCK_FACTORS,
        timingGameImpact: 0.1,
      },
    },
  },
  {
    id: "worst-case",
    name: "Worst Case",
    description:
      "A struggling validator: missed attestations, slightly late inclusion, poor proposals, and reduced sync.",
    config: {
      sourceVoteRate: 0.96,
      targetVoteRate: 0.93,
      headVoteRate: 0.95,
      avgInclusionDelay: 1.1,
      onProposalDuty: true,
      proposalEfficiency: 0.4,
      onSyncCommittee: true,
      syncParticipationRate: 0.85,
      luckFactors: {
        missedSlotRate: 0.02,
        nonFinalityActive: false,
        nonFinalitySeverity: 1.0,
        timingGameImpact: 0.03,
        missedBlocksDuringSyncRate: 0.05,
        proposerContext: "high",
      },
    },
  },
];
