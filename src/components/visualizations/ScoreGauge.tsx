import { motion } from "framer-motion";
import { getScoreColor, getScoreLabel } from "../../lib/calculator";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 260 }: ScoreGaugeProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const pct = score * 100;

  // Semi-circular gauge
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;

  // Arc from 180 deg to 0 deg (left to right semicircle)
  const startAngle = Math.PI;
  const endAngle = 0;
  const arcLength = Math.PI * radius;
  const filledLength = arcLength * score;

  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy - radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy - radius * Math.sin(endAngle);

  const bgPath = `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 40}
        viewBox={`0 0 ${size} ${size / 2 + 50}`}
      >
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        <motion.path
          d={bgPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: arcLength - filledLength }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* Score text */}
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          className="text-4xl font-bold"
          fill="var(--color-text-primary)"
          fontSize="42"
          fontWeight="700"
          fontFamily="Inter, system-ui"
        >
          {pct.toFixed(2)}%
        </text>

        {/* Label */}
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fill={color}
          fontSize="14"
          fontWeight="600"
          fontFamily="Inter, system-ui"
        >
          {label}
        </text>

        {/* Min/Max labels */}
        <text
          x={x1}
          y={y1 + 20}
          textAnchor="middle"
          fill="var(--color-text-muted)"
          fontSize="11"
        >
          0%
        </text>
        <text
          x={x2}
          y={y2 + 20}
          textAnchor="middle"
          fill="var(--color-text-muted)"
          fontSize="11"
        >
          100%
        </text>
      </svg>
    </div>
  );
}
