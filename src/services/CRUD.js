import { supabase } from "./supabase";

// Consulta daños y fotos desde supabase
export const fetchDamageInfo = async (vin) => {
  const { data, error } = await supabase.rpc("get_scans_with_damages", {
    p_vin: vin,
    p_limit: 10,
    p_offset: 0,
  });

  if (error) {
    console.error(error);
    return null;
  }
  return data;
};

export const getVIN = async (vin, transportNbr) => {
  const { data, error } = await supabase
    .schema("carpointer")
    .from("movimientos")
    .select("idtequipo, nombreorigen, nombredestino")
    .eq("vin", vin)
    .maybeSingle();

  if (error || !data) {
    return { ok: false };
  }

  if (String(data.idtequipo) !== String(transportNbr)) {
    return { ok: false, mismatch: true };
  }

  return {
    ok: true,
    origen: data.nombreorigen,
    destino: data.nombredestino,
  };
};
