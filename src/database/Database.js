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
        CREATE TABLE IF NOT EXISTS scansPosition (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        vin TEXT UNIQUE,
        sector TEXT NOT NULL,
        fila INTEGER NOT NULL,
        position_date TEXT NOT NULL)
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
      DROP TABLE IF EXISTS scansPosition;
    `);
  } catch (error) {
    console.log("Error al eliminar tabla, ", error);
  }

  await initDB();
};

// Guardar scan posicionamiento en playa
export const saveScanPosition = async (vin, sector, fila) => {
  const db = await getDb();
  const fecha = new Date().toISOString();

  try {
    const result = await db.runAsync(
      `
    INSERT INTO scansPosition (vin, sector, fila, position_date)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(vin) DO UPDATE SET
      sector = excluded.sector,
      fila = excluded.fila,
      position_date = excluded.position_date
    `,
      [vin, sector, fila, fecha],
    );

    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error al guardar scan para posicionamiento: ", error);
    throw error;
  }
};

export async function findScanByLast6(vin6) {
  const db = await getDb();

  const result = await db.getFirstAsync(
    `SELECT vin, sector, fila, position_date
     FROM scansPosition
     WHERE substr(vin, -6) = ?
     ORDER BY position_date DESC
     LIMIT 1`,
    [vin6],
  );
  return result;
}

export async function getAllScanPositions() {
  const db = await getDb();

  const result = await db.getAllAsync(`
    SELECT vin, sector, fila, position_date
    FROM scansPosition
    ORDER BY position_date DESC
  `);

  return result;
}
