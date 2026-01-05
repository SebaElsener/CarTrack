import { createContext, useContext, useEffect, useState } from "react";
import { getScansCount } from "../database/Database";

const ScansContext = createContext();

export const ScansProvider = ({ children }) => {
  const [scansCount, setScansCount] = useState(0);

  // 🆕 datos de la descarga
  const [transportUnit, setTransportUnit] = useState("");
  const [totalUnits, setTotalUnits] = useState(0);
  const [completed, setCompleted] = useState(false);

  const refreshScansCount = async () => {
    const count = await getScansCount();
    const safeCount = count ?? 0;

    setScansCount(safeCount);

    // 🔔 detectar finalización
    if (totalUnits > 0 && safeCount >= totalUnits) {
      setCompleted(true);
    }
  };

  // ➕ llamar cuando se agrega un scan nuevo
  const incrementScan = () => {
    setScansCount((prev) => {
      const next = prev + 1;

      if (totalUnits > 0 && next >= totalUnits) {
        setCompleted(true);
      }

      return next;
    });
  };

  // 🔄 reset manual (nueva descarga)
  const resetDownload = () => {
    setScansCount(0);
    setTotalUnits(0);
    setTransportUnit("");
    setCompleted(false);
  };

  // 🔁 cargar contador real al iniciar
  useEffect(() => {
    refreshScansCount();
  }, []);

  return (
    <ScansContext.Provider
      value={{
        scansCount,
        refreshScansCount,
        incrementScan,

        transportUnit,
        setTransportUnit,

        totalUnits,
        setTotalUnits,

        completed,
        resetDownload,
      }}
    >
      {children}
    </ScansContext.Provider>
  );
};

export const useScans = () => useContext(ScansContext);
