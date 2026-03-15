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
        vin TEXT UNIQUE,
        transport_nbr TEXT NOT NULL,
        lugar INTEGER NOT NULL,
        gps_stamp JSONB NOT NULL,
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

// Guardar scan de unidad descargada
export const saveScan = async (vin, lugar, transport_nbr, gps_stamp) => {
  const db = await getDb();

  try {
    const result = await db.runAsync(
      `
    INSERT INTO scans (vin, lugar, transport_nbr, gps_stamp)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(vin) DO UPDATE SET
      vin = excluded.vin,
      lugar = excluded.lugar,
      transport_nbr = excluded.transport_nbr,
      gps_stamp = excluded.gps_stamp
    `,
      [vin, lugar, transport_nbr, gps_stamp],
    );

    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error al guardar scan: ", error);
    throw error;
  }
};
