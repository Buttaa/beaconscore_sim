import type { ValidatorConfig, EntityConfig } from "./types";

interface MinimalValidator {
  n: string;
  c: string;
  s: number;
  t: number;
  h: number;
  d: number;
  op: boolean;
  pe: number;
  os: boolean;
  sp: number;
  lf: ValidatorConfig["luckFactors"];
}

interface MinimalEntity {
  n: string;
  c: string;
  vs: MinimalValidator[];
}

function encodeValidator(v: ValidatorConfig): MinimalValidator {
  return {
    n: v.name,
    c: v.color,
    s: v.sourceVoteRate,
    t: v.targetVoteRate,
    h: v.headVoteRate,
    d: v.avgInclusionDelay,
    op: v.onProposalDuty,
    pe: v.proposalEfficiency,
    os: v.onSyncCommittee,
    sp: v.syncParticipationRate,
    lf: v.luckFactors,
  };
}

function decodeValidator(v: Record<string, unknown>): Partial<ValidatorConfig> {
  return {
    name: v.n as string,
    color: v.c as string,
    sourceVoteRate: v.s as number,
    targetVoteRate: v.t as number,
    headVoteRate: v.h as number,
    avgInclusionDelay: v.d as number,
    onProposalDuty: v.op as boolean,
    proposalEfficiency: v.pe as number,
    onSyncCommittee: v.os as boolean,
    syncParticipationRate: v.sp as number,
    luckFactors: v.lf as ValidatorConfig["luckFactors"],
  };
}

export function encodeEntityState(entities: EntityConfig[]): string {
  try {
    const minimal: MinimalEntity[] = entities.map((e) => ({
      n: e.name,
      c: e.color,
      vs: e.validators.map(encodeValidator),
    }));
    return btoa(JSON.stringify(minimal));
  } catch {
    return "";
  }
}

export function decodeEntityState(
  encoded: string
): Partial<EntityConfig>[] | null {
  try {
    const parsed = JSON.parse(atob(encoded));
    if (!Array.isArray(parsed)) return null;

    // Check if this is the new entity format (has `vs` field) or legacy flat format
    if (parsed.length > 0 && parsed[0].vs) {
      // New entity format
      return parsed.map(
        (e: Record<string, unknown>) => ({
          name: e.n as string,
          color: e.c as string,
          validators: (e.vs as Record<string, unknown>[]).map((v) => decodeValidator(v)),
        }) as Partial<EntityConfig>
      );
    }

    // Legacy flat validator format: wrap each validator in its own entity
    return parsed.map(
      (v: Record<string, unknown>, i: number) => ({
        name: (v.n as string) || `Entity ${i + 1}`,
        color: v.c as string,
        validators: [decodeValidator(v)],
      }) as Partial<EntityConfig>
    );
  } catch {
    return null;
  }
}

export function getShareUrl(entities: EntityConfig[]): string {
  const encoded = encodeEntityState(entities);
  const url = new URL(window.location.href);
  url.searchParams.set("state", encoded);
  return url.toString();
}
