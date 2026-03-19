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

// Guardar scan de unidad descargada
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
    // 🔍 Verificar duplicado
    const existing = await db.getFirstAsync(
      `SELECT id FROM scans WHERE vin = ?`,
      [vin],
    );

    if (existing) {
      return { duplicated: true };
    }

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
