
import * as SQLite from 'expo-sqlite';

//const db = SQLite.openDatabaseSync('scanner.db');
let db = null;
let initializing = null;

export async function getDb() {
  if (db) return db;
  if (!initializing) {
    initializing = (async () => {
      db = await SQLite.openDatabaseAsync("scanner.db");
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
      ` PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        area TEXT,
        averia TEXT,
        grav TEXT,
        obs TEXT,
        codigo TEXT,
        synced INTEGER DEFAULT 0,
        pendingDamages INTEGER DEFAULT 0)
      `
  )

  await db.execAsync(
        `PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS pictures (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        code TEXT NOT NULL,
        metadata TEXT NOT NULL,
        pictureurl TEXT,
        synced INTEGER DEFAULT 0)
      `
  )

    await db.execAsync(
        `PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS tableForPendingImages (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        id_heredado INTEGER NOT NULL,
        name TEXT NOT NULL,
        binary BLOB NOT NULL,
        synced INTEGER DEFAULT 0)
      `
  )
  dbReady = true;
}

export function isDbReady() {
  return dbReady;
}

// Eliminar tablas
export const deleteTable = async () => {
  const db = await getDb();
  try {
    await db.execAsync(`
      DROP TABLE IF EXISTS pictures;
      DROP TABLE IF EXISTS tableForPendingImages;
      DROP TABLE IF EXISTS scans
    `);
  } catch (error) {
      console.log("Error al eliminar tablas, ", error)
  }

}

// Guardar un escaneo
export const saveScan = async (code, type) => {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO scans (code, type, date, synced) VALUES (?, ?, ?, 0);`,
      code, type, new Date().toISOString()
    );
};

// Guardar name y binary foto para subir a supabase bucket
export const savePendingImage = async (pictId, nombre, binary) => { /// pictId es heredado de savePict
    const db = await getDb()
    await db.runAsync(
      `INSERT INTO tableForPendingImages (id_heredado, name, binary, synced) VALUES (?, ?, ?, 0);`,
      pictId, nombre, binary
    )
};

// Guardar fotos + metadata para subir a supabase
export const savePict = async (code, metadata) => {
  const db = await getDb()
  const id = await db.runAsync(
      `INSERT INTO pictures (code, metadata, synced) VALUES (?, ?, 0);`,
      code, metadata
    )
    return id.lastInsertRowId
};

// Obtener todos los escaneos
export const getScans = async () => {
    const db = await getDb();
    return await db.getAllAsync(`SELECT * FROM scans ORDER BY id DESC;`);
};

// Buscar un vin en base local
export const getScan = async (vin) => {
  const db = await getDb();
    const result = await db.getAllAsync(
      `SELECT * FROM scans WHERE code = ?`,
      [vin])

    if (result.length === 0) return null
    
    return result
};

// Añadir información al vin colectado
export const addInfo = async (vin, area, averia, grav, obs, codigo) => {
  const db = await getDb();
  try {
    const result = await db.runAsync(
        `UPDATE scans SET area = ?, averia = ?, grav = ?, obs = ?, codigo = ?, pendingDamages = ? WHERE code = ?`,
        area, averia, grav, obs, codigo, 0, vin)
    console.log("Registros actualizados: ", result.changes)
    return "Información actualizada"
  } catch (error) {
    console.log("Error al actualizar, ", error)
    return error
  }
}

// Borrar un registro
export const deleteScan = async (id) => {
  const db = await getDb();
    await db.runAsync(
      `DELETE FROM scans WHERE id = ?`,
      [id]);
};

// Borrar todo
export const clearDb = async () => {
  const db = await getDb();
  if (db) {
    await db.closeAsync();
    db = null;
  }
  await SQLite.deleteDatabaseAsync("scanner.db");
};

// export default db