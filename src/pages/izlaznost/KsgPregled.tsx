import { useTurnoutEntries } from "@/hooks/useTurnoutData";
import { HOURS, KSG_TEAMS } from "@/lib/turnoutConstants";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

export default function KsgPregled() {
  const allTeamEntries = KSG_TEAMS.map(t => ({
    ...t,
    ...useTurnoutEntries(`ksg_${t.key}`),
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">📋 Преглед КСГ</h2>
        <p className="text-sm text-muted-foreground mt-1">Агрегирани подаци свих 5 тимова по сатима</p>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="text-xs font-semibold uppercase">Тим</TableHead>
                {HOURS.map(h => (
                  <TableHead key={h} className="text-xs font-semibold uppercase text-center w-16">{h}</TableHead>
                ))}
                <TableHead className="text-xs font-semibold uppercase text-right">Укупно</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTeamEntries.map(team => (
                <TableRow key={team.key}>
                  <TableCell className="text-sm font-medium text-foreground">{team.label}</TableCell>
                  {HOURS.map(h => {
                    const hourTotal = team.entries.filter(e => e.hour === h).reduce((s, e) => s + e.count, 0);
                    return (
                      <TableCell key={h} className="text-center font-mono text-sm">
                        {hourTotal > 0 ? hourTotal.toLocaleString("sr") : <span className="text-muted-foreground/30">—</span>}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {team.entries.reduce((s, e) => s + e.count, 0).toLocaleString("sr")}
                  </TableCell>
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow className="bg-secondary font-semibold border-t-2">
                <TableCell className="text-sm text-secondary-foreground">УКУПНО</TableCell>
                {HOURS.map(h => {
                  const total = allTeamEntries.reduce((s, t) =>
                    s + t.entries.filter(e => e.hour === h).reduce((ss, e) => ss + e.count, 0), 0);
                  return (
                    <TableCell key={h} className="text-center font-mono text-sm text-secondary-foreground">
                      {total > 0 ? total.toLocaleString("sr") : "—"}
                    </TableCell>
                  );
                })}
                <TableCell className="text-right font-mono text-sm text-secondary-foreground">
                  {allTeamEntries.reduce((s, t) => s + t.entries.reduce((ss, e) => ss + e.count, 0), 0).toLocaleString("sr")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
