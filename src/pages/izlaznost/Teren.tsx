import TurnoutTeamPage from "@/components/TurnoutTeamPage";
import { POLLING_STATIONS } from "@/lib/pollingStations";

const fixedOrgs = POLLING_STATIONS.map(s => ({
  id: s.id,
  name: `${s.id}. ${s.name}`,
  target: s.totalVoters,
}));

export default function Teren() {
  return <TurnoutTeamPage teamType="teren" title="🗺️ Терен — Излазност по БМ" allowOrgManagement={false} fixedOrgs={fixedOrgs} showHistorical />;
}
