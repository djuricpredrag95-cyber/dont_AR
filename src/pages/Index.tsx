import { forwardRef, useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ElectionData, Party, calculateDhondt, defaultElectionData } from "@/lib/dhondt";
import { POLLING_STATIONS, PARTIES, PollingStationData } from "@/lib/pollingStations";
import { useStationData } from "@/hooks/useStationData";
import { ELECTION_2022 } from "@/lib/historical2022";
import SummarySheet from "@/components/SummarySheet";

const UKUPNO_NASI: Record<number, number> = {
  1:773,2:623,3:524,4:583,5:682,6:506,7:795,8:608,9:617,10:691,
  11:656,12:549,13:359,14:497,15:335,16:580,17:841,18:781,19:515,20:512,
  21:179,22:313,23:631,24:438,25:297,26:188,27:106,28:193,29:188,30:145,
  31:437,32:364,33:603,34:322,35:262,36:418,37:336,38:461,39:215,40:720,41:114,
};
import DhondtSheet from "@/components/DhondtSheet";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

function isValid(sd: PollingStationData, totalVoters: number): boolean {
  if (sd.totalVoted <= 0) return false;
  const sumParty = sd.partyVotes.reduce((a, b) => a + b, 0);
  if (sd.totalInBox > 0 && sumParty + sd.totalInvalid !== sd.totalInBox) return false;
  if (sd.totalInBox > sd.totalVoted) return false;
  if (sd.totalVoted > totalVoters) return false;
  return true;
}

const Index = forwardRef<HTMLDivElement>((_, ref) => {
  const [activeTab, setActiveTab] = useState<"summary" | "dhondt" | "overview">("overview");
  const [data, setData] = useState<ElectionData>(defaultElectionData);
  const { savedData, loading, deleteStation: deleteFromDb } = useStationData();
  const location = useLocation();

  const totalVotersAll = POLLING_STATIONS.reduce((a, s) => a + s.totalVoters, 0);

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

  useEffect(() => {
    if (location.state?.electionData) {
      setData(location.state.electionData);
      setActiveTab("summary");
    }
  }, [location.state]);

  // Auto-load aggregated data from stations whenever savedData changes
  useEffect(() => {
    if (aggregated.validCount === 0) return;
    setData({
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
    });
  }, [aggregated, totalVotersAll]);

  const result = useMemo(() => calculateDhondt(data), [data]);


  const loadFromStations = () => {
    if (aggregated.validCount === 0) return;
    setData({
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
    });
    setActiveTab("summary");
  };

  const deleteStation = async (id: number) => {
    try { await deleteFromDb(id); } catch { /* logged in hook */ }
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
    a.href = url; a.download = "rezultati_biracka_mesta.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const updateParty = (index: number, field: keyof Party, value: string | number | boolean) => {
    setData(prev => ({ ...prev, parties: prev.parties.map((p, i) => i === index ? { ...p, [field]: value } : p) }));
  };
  const updateField = (field: keyof ElectionData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };
  const addParty = () => {
    setData(prev => ({ ...prev, parties: [...prev.parties, { name: "Нова листа", votes: 0, isMinority: false, minorityCoefficient: 1 }] }));
  };
  const removeParty = (index: number) => {
    if (data.parties.length <= 2) return;
    setData(prev => ({ ...prev, parties: prev.parties.filter((_, i) => i !== index) }));
  };

  if (loading) {
    return (
      <div ref={ref} className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Учитавање података...</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Д'Онт калкулатор</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Распоред мандата — {data.municipality}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={exportToExcel}
              className="px-4 py-2 text-sm font-medium rounded-md bg-accent text-accent-foreground hover:opacity-90 transition-opacity">
              📥 Извези CSV
            </button>
            <button onClick={loadFromStations} disabled={aggregated.validCount === 0}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
              📊 Учитај из БМ ({aggregated.validCount})
            </button>
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              {(["overview", "summary", "dhondt"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {tab === "overview" ? "📋 Преглед БМ" : tab === "summary" ? "📊 Резултати" : "🔢 Д'Онт"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 animate-fade-in">
        {activeTab === "overview" ? (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-muted px-5 py-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Преглед свих бирачких места — {aggregated.validCount} / {POLLING_STATIONS.length} унето
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary">
                    <TableHead className="text-xs font-semibold uppercase w-12">Бр.</TableHead>
                    <TableHead className="text-xs font-semibold uppercase">Бирачко место</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-right">Бирачи</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-right">Гласали</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-right">У кутији</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-right">Невaж.</TableHead>
                    {PARTIES.map((p, i) => (
                      <TableHead key={i} className="text-xs font-semibold uppercase text-right">{p.name}</TableHead>
                    ))}
                    <TableHead className="text-xs font-semibold uppercase text-center">Статус</TableHead>
                    <TableHead className="text-xs font-semibold uppercase w-12"></TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-right text-muted-foreground">2022 Гласали</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-right text-muted-foreground">2022 СНС</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-right text-blue-600">Укупно наши</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {POLLING_STATIONS.map(s => {
                    const d = savedData[s.id];
                    const valid = d ? isValid(d, s.totalVoters) : false;
                    return (
                      <TableRow key={s.id} className={d ? (valid ? "bg-green-50/50 dark:bg-green-950/20" : "bg-destructive/5") : ""}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{s.id}</TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium text-foreground">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.address}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-muted-foreground">{s.totalVoters.toLocaleString("sr")}</TableCell>
                        {d ? (
                          <>
                            <TableCell className="text-right font-mono text-sm text-foreground">{d.totalVoted.toLocaleString("sr")}</TableCell>
                            <TableCell className="text-right font-mono text-sm text-foreground">{d.totalInBox.toLocaleString("sr")}</TableCell>
                            <TableCell className="text-right font-mono text-sm text-foreground">{d.totalInvalid.toLocaleString("sr")}</TableCell>
                            {(() => {
                              const validVotes = d.partyVotes.reduce((a, b) => a + b, 0);
                              return d.partyVotes.map((v, i) => {
                                const pct = validVotes > 0 ? (v / validVotes * 100) : 0;
                                return (
                                  <TableCell key={i} className="text-right font-mono text-sm text-foreground">
                                    {v.toLocaleString("sr")}
                                    <div className="text-[10px] text-muted-foreground">{pct > 0 ? `${pct.toFixed(1)}%` : ""}</div>
                                  </TableCell>
                                );
                              });
                            })()}
                            <TableCell className="text-center">
                              <span className={`text-xs font-medium ${valid ? "text-green-600" : "text-destructive"}`}>
                                {valid ? "✅" : "⚠️"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <button onClick={() => deleteStation(s.id)}
                                className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition">
                                🗑
                              </button>
                            </TableCell>
                            {(() => {
                              const e22 = ELECTION_2022[s.id];
                              return e22 ? (
                                <>
                                  <TableCell className="text-right font-mono text-xs text-muted-foreground">{e22.totalVoted.toLocaleString("sr")}</TableCell>
                                  <TableCell className="text-right font-mono text-xs text-muted-foreground">{e22.snsVotes.toLocaleString("sr")}</TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell className="text-right text-muted-foreground/40">—</TableCell>
                                  <TableCell className="text-right text-muted-foreground/40">—</TableCell>
                                </>
                              );
                            })()}
                            <TableCell className="text-right font-mono text-sm font-semibold text-blue-600">
                              {(UKUPNO_NASI[s.id] ?? 0).toLocaleString("sr")}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="text-right text-muted-foreground/40">—</TableCell>
                            <TableCell className="text-right text-muted-foreground/40">—</TableCell>
                            <TableCell className="text-right text-muted-foreground/40">—</TableCell>
                            {PARTIES.map((_, i) => (
                              <TableCell key={i} className="text-right text-muted-foreground/40">—</TableCell>
                            ))}
                            <TableCell className="text-center text-muted-foreground/40 text-xs">Чека унос</TableCell>
                            <TableCell></TableCell>
                            {(() => {
                              const e22 = ELECTION_2022[s.id];
                              return e22 ? (
                                <>
                                  <TableCell className="text-right font-mono text-xs text-muted-foreground">{e22.totalVoted.toLocaleString("sr")}</TableCell>
                                  <TableCell className="text-right font-mono text-xs text-muted-foreground">{e22.snsVotes.toLocaleString("sr")}</TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell className="text-right text-muted-foreground/40">—</TableCell>
                                  <TableCell className="text-right text-muted-foreground/40">—</TableCell>
                                </>
                              );
                            })()}
                            <TableCell className="text-right font-mono text-sm font-semibold text-blue-600">
                              {(UKUPNO_NASI[s.id] ?? 0).toLocaleString("sr")}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-secondary font-semibold border-t-2">
                    <TableCell></TableCell>
                    <TableCell className="text-sm text-secondary-foreground">УКУПНО</TableCell>
                    <TableCell className="text-right font-mono text-sm text-secondary-foreground">{totalVotersAll.toLocaleString("sr")}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-secondary-foreground">{aggregated.totalVoted.toLocaleString("sr")}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-secondary-foreground">{aggregated.totalInBox.toLocaleString("sr")}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-secondary-foreground">{aggregated.totalInvalid.toLocaleString("sr")}</TableCell>
                    {(() => {
                      const totalValid = aggregated.partyTotals.reduce((a, b) => a + b, 0);
                      return aggregated.partyTotals.map((t, i) => {
                        const pct = totalValid > 0 ? (t / totalValid * 100) : 0;
                        return (
                          <TableCell key={i} className="text-right font-mono text-sm text-secondary-foreground">
                            {t.toLocaleString("sr")}
                            <div className="text-[10px]">{pct > 0 ? `${pct.toFixed(1)}%` : ""}</div>
                          </TableCell>
                        );
                      });
                    })()}
                    <TableCell className="text-center text-xs text-secondary-foreground">{aggregated.validCount} ✅</TableCell>
                    <TableCell></TableCell>
                    {(() => {
                      let totalVoted2022 = 0, totalSns2022 = 0;
                      const seen = new Set<number>();
                      POLLING_STATIONS.forEach(s => {
                        const e = ELECTION_2022[s.id];
                        if (!e) return;
                        // Don't double-count BM 13+14 (same old data)
                        if (s.id === 14) return;
                        totalVoted2022 += e.totalVoted;
                        totalSns2022 += e.snsVotes;
                      });
                      return (
                        <>
                          <TableCell className="text-right font-mono text-xs text-secondary-foreground">{totalVoted2022.toLocaleString("sr")}</TableCell>
                          <TableCell className="text-right font-mono text-xs text-secondary-foreground">{totalSns2022.toLocaleString("sr")}</TableCell>
                        </>
                      );
                    })()}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        ) : activeTab === "summary" ? (
          <SummarySheet data={data} result={result} processedStations={aggregated.validCount} totalStations={POLLING_STATIONS.length} updateField={updateField} updateParty={updateParty} addParty={addParty} removeParty={removeParty} />
        ) : (
          <DhondtSheet data={data} result={result} />
        )}
      </main>
    </div>
  );
});

Index.displayName = "Index";
export default Index;
