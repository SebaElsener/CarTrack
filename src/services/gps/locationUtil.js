export const LOCACIONES = [
  {
    nombre: "TZ",
    latitude: -34.074502,
    longitude: -59.042167,
    radio: 100,
  },
  {
    nombre: "El Molino",
    latitude: -34.106947,
    longitude: -59.097724,
    radio: 100,
  },
  {
    nombre: "Mi casa",
    latitude: -34.100822,
    longitude: -59.015534,
    radio: 100,
  },
  {
    nombre: "Mercado Zárate",
    latitude: -34.099386,
    longitude: -59.012104,
    radio: 100,
  },
  {
    nombre: "Elta Transporte S.R.L.",
    latitude: -34.098037,
    longitude: -59.086374,
    radio: 100,
  },
  {
    nombre: "El Pinar",
    latitude: -34.101784,
    longitude: -59.081459,
    radio: 100,
  },
];

const toRad = (v) => (v * Math.PI) / 180;

export const distanciaMetros = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const resolverLocacion = (coords, zonaActual) => {
  if (!coords) return zonaActual;

  const MARGEN_SALIDA = 40;

  for (const loc of LOCACIONES) {
    const d = distanciaMetros(
      coords.latitude,
      coords.longitude,
      loc.latitude,
      loc.longitude,
    );

    console.log("Zona:", loc.nombre, "Distancia:", d);

    // 🟢 Mantener zona actual con histéresis
    if (zonaActual === loc.nombre) {
      if (d <= loc.radio + MARGEN_SALIDA) {
        return zonaActual;
      }
      // si supera el margen, no retornamos todavía
      // dejamos que evalúe posible entrada a otra zona
    }

    // 🟢 Entrada normal
    if (!zonaActual && d <= loc.radio) {
      return loc.nombre;
    }
  }

  // 🔴 Si no encaja en ninguna
  return null;
};
