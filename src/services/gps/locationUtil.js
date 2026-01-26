const LOCACIONES = [
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

const BUFFER_METROS = 0;
// const BUFFER_METROS = 30;

export const resolverLocacion = (coords) => {
  if (!coords || coords.accuracy > 150) return null;

  for (const loc of LOCACIONES) {
    const d = distanciaMetros(
      coords.latitude,
      coords.longitude,
      loc.latitude,
      loc.longitude,
    );

    if (d <= loc.radio - BUFFER_METROS) {
      return loc.nombre; // ✅ STRING
    }
  }

  return null; // ✅ NO JSX
};
