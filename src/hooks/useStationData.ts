import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { POLLING_STATIONS, PARTIES, PollingStationData } from "@/lib/pollingStations";

interface DbRow {
  station_id: number;
  total_voted: number;
  total_in_box: number;
  total_invalid: number;
  party_votes: number[];
}

function rowToStationData(row: DbRow): PollingStationData {
  return {
    stationId: row.station_id,
    totalVoted: row.total_voted,
    totalInBox: row.total_in_box,
    totalInvalid: row.total_invalid,
    partyVotes: row.party_votes.length === PARTIES.length
      ? row.party_votes
      : PARTIES.map((_, i) => row.party_votes[i] ?? 0),
  };
}

export function useStationData() {
  const [savedData, setSavedData] = useState<Record<number, PollingStationData>>({});
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from("polling_station_results")
      .select("*");
    if (error) {
      console.error("Error fetching stations:", error);
      return;
    }
    const map: Record<number, PollingStationData> = {};
    (data as DbRow[]).forEach(row => {
      map[row.station_id] = rowToStationData(row);
    });
    setSavedData(map);
    setLoading(false);
  }, []);

  // Initial fetch + poll every 5s
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const saveStation = useCallback(async (stationData: PollingStationData) => {
    const { error } = await supabase
      .from("polling_station_results")
      .upsert({
        station_id: stationData.stationId,
        total_voted: stationData.totalVoted,
        total_in_box: stationData.totalInBox,
        total_invalid: stationData.totalInvalid,
        party_votes: stationData.partyVotes,
        updated_at: new Date().toISOString(),
      }, { onConflict: "station_id" });
    if (error) {
      console.error("Error saving station:", error);
      throw error;
    }
    await fetchAll();
  }, [fetchAll]);

  const deleteStation = useCallback(async (stationId: number) => {
    const { error } = await supabase
      .from("polling_station_results")
      .delete()
      .eq("station_id", stationId);
    if (error) {
      console.error("Error deleting station:", error);
      throw error;
    }
    await fetchAll();
  }, [fetchAll]);

  return { savedData, loading, saveStation, deleteStation, refetch: fetchAll };
}
