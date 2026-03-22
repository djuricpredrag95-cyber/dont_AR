import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { POLLING_STATIONS, PARTIES, PollingStationData } from "@/lib/pollingStations";
import { ElectionData } from "@/lib/dhondt";

const STORAGE_KEY = "arandjelovac_election_data";

interface ValidationErrors {
  votesSum?: string;
  inBoxVsVoted?: string;
}

function getEmptyStationData(stationId: number): PollingStationData {
  return { stationId, totalVoted: 0, totalInBox: 0, totalInvalid: 0, partyVotes: PARTIES.map(() => 0) };
}

function validate(sd: PollingStationData, totalVoters: number): ValidationErrors {
  const errors: ValidationErrors = {};
  const sumPartyVotes = sd.partyVotes.reduce((a, b) => a + b, 0);
  const expectedInBox = sumPartyVotes + sd.totalInvalid;
  if (sd.totalInBox > 0 && expectedInBox !== sd.totalInBox) {
    errors.votesSum = `Збир гласова по листама (${sumPartyVotes}) + невaжећи (${sd.totalInvalid}) = ${expectedInBox}, а листића у кутији: ${sd.totalInBox}`;
  }
  if (sd.totalInBox > sd.totalVoted) {
    errors.inBoxVsVoted = `Листића у кутији (${sd.totalInBox}) не може бити више од броја који су гласали (${sd.totalVoted})`;
  }
  if (sd.totalVoted > totalVoters) {
    errors.inBoxVsVoted = `Гласало (${sd.totalVoted}) не може бити више од броја бирача (${totalVoters})`;
  }
  return errors;
}

function isValid(sd: PollingStationData, totalVoters: number): boolean {
  return sd.totalVoted > 0 && Object.keys(validate(sd, totalVoters)).length === 0;
}

function loadSaved(): Record<number, PollingStationData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveToDisk(data: Record<number, PollingStationData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function DataEntry() {
  const navigate = useNavigate();
  const [savedData, setSavedData] = useState<Record<number, PollingStationData>>(loadSaved);
  const [selectedStation, setSelectedStation] = useState<number>(1);
  const [formData, setFormData] = useState<PollingStationData>(getEmptyStationData(1));

  // Reset form when station changes
  useEffect(() => {
    setFormData(getEmptyStationData(selectedStation));
  }, [selectedStation]);

  const station = POLLING_STATIONS.find(s => s.id === selectedStation)!;
  const errors = validate(formData, station.totalVoters);
  const hasErrors = Object.keys(errors).length > 0;
  const formHasData = formData.totalVoted > 0;
  const formIsValid = formHasData && !hasErrors;

  const updateField = useCallback((update: Partial<PollingStationData>) => {
    setFormData(prev => ({ ...prev, ...update }));
  }, []);

  const updatePartyVote = useCallback((partyIdx: number, value: number) => {
    setFormData(prev => {
      const newVotes = [...prev.partyVotes];
      newVotes[partyIdx] = value;
      return { ...prev, partyVotes: newVotes };
    });
  }, []);

  const saveStation = () => {
    if (!formIsValid) return;
    const newSaved = { ...savedData, [selectedStation]: { ...formData, stationId: selectedStation } };
    setSavedData(newSaved);
    saveToDisk(newSaved);
    setFormData(getEmptyStationData(selectedStation));
  };

  const deleteStation = (id: number) => {
    const newSaved = { ...savedData };
    delete newSaved[id];
    setSavedData(newSaved);
    saveToDisk(newSaved);
  };

  const totalVotersAll = POLLING_STATIONS.reduce((a, s) => a + s.totalVoters, 0);

  // Only aggregate VALID stations
  const aggregated = useMemo(() => {
    let totalVoted = 0, totalInBox = 0, totalInvalid = 0;
    const partyTotals = PARTIES.map(() => 0);
    let validCount = 0;
    Object.entries(savedData).forEach(([id, d]) => {
      const s = POLLING_STATIONS.find(st => st.id === Number(id));
      if (!s || !isValid(d, s.totalVoters)) return;
      validCount++;
      totalVoted += d.totalVoted;
      totalInBox += d.totalInBox;
      totalInvalid += d.totalInvalid;
      d.partyVotes.forEach((v, i) => { partyTotals[i] += v; });
    });
    return { totalVoted, totalInBox, totalInvalid, partyTotals, validCount };
  }, [savedData]);

  const sendToCalculator = () => {
    if (aggregated.validCount === 0) return;
    const electionData: ElectionData = {
      municipality: "АРАНЂЕЛОВАЦ",
      totalVoters: totalVotersAll,
      totalMandates: 41,
      totalVoted: aggregated.totalVoted,
      totalInBox: aggregated.totalInBox,
      totalInvalid: aggregated.totalInvalid,
      parties: PARTIES.map((p, i) => ({
        name: p.name,
        votes: aggregated.partyTotals[i],
        isMinority: p.isMinority,
        minorityCoefficient: p.minorityCoefficient,
      })),
    };
    navigate("/", { state: { electionData } });
  };

  const exportToExcel = () => {
    const header = ["Ред.бр.", "Бирачко место", "Адреса", "Бирачи", "Гласали", "У кутији", "Невaжећи",
      ...PARTIES.map(p => p.name), "Статус"];
    const rows = POLLING_STATIONS.map(s => {
      const d = savedData[s.id];
      if (!d) return [s.id, s.name, s.address, s.totalVoters, "", "", "", ...PARTIES.map(() => ""), "Није унето"];
      const valid = isValid(d, s.totalVoters);
      return [s.id, s.name, s.address, s.totalVoters, d.totalVoted, d.totalInBox, d.totalInvalid,
        ...d.partyVotes, valid ? "✓ Валидно" : "✗ Грешка"];
    });
    // Totals row
    rows.push(["", "УКУПНО", "", totalVotersAll, aggregated.totalVoted, aggregated.totalInBox, aggregated.totalInvalid,
      ...aggregated.partyTotals, `${aggregated.validCount} валидних`]);

    const csvContent = [header, ...rows].map(row =>
      row.map(cell => {
        const str = String(cell ?? "");
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",")
    ).join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rezultati_biracka_mesta.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const savedForStation = savedData[selectedStation];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Унос по бирачким местима</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Сачувано: {aggregated.validCount} / {POLLING_STATIONS.length} · Укупно бирача: {totalVotersAll.toLocaleString("sr")}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate("/")}
              className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity">
              ← Калкулатор
            </button>
            <button onClick={exportToExcel}
              className="px-4 py-2 text-sm font-medium rounded-md bg-accent text-accent-foreground hover:opacity-90 transition-opacity">
              📥 Извези CSV
            </button>
            <button onClick={sendToCalculator} disabled={aggregated.validCount === 0}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
              📊 Пребаци у калкулатор ({aggregated.validCount})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* Station selector */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-muted px-5 py-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Бирачко место</h2>
          </div>
          <div className="p-5">
            <select value={selectedStation} onChange={e => setSelectedStation(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {POLLING_STATIONS.map(s => {
                const saved = savedData[s.id];
                const hasSaved = !!saved;
                const valid = saved && isValid(saved, s.totalVoters);
                return (
                  <option key={s.id} value={s.id}>
                    {s.id}. {s.name} — {s.address} ({s.totalVoters}) {hasSaved ? (valid ? "✅" : "⚠️") : ""}
                  </option>
                );
              })}
            </select>
            <div className="mt-2 text-sm text-muted-foreground">
              <strong>Адреса:</strong> {station.address} · <strong>Бирача:</strong> {station.totalVoters.toLocaleString("sr")}
            </div>
            {savedForStation && (
              <div className="mt-2 flex items-center gap-3">
                <span className={`text-sm font-medium ${isValid(savedForStation, station.totalVoters) ? "text-green-600" : "text-destructive"}`}>
                  {isValid(savedForStation, station.totalVoters) ? "✅ Сачувано и валидно" : "⚠️ Сачувано али има грешака"}
                </span>
                <button onClick={() => deleteStation(selectedStation)}
                  className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition">
                  🗑 Обриши
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Voting data form - always empty */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-muted px-5 py-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Унос података</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Гласали</label>
              <input type="number" min="0" max={station.totalVoters}
                className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.totalVoted || ""} onChange={e => updateField({ totalVoted: Number(e.target.value) })} />
              <p className="text-xs text-muted-foreground mt-1">Макс: {station.totalVoters}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Листића у кутији</label>
              <input type="number" min="0"
                className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.totalInBox || ""} onChange={e => updateField({ totalInBox: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Невaжећи листићи</label>
              <input type="number" min="0"
                className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.totalInvalid || ""} onChange={e => updateField({ totalInvalid: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        {/* Party votes */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-muted px-5 py-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Гласови по листама</h2>
          </div>
          <div className="p-5 space-y-3">
            {PARTIES.map((party, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-48 flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{i + 1}. {party.name}</span>
                  {party.isMinority && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground font-medium">МАЊ.</span>
                  )}
                </div>
                <input type="number" min="0"
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.partyVotes[i] || ""} onChange={e => updatePartyVote(i, Number(e.target.value))} />
              </div>
            ))}
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="w-48 text-sm font-semibold text-foreground">Збир важећих</div>
              <div className="flex-1 px-3 py-2 rounded-lg bg-secondary font-mono font-semibold text-foreground">
                {formData.partyVotes.reduce((a, b) => a + b, 0).toLocaleString("sr")}
              </div>
            </div>
          </div>
        </div>

        {/* Validation + Save */}
        {hasErrors && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-destructive">⚠️ Грешке у провери</h3>
            {errors.votesSum && <p className="text-sm text-destructive">{errors.votesSum}</p>}
            {errors.inBoxVsVoted && <p className="text-sm text-destructive">{errors.inBoxVsVoted}</p>}
          </div>
        )}

        <button onClick={saveStation} disabled={!formIsValid}
          className="w-full py-3 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
          💾 Сачувај БМ {selectedStation} {savedForStation ? "(замени)" : ""}
        </button>

        {/* Aggregated totals */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-muted px-5 py-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Збирни преглед — {aggregated.validCount} валидних БМ
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase">Листа</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase">Укупно гласова</th>
                </tr>
              </thead>
              <tbody>
                {PARTIES.map((p, i) => (
                  <tr key={i} className="border-b even:bg-muted/50">
                    <td className="px-4 py-2 text-sm font-medium text-foreground">{p.name} {p.isMinority ? "(мањ.)" : ""}</td>
                    <td className="px-4 py-2 text-right font-mono text-sm font-semibold text-foreground">{aggregated.partyTotals[i].toLocaleString("sr")}</td>
                  </tr>
                ))}
                <tr className="bg-secondary font-semibold">
                  <td className="px-4 py-3 text-secondary-foreground">Укупно гласали</td>
                  <td className="px-4 py-3 text-right font-mono text-secondary-foreground">{aggregated.totalVoted.toLocaleString("sr")}</td>
                </tr>
                <tr className="bg-secondary font-semibold">
                  <td className="px-4 py-3 text-secondary-foreground">Укупно у кутији</td>
                  <td className="px-4 py-3 text-right font-mono text-secondary-foreground">{aggregated.totalInBox.toLocaleString("sr")}</td>
                </tr>
                <tr className="bg-secondary font-semibold">
                  <td className="px-4 py-3 text-secondary-foreground">Укупно невaжећих</td>
                  <td className="px-4 py-3 text-right font-mono text-secondary-foreground">{aggregated.totalInvalid.toLocaleString("sr")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
