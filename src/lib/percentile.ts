/**
 * Network percentile distribution engine.
 *
 * Uses an empirical piecewise CDF that mimics real Ethereum mainnet
 * BeaconScore distribution (scores cluster tightly around 99-100%).
 */

// Empirical CDF breakpoints: [score%, percentile%]
const EMPIRICAL_CDF: [number, number][] = [
  [90, 0],
  [95, 1],
  [97, 3],
  [98, 8],
  [98.5, 12],
  [99, 22],
  [99.2, 32],
  [99.4, 45],
  [99.5, 55],
  [99.6, 65],
  [99.7, 75],
  [99.8, 85],
  [99.9, 93],
  [99.95, 97],
  [100, 100],
];

/**
 * Get the network percentile for a given BeaconScore.
 * @param score - Score as a fraction (0-1), e.g., 0.995 for 99.5%
 * @returns Percentile (0-100)
 */
export function getPercentile(score: number): number {
  const pct = score * 100;

  if (pct <= EMPIRICAL_CDF[0][0]) return 0;
  if (pct >= EMPIRICAL_CDF[EMPIRICAL_CDF.length - 1][0]) return 100;

  for (let i = 1; i < EMPIRICAL_CDF.length; i++) {
    const [s1, p1] = EMPIRICAL_CDF[i - 1];
    const [s2, p2] = EMPIRICAL_CDF[i];
    if (pct <= s2) {
      const t = (pct - s1) / (s2 - s1);
      return p1 + t * (p2 - p1);
    }
  }

  return 100;
}

export interface DistributionPoint {
  score: number; // percentage (95-100)
  density: number; // relative density value
}

/**
 * Generate a smooth density curve for the network distribution.
 * Returns points suitable for an area chart (x = score%, y = density).
 */
export function getDistributionCurve(): DistributionPoint[] {
  const points: DistributionPoint[] = [];
  const steps = 200;
  const minScore = 95;
  const maxScore = 100;

  for (let i = 0; i <= steps; i++) {
    const score = minScore + (maxScore - minScore) * (i / steps);
    // Density is the derivative of the CDF (approximated via finite differences)
    const delta = 0.01;
    const p1 = getPercentile((score - delta) / 100);
    const p2 = getPercentile((score + delta) / 100);
    const density = (p2 - p1) / (2 * delta);
    points.push({ score, density });
  }

  return points;
}
