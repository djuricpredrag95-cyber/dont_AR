import { forwardRef, useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ElectionData, Party, calculateDhondt, defaultElectionData } from "@/lib/dhondt";
import SummarySheet from "@/components/SummarySheet";
import DhondtSheet from "@/components/DhondtSheet";

const Index = forwardRef<HTMLDivElement>((_, ref) => {
  const [activeTab, setActiveTab] = useState<"summary" | "dhondt">("summary");
  const [data, setData] = useState<ElectionData>(defaultElectionData);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.electionData) {
      setData(location.state.electionData);
    }
  }, [location.state]);

  const result = useMemo(() => calculateDhondt(data), [data]);

  const updateParty = (index: number, field: keyof Party, value: string | number | boolean) => {
    setData(prev => ({
      ...prev,
      parties: prev.parties.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const updateField = (field: keyof ElectionData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addParty = () => {
    setData(prev => ({
      ...prev,
      parties: [...prev.parties, { name: "Нова листа", votes: 0, isMinority: false, minorityCoefficient: 1 }],
    }));
  };

  const removeParty = (index: number) => {
    if (data.parties.length <= 2) return;
    setData(prev => ({
      ...prev,
      parties: prev.parties.filter((_, i) => i !== index),
    }));
  };

  return (
    <div ref={ref} className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Д'Онт калкулатор
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Распоред мандата — {data.municipality}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/unos")}
              className="px-4 py-2 text-sm font-medium rounded-md bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
            >
              📝 Унос по БМ
            </button>
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === "summary"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                📊 Преглед
              </button>
              <button
                onClick={() => setActiveTab("dhondt")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === "dhondt"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🔢 Д'Онт обрачун
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 animate-fade-in">
        {activeTab === "summary" ? (
          <SummarySheet
            data={data}
            result={result}
            updateField={updateField}
            updateParty={updateParty}
            addParty={addParty}
            removeParty={removeParty}
          />
        ) : (
          <DhondtSheet data={data} result={result} />
        )}
      </main>
    </div>
  );
});

Index.displayName = "Index";

export default Index;
