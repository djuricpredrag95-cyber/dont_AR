import { ElectionData, DhondtResult, Party } from "@/lib/dhondt";

interface Props {
  data: ElectionData;
  result: DhondtResult;
  updateField: (field: keyof ElectionData, value: string | number) => void;
  updateParty: (index: number, field: keyof Party, value: string | number | boolean) => void;
  addParty: () => void;
  removeParty: (index: number) => void;
}

export default function SummarySheet({ data, result, updateField, updateParty, addParty, removeParty }: Props) {
  return (
    <div className="space-y-6">
      {/* General Info */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-table-header px-5 py-3">
          <h2 className="text-sm font-semibold text-table-header-foreground uppercase tracking-wider">
            Општи подаци
          </h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Општина</label>
            <input
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-ring"
              value={data.municipality}
              onChange={e => updateField("municipality", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Број бирача</label>
            <input
              type="number"
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring"
              value={data.totalVoters}
              onChange={e => updateField("totalVoters", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Укупно мандата</label>
            <input
              type="number"
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring"
              value={data.totalMandates}
              onChange={e => updateField("totalMandates", Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Гласало" value={result.totalVoted.toLocaleString("sr")} sub={`${result.percentVoted.toFixed(2)}%`} />
        <StatCard label="У кутији" value={result.totalInBox.toLocaleString("sr")} sub={`${((result.totalInBox / result.totalVoted) * 100).toFixed(2)}%`} />
        <StatCard label="Неважећи" value={result.totalInvalid.toLocaleString("sr")} sub={`${((result.totalInvalid / result.totalVoted) * 100).toFixed(2)}%`} />
        <StatCard label="Важећи" value={result.totalValid.toLocaleString("sr")} sub={`${((result.totalValid / result.totalVoted) * 100).toFixed(2)}%`} />
        <StatCard label="Бир. места" value={`${data.totalMandates} од ${data.totalMandates}`} />
      </div>

      {/* Parties table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-table-header px-5 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-table-header-foreground uppercase tracking-wider">
            Листе и резултати
          </h2>
          <button
            onClick={addParty}
            className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium"
          >
            + Додај листу
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary">
                <th className="text-left px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide">Листа</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide">Гласови</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide">Мањина</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide">Коеф.</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide">%</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-secondary-foreground uppercase tracking-wide">Мандати</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.parties.map((party, i) => (
                <tr key={i} className={`border-b transition-colors hover:bg-table-row-hover ${i % 2 === 0 ? "bg-card" : "bg-table-row-even"}`}>
                  <td className="px-4 py-2">
                    <input
                      className="w-full px-2 py-1.5 rounded border bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                      value={party.name}
                      onChange={e => updateParty(i, "name", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      className="w-full px-2 py-1.5 rounded border bg-background text-foreground font-mono text-right focus:outline-none focus:ring-2 focus:ring-ring"
                      value={party.votes}
                      onChange={e => updateParty(i, "votes", Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={party.isMinority}
                      onChange={e => {
                        updateParty(i, "isMinority", e.target.checked);
                        updateParty(i, "minorityCoefficient", e.target.checked ? 1.35 : 1);
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                  </td>
                  <td className="px-4 py-2 text-center font-mono text-sm text-muted-foreground">
                    {party.minorityCoefficient.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-sm font-semibold text-foreground">
                    {result.partyPercentages[i]?.toFixed(2)}%
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                      {result.mandates[i]}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeParty(i)}
                      className="text-muted-foreground hover:text-accent transition-colors text-sm"
                      title="Обриши"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-secondary font-semibold">
                <td className="px-4 py-3 text-secondary-foreground">Укупно</td>
                <td className="px-4 py-3 text-right font-mono text-secondary-foreground">{result.totalValid.toLocaleString("sr")}</td>
                <td></td>
                <td></td>
                <td className="px-4 py-3 text-right font-mono text-secondary-foreground">100.00%</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-table-header text-table-header-foreground font-bold text-lg">
                    {result.mandates.reduce((a, b) => a + b, 0)}
                  </span>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar chart visualization */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-table-header px-5 py-3">
          <h2 className="text-sm font-semibold text-table-header-foreground uppercase tracking-wider">
            Графички приказ мандата
          </h2>
        </div>
        <div className="p-5 space-y-3">
          {data.parties.map((party, i) => {
            const maxMandates = Math.max(...result.mandates);
            const pct = maxMandates > 0 ? (result.mandates[i] / maxMandates) * 100 : 0;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-foreground truncate">{party.name}</div>
                <div className="flex-1 bg-secondary rounded-full h-8 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  >
                    <span className="text-xs font-bold text-primary-foreground">{result.mandates[i]}</span>
                  </div>
                </div>
                <div className="w-16 text-right text-sm font-mono text-muted-foreground">
                  {result.partyPercentages[i]?.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1 font-mono">{value}</p>
      {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
