import { Hexagon } from "lucide-react";
import type { AppMode } from "../../lib/types";

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Hexagon size={28} className="text-accent" />
          <div>
            <h1 className="text-xl font-bold text-text-primary leading-tight">
              ScoreCraft
            </h1>
            <p className="text-xs text-text-muted">BeaconScore Simulator</p>
          </div>
        </div>

        <nav className="flex bg-bg-secondary rounded-lg p-1 gap-1">
          <button
            onClick={() => onModeChange("simulator")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "simulator"
                ? "bg-accent text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => onModeChange("compare")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "compare"
                ? "bg-accent text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Compare
          </button>
        </nav>
      </div>
    </header>
  );
}
