import { useValidatorStore } from "./store/validator-store";
import { Header } from "./components/layout/Header";
import { SimulatorView } from "./components/simulator/SimulatorView";
import { ComparisonView } from "./components/comparison/ComparisonView";

function App() {
  const { mode, setMode } = useValidatorStore();

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header mode={mode} onModeChange={setMode} />
      {mode === "simulator" ? <SimulatorView /> : <ComparisonView />}
    </div>
  );
}

export default App;
