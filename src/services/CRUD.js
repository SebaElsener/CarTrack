
import { supabase } from "./supabase";

// Consulta daños desde supabase
export const fetchDamageInfo = async (vin) => {
  const { data, error } = await supabase
    .from("scans")
    .select("*")
    .eq("code", vin);
  if (error) {
    console.error("Error fetching damage info:", error);
    return null;
  }
  return data;
};