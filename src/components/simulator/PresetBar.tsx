import { PRESETS } from "../../lib/constants";
import { InfoTooltip } from "../education/InfoTooltip";

interface PresetBarProps {
  onSelect: (presetId: string) => void;
  activePreset?: string;
}

export function PresetBar({ onSelect, activePreset }: PresetBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Presets
        </h3>
        <InfoTooltip content="Quick-start scenarios that set all parameters at once. Select a preset to see its impact, then fine-tune individual controls." />
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            title={preset.description}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activePreset === preset.id
                ? "bg-accent text-white"
                : "bg-bg-secondary text-text-secondary hover:bg-bg-card-hover hover:text-text-primary border border-border/50"
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}
