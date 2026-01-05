import { createContext, useContext, useEffect, useState } from "react";
import { getScansCount } from "../database/Database";

const ScansContext = createContext();

export const ScansProvider = ({ children }) => {
  const [scansCount, setScansCount] = useState(0);

  const refreshScansCount = async () => {
    const count = await getScansCount();
    setScansCount(count ?? 0);
  };

  // 🔁 cargar al iniciar la app
  useEffect(() => {
    refreshScansCount();
  }, []);

  return (
    <ScansContext.Provider
      value={{
        scansCount,
        refreshScansCount,
      }}
    >
      {children}
    </ScansContext.Provider>
  );
};

export const useScans = () => useContext(ScansContext);
