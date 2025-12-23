let triggerSync: (() => void) | null = null;

export const registerSyncTrigger = (fn: () => void) => {
  triggerSync = fn;
};

export const requestSync = () => {
  triggerSync?.();
};

const danos = [
  {
    damages: [[Object], [Object]],
    date: "2025-12-23T04:53:26.369Z",
    id: 2,
    photos: [],
    vin: "1GKKNPLS5KZ185312",
  },
  {
    damages: [[Object], [Object], [Object]],
    date: "2025-12-23T04:35:27.114Z",
    id: 1,
    photos: [],
    vin: "2GNFLGE30D6201432",
  },
];

const Scanitem = {
  damages: [
    { area: "02", averia: "DP", codigo: "NT", grav: "2", id: 2, obs: "UFJF" },
    { area: "03", averia: "G", codigo: "NT", grav: "4", id: 5, obs: "IDIEIE" },
  ],
  date: "2025-12-23T04:53:26.369Z",
  fotos: [],
  id: 2,
  vin: "1GKKNPLS5KZ185312",
};

const consultadaitem = {
  "0": {
    area: "01",
    averia: "DP",
    codigo: "TD",
    grav: "3",
    id: 1,
    obs: "KFIFF",
  },
  "1": {
    area: "02",
    averia: "DP",
    codigo: "NT",
    grav: "2",
    id: 3,
    obs: "KXJX",
  },
  "2": { area: "04", averia: "F", codigo: "NT", grav: "4", id: 4, obs: "EIE" },
  date: "2025-12-23T04:35:27.114Z",
  fotos: [],
  vin: "2GNFLGE30D6201432",
};
