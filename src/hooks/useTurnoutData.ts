import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TurnoutOrganization, TurnoutEntry, HOURS } from "@/lib/turnoutConstants";

export function useTurnoutOrganizations(teamType: string) {
  const [orgs, setOrgs] = useState<TurnoutOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = useCallback(async () => {
    const { data } = await supabase
      .from("turnout_organizations")
      .select("*")
      .eq("team_type", teamType)
      .order("id");
    setOrgs(data ?? []);
    setLoading(false);
  }, [teamType]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  const addOrg = async (name: string, target: number) => {
    const { error } = await supabase
      .from("turnout_organizations")
      .insert({ name, target, team_type: teamType });
    if (!error) await fetchOrgs();
    return !error;
  };

  const deleteOrg = async (id: number) => {
    await supabase.from("turnout_organizations").delete().eq("id", id);
    await fetchOrgs();
  };

  return { orgs, loading, addOrg, deleteOrg, refetch: fetchOrgs };
}

export function useTurnoutEntries(sourceType: string) {
  const [entries, setEntries] = useState<TurnoutEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const fetchEntries = useCallback(async () => {
    const { data } = await supabase
      .from("turnout_entries")
      .select("*")
      .eq("source_type", sourceType)
      .eq("entry_date", today);
    setEntries(data ?? []);
    setLoading(false);
  }, [sourceType, today]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Poll every 5s
  useEffect(() => {
    const interval = setInterval(fetchEntries, 5000);
    return () => clearInterval(interval);
  }, [fetchEntries]);

  const saveEntry = async (sourceId: number | null, hour: string, count: number) => {
    const { error } = await supabase
      .from("turnout_entries")
      .upsert(
        { source_type: sourceType, source_id: sourceId, hour, count, entry_date: today },
        { onConflict: "source_type,source_id,hour,entry_date" }
      );
    if (!error) await fetchEntries();
    return !error;
  };

  const getNextHour = (sourceId: number | null): string => {
    const filled = entries
      .filter(e => e.source_id === sourceId)
      .map(e => e.hour);
    const next = HOURS.find(h => !filled.includes(h));
    return next ?? HOURS[HOURS.length - 1];
  };

  const getEntry = (sourceId: number | null, hour: string): number | undefined => {
    return entries.find(e => e.source_id === sourceId && e.hour === hour)?.count;
  };

  return { entries, loading, saveEntry, getNextHour, getEntry, refetch: fetchEntries };
}
