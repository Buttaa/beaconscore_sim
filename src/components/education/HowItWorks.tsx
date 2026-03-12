import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";

export function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors">
          <BookOpen size={16} />
          How BeaconScore Works
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content className="mt-4">
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-5 text-sm">
          <div>
            <h4 className="font-semibold text-text-primary mb-2">
              What is BeaconScore?
            </h4>
            <p className="text-text-secondary leading-relaxed">
              BeaconScore measures validator efficiency using{" "}
              <strong className="text-text-primary">
                protocol-native weighting
              </strong>{" "}
              — the importance of each duty is determined by the Ethereum
              Consensus Layer specification itself, not arbitrary external
              weights.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-2">Formula</h4>
            <div className="bg-bg-secondary rounded-lg p-3 font-mono text-xs text-text-primary">
              <p>BeaconScore = actual_rewards / ideal_rewards</p>
              <p className="text-text-muted mt-1">
                = (attest_actual + proposer_actual + sync_actual) /
                (attest_ideal + proposer_ideal + sync_ideal)
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-2">
              Component Weights
            </h4>
            <div className="space-y-2">
              <WeightBar
                label="Attestations"
                weight={84.4}
                color="#60a5fa"
                detail="Every epoch (~6.4 min). Source (26%), Target (48%), Head (26%)"
              />
              <WeightBar
                label="Block Proposals"
                weight={12.5}
                color="#fbbf24"
                detail="Luck-based assignment. ~1 per 2 months per validator"
              />
              <WeightBar
                label="Sync Committee"
                weight={3.1}
                color="#34d399"
                detail="Luck-based. ~Once every 37 months per validator"
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-2">
              Key Insight
            </h4>
            <p className="text-text-secondary leading-relaxed">
              Missing a{" "}
              <strong className="text-[#a78bfa]">Target vote</strong> (48%
              attestation weight) has roughly{" "}
              <strong className="text-text-primary">
                double the impact
              </strong>{" "}
              of missing a Head vote (26%). Third-party metrics often treat these
              equally, creating misalignment with actual network impact.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-2">
              Performance Benchmarks
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <BenchmarkBadge
                label="Exceptional"
                range="99.5%+"
                color="#22c55e"
              />
              <BenchmarkBadge label="Good" range="99.0-99.5%" color="#84cc16" />
              <BenchmarkBadge
                label="Needs Attention"
                range="98.0-99.0%"
                color="#f59e0b"
              />
              <BenchmarkBadge label="Poor" range="<98.0%" color="#ef4444" />
            </div>
          </div>

          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-text-muted">
              Learn more:{" "}
              <a
                href="https://docs.beaconcha.in/validator-dashboard/metric-validator-efficiency"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover underline"
              >
                BeaconScore Documentation
              </a>
            </p>
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function WeightBar({
  label,
  weight,
  color,
  detail,
}: {
  label: string;
  weight: number;
  color: string;
  detail: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-text-primary text-xs font-medium">{label}</span>
        <span className="text-text-muted text-xs">{weight}%</span>
      </div>
      <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${weight}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-text-muted mt-0.5">{detail}</p>
    </div>
  );
}

function BenchmarkBadge({
  label,
  range,
  color,
}: {
  label: string;
  range: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-bg-secondary rounded-lg px-3 py-2">
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div>
        <span className="text-xs font-medium text-text-primary">{label}</span>
        <span className="text-xs text-text-muted ml-1.5">{range}</span>
      </div>
    </div>
  );
}
