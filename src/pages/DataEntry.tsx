import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { POLLING_STATIONS, PARTIES, PollingStationData } from "@/lib/pollingStations";
import { ElectionData } from "@/lib/dhondt";

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

export default function DataEntry() {
  const navigate = useNavigate();
  const [allData, setAllData] = useState<Record<number, PollingStationData>>({});
  const [selectedStation, setSelectedStation] = useState<number>(1);

  const station = POLLING_STATIONS.find(s => s.id === selectedStation)!;
  const stationData = allData[selectedStation] || getEmptyStationData(selectedStation);
  const errors = validate(stationData, station.totalVoters);
  const hasErrors = Object.keys(errors).length > 0;

  const updateStation = useCallback((update: Partial<PollingStationData>) => {
    setAllData(prev => ({
      ...prev,
      [selectedStation]: { ...(prev[selectedStation] || getEmptyStationData(selectedStation)), ...update },
    }));
  }, [selectedStation]);

  const updatePartyVote = useCallback((partyIdx: number, value: number) => {
    setAllData(prev => {
      const current = prev[selectedStation] || getEmptyStationData(selectedStation);
      const newVotes = [...current.partyVotes];
      newVotes[partyIdx] = value;
      return { ...prev, [selectedStation]: { ...current, partyVotes: newVotes } };
    });
  }, [selectedStation]);

  const filledStations = useMemo(() => {
    return Object.entries(allData).filter(([, d]) => d.totalVoted > 0).length;
  }, [allData]);

  const totalVotersAll = POLLING_STATIONS.reduce((a, s) => a + s.totalVoters, 0);

  const aggregated = useMemo(() => {
    let totalVoted = 0, totalInBox = 0, totalInvalid = 0;
    const partyTotals = PARTIES.map(() => 0);
    Object.values(allData).forEach(d => {
      totalVoted += d.totalVoted;
      totalInBox += d.totalInBox;
      totalInvalid += d.totalInvalid;
      d.partyVotes.forEach((v, i) => { partyTotals[i] += v; });
    });
    return { totalVoted, totalInBox, totalInvalid, partyTotals };
  }, [allData]);

  const hasAnyGlobalErrors = useMemo(() => {
    return Object.entries(allData).some(([id, d]) => {
      const s = POLLING_STATIONS.find(st => st.id === Number(id));
      return s && Object.keys(validate(d, s.totalVoters)).length > 0;
    });
  }, [allData]);

  const sendToCalculator = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Унос по бирачким местима</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Попуњено {filledStations} / {POLLING_STATIONS.length} бирачких места
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
            >
              ← Калкулатор
            </button>
            <button
              onClick={sendToCalculator}
              disabled={filledStations === 0 || hasAnyGlobalErrors}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📊 Пребаци у калкулатор
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* Station selector */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-table-header px-5 py-3">
            <h2 className="text-sm font-semibold text-table-header-foreground uppercase tracking-wider">Бирачко место</h2>
          </div>
          <div className="p-5">
            <select
              value={selectedStation}
              onChange={e => setSelectedStation(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {POLLING_STATIONS.map(s => {
                const d = allData[s.id];
                const filled = d && d.totalVoted > 0;
                const hasErr = d && Object.keys(validate(d, s.totalVoters)).length > 0;
                return (
                  <option key={s.id} value={s.id}>
                    {s.id}. {s.name} — {s.address} ({s.totalVoters} бирача) {filled ? (hasErr ? "⚠️" : "✅") : ""}
                  </option>
                );
              })}
            </select>
            <div className="mt-2 text-sm text-muted-foreground">
              <strong>Адреса:</strong> {station.address} · <strong>Бирача:</strong> {station.totalVoters.toLocaleString("sr")}
            </div>
          </div>
        </div>

        {/* Voting data */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-table-header px-5 py-3">
            <h2 className="text-sm font-semibold text-table-header-foreground uppercase tracking-wider">Подаци о гласању</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Гласали</label>
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={stationData.totalVoted || ""}
                onChange={e => updateStation({ totalVoted: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">Макс: {station.totalVoters}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Листића у кутији</label>
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={stationData.totalInBox || ""}
                onChange={e => updateStation({ totalInBox: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Невaжећи листићи</label>
              <input
                type="number"
                className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={stationData.totalInvalid || ""}
                onChange={e => updateStation({ totalInvalid: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Party votes */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-table-header px-5 py-3">
            <h2 className="text-sm font-semibold text-table-header-foreground uppercase tracking-wider">Гласови по листама</h2>
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
                <input
                  type="number"
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  value={stationData.partyVotes[i] || ""}
                  onChange={e => updatePartyVote(i, Number(e.target.value))}
                />
              </div>
            ))}
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="w-48 text-sm font-semibold text-foreground">Збир важећих</div>
              <div className="flex-1 px-3 py-2 rounded-lg bg-secondary font-mono font-semibold text-foreground">
                {stationData.partyVotes.reduce((a, b) => a + b, 0).toLocaleString("sr")}
              </div>
            </div>
          </div>
        </div>

        {/* Validation */}
        {hasErrors && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-destructive">⚠️ Грешке у провери</h3>
            {errors.votesSum && <p className="text-sm text-destructive">{errors.votesSum}</p>}
            {errors.inBoxVsVoted && <p className="text-sm text-destructive">{errors.inBoxVsVoted}</p>}
          </div>
        )}

        {/* Aggregated totals */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-table-header px-5 py-3">
            <h2 className="text-sm font-semibold text-table-header-foreground uppercase tracking-wider">Збирни преглед (сва БМ)</h2>
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
                  <tr key={i} className={`border-b ${i % 2 === 0 ? "bg-card" : "bg-table-row-even"}`}>
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
