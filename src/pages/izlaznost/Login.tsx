import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/izlaznost/pregled", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError("Погрешан email или лозинка");
    } else {
      navigate("/izlaznost/pregled", { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card border rounded-xl shadow-sm p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">📊 Излазност</h1>
            <p className="text-sm text-muted-foreground mt-1">Праћење изборне излазности</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="admin@example.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Лозинка</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••" />
            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "⏳ Пријава..." : "Пријави се"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
