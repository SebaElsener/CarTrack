import { supabase } from "./supabase";

export const getVIN = async (vin, transportNbr) => {
  const { data, error } = await supabase
    .schema("carpointer")
    .from("movimientos")
    .select("idtequipo, nombreorigen, nombredestino")
    .eq("vin", vin)
    .maybeSingle();

  // ❌ VIN no existe
  if (error || !data) {
    return { ok: false, type: "not_found" };
  }

  // ❌ No corresponde a la carga
  if (String(data.idtequipo) !== String(transportNbr)) {
    return { ok: false, type: "wrong_transport" };
  }

  // ✅ OK
  return {
    ok: true,
    origen: data.nombreorigen,
    destino: data.nombredestino,
  };
};

export const getMovimientosByEquipo = async (transport_nbr) => {
  try {
    const { data, error } = await supabase
      .schema("carpointer")
      .from("movimientos")
      .select("vin, idtviaje, nombreorigen, nombredestino")
      .order("idtviaje", { ascending: true })
      .eq("idtequipo", transport_nbr);

    if (error) {
      console.error("Error getMovimientosByEquipo:", error);
      return { ok: false, data: [], error };
    }

    return { ok: true, data };
  } catch (err) {
    console.error("Error inesperado movimientos:", err);
    return { ok: false, data: [], error: err };
  }
};
