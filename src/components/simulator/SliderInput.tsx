import * as Slider from "@radix-ui/react-slider";
import { InfoTooltip } from "../education/InfoTooltip";

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
  formatValue?: (value: number) => string;
  accentColor?: string;
}

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  tooltip,
  formatValue,
  accentColor,
}: SliderInputProps) {
  const displayValue = formatValue
    ? formatValue(value)
    : `${(value * 100).toFixed(1)}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-text-secondary">{label}</span>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>
        <span className="text-sm font-mono text-text-primary font-medium">
          {displayValue}
        </span>
      </div>
      <Slider.Root
        className="slider-root"
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      >
        <Slider.Track className="slider-track">
          <Slider.Range
            className="slider-range"
            style={accentColor ? { backgroundColor: accentColor } : undefined}
          />
        </Slider.Track>
        <Slider.Thumb className="slider-thumb" />
      </Slider.Root>
    </div>
  );
}
