import { supabase } from "./supabase";

// Consulta daños y fotos desde supabase
export const fetchDamageInfo = async (vin) => {
  const { data, error } = await supabase.rpc("get_scans_with_damages", {
    p_vin: vin, // o "1GKKNPLS5KZ185312"
    p_limit: 10,
    p_offset: 0,
  });

  if (error) {
    console.error(error);
    return null;
  }
  return data;
};
