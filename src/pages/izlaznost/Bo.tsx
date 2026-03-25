import { useState } from "react";
import { useTurnoutEntries } from "@/hooks/useTurnoutData";
import { HOURS } from "@/lib/turnoutConstants";

export default function Bo() {
  const { entries, saveEntry, getNextHour } = useTurnoutEntries("bo");
  const [hour, setHour] = useState(() => getNextHour(null));
  const [count, setCount] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async () => {
    if (!count) return;
    setSaving(true);
    setMsg(null);
    const ok = await saveEntry(null, hour, Number(count));
    setMsg(ok ? "✅ Сачувано!" : "❌ Грешка");
    if (ok) {
      setCount("");
      // Auto advance to next hour
      const nextHour = getNextHour(null);
      setHour(nextHour);
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">🏢 БО — Унос по сатима</h2>
        <p className="text-sm text-muted-foreground mt-1">Један укупан број по сату</p>
      </div>

      <div className="bg-card border rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Сат</label>
          <select value={hour} onChange={e => setHour(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {HOURS.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Број</label>
          <input type="number" min="0" value={count} onChange={e => setCount(e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-lg border bg-background text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="0" />
        </div>
        {msg && <p className={`text-sm font-medium ${msg.startsWith("✅") ? "text-green-600" : "text-destructive"}`}>{msg}</p>}
        <button onClick={handleSave} disabled={saving || !count}
          className="w-full py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? "⏳ Чување..." : "💾 Сачувај"}
        </button>
      </div>

      {/* Preview of entered data */}
      <div className="mt-6 bg-card border rounded-xl overflow-hidden">
        <div className="bg-muted px-5 py-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Унети подаци</h3>
        </div>
        <div className="divide-y">
          {HOURS.map(h => {
            const entry = entries.find(e => e.hour === h && e.source_id === null);
            return (
              <div key={h} className="flex items-center justify-between px-5 py-2.5">
                <span className="text-sm font-medium text-foreground">{h}</span>
                <span className={`font-mono text-sm ${entry ? "text-foreground font-semibold" : "text-muted-foreground/30"}`}>
                  {entry ? entry.count.toLocaleString("sr") : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
