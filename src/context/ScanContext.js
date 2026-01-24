import { createContext, useContext, useEffect, useState } from "react";
import { getScansCount } from "../database/Database";

const ScansContext = createContext();

export const ScansProvider = ({ children }) => {
  // 🔢 TOTAL histórico (todos los VIN)
  const [totalScans, setTotalScans] = useState(0);

  // 🚚 descarga actual
  const [transportUnit, setTransportUnit] = useState("");
  const [transportScans, setTransportScans] = useState(0);
  const [totalUnits, setTotalUnits] = useState("");
  const [completed, setCompleted] = useState(false);
  const [transportActive, setTransportActive] = useState(false);

  //Validar cant unidades si se ingresa nro batea y clima
  const [transportError, setTransportError] = useState("");
  const [weatherError, setWeatherError] = useState("");

  /** ---------------- TOTAL HISTÓRICO ---------------- */
  const refreshTotalScans = async () => {
    const count = await getScansCount();
    setTotalScans(count ?? 0);
  };

  //Clima
  const [weatherCondition, setWeatherCondition] = useState(null);

  /** ---------------- DESCARGA ACTUAL ---------------- */
  const incrementTransportScan = () => {
    if (!transportUnit?.trim()) {
      return;
    }
    setTransportScans((prev) => {
      const next = prev + 1;

      // 🟢 activar barra al primer scan
      if (next === 1) {
        setTransportActive(true);
      }

      if (totalUnits > 0 && next >= totalUnits) {
        setCompleted(true);
        setTransportActive(false); // 🔴 ocultar barra
      }

      return next;
    });
  };

  const decrementTransportScan = () => {
    setTransportScans((prev) => {
      const next = Math.max(prev - 1, 0);

      // si no quedan scans → ocultar barra
      if (next === 0) {
        setTransportActive(false);
        setCompleted(false);
      }

      return next;
    });
  };

  const resetTransport = () => {
    setTransportScans(0);
    setTotalUnits("");
    setTransportUnit("");
    setCompleted(false);
    setTransportActive(false);
  };

  useEffect(() => {
    if (!transportUnit) {
      setTransportUnit("");
      setTransportError("");
    }
  }, [transportUnit]);

  useEffect(() => {
    if (transportUnit?.trim() && !totalUnits?.toString().trim()) {
      setTransportError("Ingresar cantidad unidades");
    } else {
      setTransportError("");
    }
  }, [transportUnit, totalUnits]);

  /** ---------------- INIT ---------------- */
  useEffect(() => {
    refreshTotalScans();
  }, []);

  return (
    <ScansContext.Provider
      value={{
        totalScans,
        refreshTotalScans,

        transportUnit,
        setTransportUnit,
        transportScans,
        totalUnits,
        setTotalUnits,
        completed,

        transportActive,
        incrementTransportScan,
        decrementTransportScan,
        resetTransport,

        weatherCondition,
        setWeatherCondition,

        transportError,
        setTransportError,

        weatherError,
        setWeatherError,
      }}
    >
      {children}
    </ScansContext.Provider>
  );
};

export const useScans = () => useContext(ScansContext);
