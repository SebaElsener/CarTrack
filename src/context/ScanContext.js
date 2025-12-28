import { createContext, useContext, useState } from "react";

const ScansContext = createContext();

export const ScansProvider = ({ children }) => {
  const [scansCount, setScansCount] = useState(0); // contador de VINs

  const increment = () => setScansCount((prev) => prev + 1);
  const decrement = () => setScansCount((prev) => (prev > 0 ? prev - 1 : 0));

  return (
    <ScansContext.Provider value={{ scansCount, increment, decrement }}>
      {children}
    </ScansContext.Provider>
  );
};

export const useScans = () => useContext(ScansContext);
