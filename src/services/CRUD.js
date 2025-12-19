
import { supabase } from "./supabase";

// Consulta daños y fotos desde supabase
export const fetchDamageInfo = async (vin) => {
  const { data, error } = await supabase
    .from("scans")
    .select(`
      supabase_id,
      code,
      area,
      averia,
      grav,
      obs,
      codigo,
      date,
      pictures (
        pictureurl
      )
    `)
    .eq("code", vin);
  if (error) {
    console.error("Error fetching damage info:", error);
    return null;
  }

    // Mapear datos para incluir fotos
    const mappedData =
    data.map((item) => ({
    id: item.supabase_id,
    vin: item.code,
    area: item.area,
    averia: item.averia,
    gravedad: item.grav,
    observaciones: item.obs,
    codigo: item.codigo,
    fecha: item.date,
    fotos: item.pictures ?? []
  }));
  return mappedData;
}