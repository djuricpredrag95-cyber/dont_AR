import { useState } from "react";
import { useTurnoutOrganizations, useTurnoutEntries } from "@/hooks/useTurnoutData";
import { HOURS } from "@/lib/turnoutConstants";
import { HISTORICAL_TURNOUT, HISTORICAL_COMBINED_BMS } from "@/lib/historicalTurnout";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  teamType: string;
  title: string;
  allowOrgManagement?: boolean;
  fixedOrgs?: { id: number; name: string; target: number }[];
  /** Show historical 2022/2023 data per org in table view */
  showHistorical?: boolean;
}

export default function TurnoutTeamPage({ teamType, title, allowOrgManagement = true, fixedOrgs, showHistorical = false }: Props) {
  const [tab, setTab] = useState<"entry" | "view">("entry");
  const { orgs: dynamicOrgs, addOrg, deleteOrg } = useTurnoutOrganizations(teamType);
  const { entries, saveEntry, getNextHour, getEntry } = useTurnoutEntries(teamType);

  const orgs = fixedOrgs ?? dynamicOrgs;

  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalOrg, setModalOrg] = useState<{ id: number; name: string } | null>(null);
  const [modalHour, setModalHour] = useState("");
  const [modalCount, setModalCount] = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  const openModal = (org: { id: number; name: string }) => {
    const nextHour = getNextHour(org.id);
    setModalOrg(org);
    setModalHour(nextHour);
    setModalCount("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!modalOrg || !modalCount) return;
    setModalSaving(true);
    await saveEntry(modalOrg.id, modalHour, Number(modalCount));
    setModalSaving(false);
    setModalOpen(false);
  };

  const handleAddOrg = async () => {
    if (!newName.trim()) return;
    await addOrg(newName.trim(), Number(newTarget) || 0);
    setNewName("");
    setNewTarget("");
  };

  // Get cumulative total (last filled hour value) for an org
  const getOrgTotal = (orgId: number): number => {
    const orgEntries = entries.filter(e => e.source_id === orgId);
    if (orgEntries.length === 0) return 0;
    const lastHour = [...HOURS].reverse().find(h => orgEntries.some(e => e.hour === h));
    if (!lastHour) return 0;
    return orgEntries.filter(e => e.hour === lastHour).reduce((s, e) => s + e.count, 0);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {(["entry", "view"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t === "entry" ? "📝 Унос" : "📊 Преглед"}
            </button>
          ))}
        </div>
      </div>

      {tab === "entry" ? (
        <div className="space-y-4">
          {allowOrgManagement && (
            <div className="bg-card border rounded-xl p-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Назив</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Назив организације" />
              </div>
              <div className="w-32">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Target</label>
                <input type="number" min="0" value={newTarget} onChange={e => setNewTarget(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0" />
              </div>
              <button onClick={handleAddOrg}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                + Додај
              </button>
            </div>
          )}

          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="bg-muted px-5 py-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {orgs.length} организација{orgs.length !== 1 ? "а" : ""}  — клик за унос
              </h3>
            </div>
            <div className="divide-y">
              {orgs.map(org => {
                const nextHour = getNextHour(org.id);
                const filledCount = entries.filter(e => e.source_id === org.id).length;
                return (
                  <div key={org.id}
                    onClick={() => openModal(org)}
                    className="flex items-center justify-between px-5 py-3 hover:bg-secondary/50 cursor-pointer transition-colors">
                    <div>
                      <span className="text-sm font-medium text-foreground">{org.name}</span>
                      {org.target > 0 && <span className="text-xs text-muted-foreground ml-2">(target: {org.target})</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{filledCount}/{HOURS.length} сати</span>
                      <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent font-medium">→ {nextHour}</span>
                      {allowOrgManagement && (
                        <button onClick={(e) => { e.stopPropagation(); deleteOrg(org.id); }}
                          className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition">
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {orgs.length === 0 && (
                <div className="px-5 py-8 text-center text-muted-foreground text-sm">
                  {allowOrgManagement ? "Додајте организацију изнад" : "Нема података"}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary">
                  <TableHead className="text-xs font-semibold uppercase">Организација</TableHead>
                  {HOURS.map(h => (
                    <TableHead key={h} className="text-xs font-semibold uppercase text-center w-16">{h}</TableHead>
                  ))}
                  <TableHead className="text-xs font-semibold uppercase text-right">Укупно</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgs.map(org => {
                  const total = getOrgTotal(org.id);
                  const hist = showHistorical ? HISTORICAL_TURNOUT[org.id] : null;
                  return (
                    <>
                      <TableRow key={org.id}>
                        <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">{org.name}</TableCell>
                        {HOURS.map(h => {
                          const val = getEntry(org.id, h);
                          return (
                            <TableCell key={h} className="text-center font-mono text-sm">
                              {val !== undefined ? val.toLocaleString("sr") : <span className="text-muted-foreground/30">—</span>}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-mono text-sm font-semibold text-foreground">
                          {total > 0 ? total.toLocaleString("sr") : "—"}
                        </TableCell>
                      </TableRow>
                      {hist && (
                        <>
                          <TableRow key={`${org.id}-2022`} className="bg-muted/30">
                            <TableCell className="text-xs text-muted-foreground italic pl-8">↳ 2022</TableCell>
                            {HOURS.map(h => {
                              const v = hist[h]?.y2022;
                              return (
                                <TableCell key={h} className="text-center font-mono text-xs text-muted-foreground">
                                  {v !== undefined ? v.toLocaleString("sr") : "—"}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                              {(hist["20:00"]?.y2022 ?? 0).toLocaleString("sr")}
                            </TableCell>
                          </TableRow>
                          <TableRow key={`${org.id}-2023`} className="bg-muted/30">
                            <TableCell className="text-xs text-muted-foreground italic pl-8">↳ 2023</TableCell>
                            {HOURS.map(h => {
                              const v = hist[h]?.y2023;
                              return (
                                <TableCell key={h} className="text-center font-mono text-xs text-muted-foreground">
                                  {v !== undefined ? v.toLocaleString("sr") : "—"}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                              {(hist["20:00"]?.y2023 ?? 0).toLocaleString("sr")}
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </>
                  );
                })}
                <TableRow className="bg-secondary font-semibold border-t-2">
                  <TableCell className="text-sm text-secondary-foreground">УКУПНО</TableCell>
                  {HOURS.map(h => {
                    const hourTotal = entries.filter(e => e.hour === h).reduce((s, e) => s + e.count, 0);
                    return (
                      <TableCell key={h} className="text-center font-mono text-sm text-secondary-foreground">
                        {hourTotal > 0 ? hourTotal.toLocaleString("sr") : "—"}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right font-mono text-sm text-secondary-foreground">
                    {(() => {
                      const lastHourVal = [...HOURS].reverse().reduce((found, h) => {
                        if (found > 0) return found;
                        const t = entries.filter(e => e.hour === h).reduce((s, e) => s + e.count, 0);
                        return t > 0 ? t : 0;
                      }, 0);
                      return lastHourVal > 0 ? lastHourVal.toLocaleString("sr") : "—";
                    })()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{modalOrg?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Сат</label>
              <select value={modalHour} onChange={e => setModalHour(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {HOURS.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Број</label>
              <input type="number" min="0" value={modalCount} onChange={e => setModalCount(e.target.value)}
                autoFocus
                className="mt-1 w-full px-3 py-2.5 rounded-lg border bg-background text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0" />
            </div>
            <button onClick={handleSave} disabled={modalSaving || !modalCount}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
              {modalSaving ? "⏳ Чување..." : "💾 Сачувај"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
