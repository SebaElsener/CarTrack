import * as SQLite from "expo-sqlite";

let db = null;
let initializing = null;

export async function getDb() {
  if (db) return db;
  if (!initializing) {
    initializing = (async () => {
      db = await SQLite.openDatabaseAsync("scanner.db");
      await initDB();
      return db;
    })();
  }
  return initializing;
}

let dbReady = false;

// Crear tablas al iniciar
export const initDB = async () => {
  const db = await getDb();
  await db.execAsync(
    `PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        vin TEXT NOT NULL,
        transport_nbr TEXT NOT NULL,
        origen TEXT NOT NULL,
        destino TEXT NOT NULL,
        gps_stamp JSONB NOT NULL,
        movimiento TEXT NOT NULL,
        synced INTEGER DEFAULT 0)
    `,
  );

  dbReady = true;
};

export function isDbReady() {
  return dbReady;
}

// Eliminar tablas
export const deleteTable = async () => {
  const db = await getDb();
  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS scans;
    `);
  } catch (error) {
    console.log("Error al eliminar tabla, ", error);
  }

  await initDB();
};

// Guardar scan de unidad
export const saveScan = async (
  vin,
  origen,
  destino,
  transport_nbr,
  gps_stamp,
  movimiento,
) => {
  const db = await getDb();

  try {
    // 🔍 Buscar registros existentes del mismo VIN + equipo
    const existing = await db.getAllAsync(
      `
      SELECT movimiento 
      FROM scans 
      WHERE vin = ? 
      AND transport_nbr = ?
      `,
      [vin, transport_nbr],
    );

    const alreadyCarga = existing.some((r) => r.movimiento === "CARGA");

    const alreadyDescarga = existing.some((r) => r.movimiento === "DESCARGA");

    // 🚫 No permitir doble carga
    if (movimiento === "CARGA" && alreadyCarga) {
      return { duplicated: true };
    }

    // 🚫 No permitir doble descarga
    if (movimiento === "DESCARGA" && alreadyDescarga) {
      return { duplicated: true };
    }

    // ✅ Insert válido
    const result = await db.runAsync(
      `
      INSERT INTO scans (vin, origen, destino, transport_nbr, gps_stamp, movimiento)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [vin, origen, destino, transport_nbr, gps_stamp, movimiento],
    );

    return { duplicated: false, id: result.lastInsertRowId };
  } catch (error) {
    console.error("Error al guardar scan: ", error);
    throw error;
  }
};

export const existsCargaForVIN = async (vin) => {
  const db = await getDb();

  const result = await db.getFirstAsync(
    `
    SELECT id 
    FROM scans 
    WHERE vin = ? 
      AND movimiento = 'CARGA'
    LIMIT 1
    `,
    [vin],
  );

  return !!result;
};
