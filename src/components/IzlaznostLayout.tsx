import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { KSG_TEAMS } from "@/lib/turnoutConstants";
import { useState } from "react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2 rounded-lg text-sm transition-colors ${
    isActive
      ? "bg-primary text-primary-foreground font-semibold"
      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
  }`;

const sectionHeader = "px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60";

export default function IzlaznostLayout() {
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-14" : "w-56"} border-r bg-card flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!collapsed && <h1 className="text-lg font-bold text-foreground tracking-tight">📊 Излазност</h1>}
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground text-sm">
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {!collapsed && (
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <NavLink to="/izlaznost/pregled" className={navLinkClass}>🏠 Преглед</NavLink>

            <div className="pt-3">
              <p className={sectionHeader}>КАПИЛАРНИ ГЛАС</p>
              {KSG_TEAMS.map(t => (
                <NavLink key={t.key} to={t.path} className={navLinkClass}>
                  {t.label}
                </NavLink>
              ))}
              <NavLink to="/izlaznost/ksg/pregled" className={navLinkClass}>📋 Преглед КСГ</NavLink>
            </div>

            <div className="pt-3">
              <p className={sectionHeader}>Остало</p>
              <NavLink to="/izlaznost/teren" className={navLinkClass}>🗺️ Терен</NavLink>
              <NavLink to="/izlaznost/kolcentar" className={navLinkClass}>📞 Колцентар</NavLink>
              <NavLink to="/izlaznost/bo" className={navLinkClass}>🏢 БО</NavLink>
            </div>
          </nav>
        )}

        <div className="p-3 border-t">
          {!collapsed && (
            <button onClick={signOut}
              className="w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
              🚪 Одјави се
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
