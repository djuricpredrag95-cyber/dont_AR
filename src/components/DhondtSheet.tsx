import { ElectionData, DhondtResult } from "@/lib/dhondt";

interface Props {
  data: ElectionData;
  result: DhondtResult;
}

export default function DhondtSheet({ data, result }: Props) {
  const { parties, totalMandates } = data;
  const { quotients, mandateMatrix, mandates, thresholdQuotient } = result;

  // Find max divisor used per party (where they still have quotients > 0)
  const maxDivisors = parties.map((_, pIdx) => {
    let max = 0;
    for (let d = 0; d < totalMandates; d++) {
      if (quotients[pIdx][d] > thresholdQuotient * 0.05) max = d + 1;
    }
    return Math.min(max, totalMandates);
  });

  const maxRows = Math.max(...maxDivisors, 1);

  return (
    <div className="space-y-6">
      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Укупно мандата</p>
          <p className="text-3xl font-bold text-foreground mt-1 font-mono">{totalMandates}</p>
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Гранични количник</p>
          <p className="text-3xl font-bold text-foreground mt-1 font-mono">{thresholdQuotient.toFixed(3)}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalMandates}. количник</p>
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Број листа</p>
          <p className="text-3xl font-bold text-foreground mt-1 font-mono">{parties.length}</p>
        </div>
      </div>

      {/* Votes and percentages */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-table-header px-5 py-3">
          <h2 className="text-sm font-semibold text-table-header-foreground uppercase tracking-wider">
            Гласови и коефицијенти
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary">
                <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide">Листа</th>
                {parties.map((p, i) => (
                  <th key={i} className="text-right px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2 text-sm font-medium text-foreground">Бр. гласова</td>
                {parties.map((p, i) => (
                  <td key={i} className="px-4 py-2 text-right font-mono text-sm text-foreground font-semibold">{p.votes.toLocaleString("sr")}</td>
                ))}
              </tr>
              <tr className="border-b bg-table-row-even">
                <td className="px-4 py-2 text-sm font-medium text-foreground">Проценат</td>
                {result.partyPercentages.map((pct, i) => (
                  <td key={i} className="px-4 py-2 text-right font-mono text-sm text-foreground">{pct.toFixed(2)}%</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2 text-sm font-medium text-foreground">Д'Онт коеф.</td>
                {parties.map((p, i) => (
                  <td key={i} className="px-4 py-2 text-right font-mono text-sm text-foreground">{p.minorityCoefficient.toFixed(2)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotients table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-table-header px-5 py-3">
          <h2 className="text-sm font-semibold text-table-header-foreground uppercase tracking-wider">
            Количници
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary">
                <th className="text-center px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide w-16">÷</th>
                {parties.map((p, i) => (
                  <th key={i} className="text-right px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxRows }, (_, d) => (
                <tr key={d} className={`border-b transition-colors ${d % 2 === 0 ? "bg-card" : "bg-table-row-even"}`}>
                  <td className="px-4 py-1.5 text-center font-mono text-xs text-muted-foreground font-semibold">{d + 1}</td>
                  {parties.map((_, pIdx) => {
                    const q = quotients[pIdx]?.[d];
                    const isMandateWinner = mandateMatrix[pIdx]?.[d];
                    if (q === undefined || d >= maxDivisors[pIdx]) {
                      return <td key={pIdx} className="px-4 py-1.5" />;
                    }
                    return (
                      <td
                        key={pIdx}
                        className={`px-4 py-1.5 text-right font-mono text-sm transition-colors ${
                          isMandateWinner
                            ? "bg-table-highlight font-bold text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {q.toFixed(3)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandates summary */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-table-header px-5 py-3">
          <h2 className="text-sm font-semibold text-table-header-foreground uppercase tracking-wider">
            Расподела мандата
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary">
                <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide"></th>
                {parties.map((p, i) => (
                  <th key={i} className="text-center px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide">{p.name}</th>
                ))}
                <th className="text-center px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide">Укупно</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-table-highlight font-bold text-lg">
                <td className="px-4 py-4 text-foreground">Број мандата</td>
                {mandates.map((m, i) => (
                  <td key={i} className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
                      {m}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-table-header text-table-header-foreground font-bold text-xl">
                    {mandates.reduce((a, b) => a + b, 0)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
