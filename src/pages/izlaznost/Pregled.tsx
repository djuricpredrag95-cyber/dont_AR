import { useTurnoutEntries } from "@/hooks/useTurnoutData";
import { HOURS, KSG_TEAMS } from "@/lib/turnoutConstants";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

const SOURCES = [
  { key: "ksg", label: "КСГ", types: KSG_TEAMS.map(t => `ksg_${t.key}`) },
  { key: "teren", label: "Терен", types: ["teren"] },
  { key: "kolcentar", label: "Колцентар", types: ["kolcentar"] },
  { key: "bo", label: "БО", types: ["bo"] },
];

function SourceRow({ label, types }: { label: string; types: string[] }) {
  // Fetch all relevant source types and combine
  const allEntries = types.map(t => useTurnoutEntries(t));
  const entries = allEntries.flatMap(e => e.entries);

  return (
    <TableRow>
      <TableCell className="text-sm font-semibold text-foreground">{label}</TableCell>
      {HOURS.map(h => {
        const hourTotal = entries.filter(e => e.hour === h).reduce((s, e) => s + e.count, 0);
        return (
          <TableCell key={h} className="text-center font-mono text-sm">
            {hourTotal > 0 ? hourTotal.toLocaleString("sr") : <span className="text-muted-foreground/30">—</span>}
          </TableCell>
        );
      })}
      <TableCell className="text-right font-mono text-sm font-semibold">
        {entries.reduce((s, e) => s + e.count, 0).toLocaleString("sr")}
      </TableCell>
    </TableRow>
  );
}

export default function Pregled() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">📊 Централни преглед излазности</h2>
        <p className="text-sm text-muted-foreground mt-1">Укупни подаци из свих извора — ажурирање у реалном времену</p>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="text-xs font-semibold uppercase">Извор</TableHead>
                {HOURS.map(h => (
                  <TableHead key={h} className="text-xs font-semibold uppercase text-center w-16">{h}</TableHead>
                ))}
                <TableHead className="text-xs font-semibold uppercase text-right">Укупно</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SOURCES.map(s => (
                <SourceRow key={s.key} label={s.label} types={s.types} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
