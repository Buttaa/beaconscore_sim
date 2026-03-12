# ScoreCraft - BeaconScore Simulator

An interactive simulator for understanding and comparing Ethereum validator BeaconScores. Adjust validator performance parameters in real-time and see how they affect the overall score, or compare multiple staking entities side by side with network percentile positioning.

## What is BeaconScore?

BeaconScore measures validator effectiveness as the ratio of actual rewards earned to ideal rewards possible. It uses protocol-native weights from the Ethereum Consensus Layer specification:

- **Attestations** (84.4%) - Source (26%), Target (48%), Head (26%) vote accuracy, scaled by inclusion delay
- **Block Proposals** (12.5%) - Efficiency of proposed blocks
- **Sync Committee** (3.1%) - Participation rate when elected to sync committee

When a duty is not active (no proposals assigned, not on sync committee), its weight redistributes proportionally among active components.

## Features

### Simulator Mode
- Adjust all validator performance parameters with interactive sliders
- Simple mode (single attestation success rate) or Advanced mode (separate source/target/head vote rates + inclusion delay)
- Toggle block proposals and sync committee duties on/off
- **Network Conditions / Luck Factors** panel modeling external factors outside validator control:
  - Missed slot rate (delays attestation inclusion)
  - Timing game impact (reduces head vote accuracy)
  - Missed blocks during sync duty
  - Proposer context (surrounding proposal activity)
  - Non-finality events
- 11 presets modeling common scenarios (Perfect Validator, Missed Attestations, Late Inclusion, Timing Game Victim, Worst Case, etc.)
- Real-time animated score gauge with color-coded thresholds
- Dynamic formula visualization showing the exact calculation with plugged-in numbers
- Score analysis explaining the main performance drags

### Compare Mode
- Create up to 4 entities (e.g., Lido, Coinbase, Solo Staker), each with up to 6 validators
- **Network Percentile Distribution** chart showing where each entity and validator falls relative to the pool
- Percentiles computed from all validators across all entities
- Grouped summary table with expandable entity/validator rows
- Entity-level bar chart and radar overlay comparing aggregate performance
- Shareable URLs encoding full entity/validator state

### Educational
- Tooltips on every control explaining what it measures, its protocol weight, and real-world causes
- Collapsible "How BeaconScore Works" panel with formula breakdown and FAQ
- Preset annotations explaining what changed and why

## Tech Stack

- **React 19 + Vite 8 + TypeScript** - Fast builds, modern DX
- **Tailwind CSS 4** - Utility-first styling via PostCSS
- **Recharts** - Bar charts, radar charts, area charts
- **Radix UI** - Accessible sliders, tooltips, collapsibles, switches
- **Zustand** - Lightweight state management
- **Framer Motion** - Animated score gauge
- **Lucide React** - Icons

No backend. All computation runs client-side.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Building for Production

```bash
npm run build
```

Output is in the `dist/` directory, ready for static hosting.

## Deployment

This project is configured for Netlify auto-deploy from the `main` branch. The `netlify.toml` configuration handles:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing redirects

## Project Structure

```
src/
  lib/
    calculator.ts       # BeaconScore calculation engine
    constants.ts        # Protocol weights, presets, entity defaults
    types.ts            # TypeScript interfaces
    percentile.ts       # Network percentile distribution
    url-state.ts        # URL state serialization for sharing
  store/
    validator-store.ts  # Zustand state management
  components/
    simulator/          # Simulator mode controls (sliders, presets, etc.)
    comparison/         # Compare mode (entity cards, percentile chart, tables)
    visualizations/     # Score gauge, component breakdown, radar, explanation
    education/          # How it works panel, info tooltips
    layout/             # Header, mode toggle
```

## License

MIT
