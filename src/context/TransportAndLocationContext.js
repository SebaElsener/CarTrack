import { createContext, useContext, useState } from "react";

const AppStatusContext = createContext({
  //lugar: "Detectando...",
  destino: null,
});

export const AppStatusProvider = ({ children }) => {
  const [lugarGPS, setLugarGPS] = useState(null);
  const [lugarManual, setLugarManual] = useState(null);
  const [destino, setDestino] = useState(null);

  // prioridad:
  // manual > gps > fuera de zona
  const lugar = lugarManual ?? lugarGPS ?? "Fuera de zona";

  return (
    <AppStatusContext.Provider
      value={{
        lugar,
        destino,
        setDestino,

        // internos
        lugarGPS,
        setLugarGPS,
        lugarManual,
        setLugarManual,
      }}
    >
      {children}
    </AppStatusContext.Provider>
  );
};

export const useAppStatus = () => useContext(AppStatusContext);
