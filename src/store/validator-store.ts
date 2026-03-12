import { create } from "zustand";
import type { ValidatorConfig, EntityConfig, AppMode } from "../lib/types";
import {
  createDefaultValidator,
  createDefaultEntities,
  PRESETS,
  DEFAULT_LUCK_FACTORS,
  ENTITY_COLORS,
} from "../lib/constants";

interface ValidatorStore {
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // Simulator mode: single validator
  simulator: ValidatorConfig;
  updateSimulator: (updates: Partial<ValidatorConfig>) => void;
  applyPreset: (presetId: string) => void;

  // Active preset tracking (null when user manually adjusts)
  activePresetId: string | null;

  // Simple mode toggle for attestation controls
  advancedAttestation: boolean;
  setAdvancedAttestation: (v: boolean) => void;

  // Entity-based comparison mode
  entities: EntityConfig[];
  addEntity: () => void;
  removeEntity: (entityId: string) => void;
  updateEntity: (
    entityId: string,
    updates: Partial<Pick<EntityConfig, "name" | "color">>
  ) => void;
  addValidatorToEntity: (entityId: string) => void;
  removeValidatorFromEntity: (entityId: string, validatorId: string) => void;
  updateValidatorInEntity: (
    entityId: string,
    validatorId: string,
    updates: Partial<ValidatorConfig>
  ) => void;
  applyPresetToValidatorInEntity: (
    entityId: string,
    validatorId: string,
    presetId: string
  ) => void;
}

export const useValidatorStore = create<ValidatorStore>((set) => ({
  mode: "simulator",
  setMode: (mode) => set({ mode }),

  simulator: createDefaultValidator("sim", "My Validator", 0),

  updateSimulator: (updates) =>
    set((state) => ({
      simulator: mergeConfig(state.simulator, updates),
      activePresetId: null,
    })),

  applyPreset: (presetId) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    set((state) => ({
      simulator: mergeConfig(
        createDefaultValidator("sim", state.simulator.name, 0),
        preset.config
      ),
      activePresetId: presetId,
    }));
  },

  activePresetId: null,

  advancedAttestation: false,
  setAdvancedAttestation: (v) => set({ advancedAttestation: v }),

  // Entity-based comparison
  entities: createDefaultEntities(),

  addEntity: () =>
    set((state) => {
      if (state.entities.length >= 4) return state;
      const idx = state.entities.length;
      const id = `entity-${Date.now()}`;
      const name = `Entity ${String.fromCharCode(65 + idx)}`;
      const color = ENTITY_COLORS[idx % ENTITY_COLORS.length];
      const v = createDefaultValidator(
        `${id}-v1`,
        `${name}-V1`,
        idx
      );
      return {
        entities: [
          ...state.entities,
          { id, name, color, validators: [{ ...v, color }] },
        ],
      };
    }),

  removeEntity: (entityId) =>
    set((state) => {
      if (state.entities.length <= 2) return state;
      return {
        entities: state.entities.filter((e) => e.id !== entityId),
      };
    }),

  updateEntity: (entityId, updates) =>
    set((state) => ({
      entities: state.entities.map((e) =>
        e.id === entityId ? { ...e, ...updates } : e
      ),
    })),

  addValidatorToEntity: (entityId) =>
    set((state) => ({
      entities: state.entities.map((e) => {
        if (e.id !== entityId || e.validators.length >= 6) return e;
        const idx = e.validators.length;
        const id = `${entityId}-v${Date.now()}`;
        const name = `${e.name}-V${idx + 1}`;
        const entityIdx = state.entities.findIndex((en) => en.id === entityId);
        const v = createDefaultValidator(id, name, entityIdx);
        return {
          ...e,
          validators: [...e.validators, { ...v, color: lightenColor(e.color, idx) }],
        };
      }),
    })),

  removeValidatorFromEntity: (entityId, validatorId) =>
    set((state) => ({
      entities: state.entities.map((e) => {
        if (e.id !== entityId || e.validators.length <= 1) return e;
        return {
          ...e,
          validators: e.validators.filter((v) => v.id !== validatorId),
        };
      }),
    })),

  updateValidatorInEntity: (entityId, validatorId, updates) =>
    set((state) => ({
      entities: state.entities.map((e) =>
        e.id === entityId
          ? {
              ...e,
              validators: e.validators.map((v) =>
                v.id === validatorId ? mergeConfig(v, updates) : v
              ),
            }
          : e
      ),
    })),

  applyPresetToValidatorInEntity: (entityId, validatorId, presetId) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    set((state) => ({
      entities: state.entities.map((e) =>
        e.id === entityId
          ? {
              ...e,
              validators: e.validators.map((v) =>
                v.id === validatorId
                  ? mergeConfig(
                      createDefaultValidator(v.id, v.name, 0),
                      { ...preset.config, color: v.color }
                    )
                  : v
              ),
            }
          : e
      ),
    }));
  },
}));

function mergeConfig(
  base: ValidatorConfig,
  updates: Partial<ValidatorConfig>
): ValidatorConfig {
  const { luckFactors: luckUpdates, ...rest } = updates;
  return {
    ...base,
    ...rest,
    luckFactors: luckUpdates
      ? { ...DEFAULT_LUCK_FACTORS, ...luckUpdates }
      : base.luckFactors,
  };
}

function lightenColor(hex: string, index: number): string {
  // Generate lighter shades for validators within an entity
  const opacity = Math.max(0.4, 1 - index * 0.15);
  // Simple approach: mix with white
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * (1 - opacity));
  return `#${mix(r).toString(16).padStart(2, "0")}${mix(g).toString(16).padStart(2, "0")}${mix(b).toString(16).padStart(2, "0")}`;
}
