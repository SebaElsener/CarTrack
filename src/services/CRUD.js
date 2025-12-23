import { supabase } from "./supabase";

// Consulta daños y fotos desde supabase
export const fetchDamageInfo = async (vin) => {
  const { data, error } = await supabase
    .from("scans")
    .select(
      `
      supabase_id,
      vin,
      area,
      averia,
      grav,
      obs,
      codigo,
      date,
      pictures (
        pictureurl
      )
    `
    )
    .eq("vin", vin);
  if (error) {
    console.error("Error fetching damage info:", error);
    return null;
  }

  // Mapear datos para incluir fotos
  const mappedData = data.map((item) => ({
    id: item.supabase_id,
    vin: item.vin,
    area: item.area,
    averia: item.averia,
    grav: item.grav,
    obs: item.obs,
    codigo: item.codigo,
    date: item.date,
    fotos: item.pictures ?? [],
  }));
  return mappedData;
};
