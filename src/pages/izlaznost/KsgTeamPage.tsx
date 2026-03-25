import { useParams } from "react-router-dom";
import TurnoutTeamPage from "@/components/TurnoutTeamPage";
import { KSG_TEAMS } from "@/lib/turnoutConstants";

export default function KsgTeamPage() {
  const { team } = useParams<{ team: string }>();
  const teamInfo = KSG_TEAMS.find(t => t.key === team);

  if (!teamInfo) return <div className="p-6 text-destructive">Непознат тим</div>;

  return <TurnoutTeamPage teamType={`ksg_${teamInfo.key}`} title={`КСГ — ${teamInfo.label}`} allowOrgManagement />;
}
