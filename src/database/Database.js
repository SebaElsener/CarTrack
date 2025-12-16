
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('scanner.db');

// Eliminar tabla
export const deleteTable = async () => {
    db.execAsync("DROP TABLE IF EXISTS scans")
}

// Crear tabla al iniciar
export const initDB = async () => {

  await db.execAsync(
      ` PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        area,
        averia,
        grav,
        obs,
        codigo,
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
        pictureurl TEXT NOT NULL,
        synced INTEGER DEFAULT 0)
      `
  )

}

// Guardar un escaneo
export const saveScan = async (code, type) => {
    await db.runAsync(
      `INSERT INTO scans (code, type, date, synced) VALUES (?, ?, ?, 0);`,
      code, type, new Date().toISOString()
    );
};

// Guardar fotos + metadata
export const savePict = async (code, pictureurl, metadata) => {
    await db.runAsync(
      `INSERT INTO pictures (code, pictureurl, metadata, synced) VALUES (?, ?, ?, 0);`,
      code, pictureurl, metadata
    );
};

// Obtener todos los escaneos
export const getScans = async () => {
    return await db.getAllAsync(`SELECT * FROM scans ORDER BY id DESC;`);
};

// Buscar un vin en base local
export const getScan = async (vin) => {
    const result = await db.getAllAsync(
      `SELECT * FROM scans WHERE code = ?`,
      [vin])

    if (result.length === 0) return null
    
    return result
};

// Añadir información al vin colectado
export const addInfo = async (vin, area, averia, grav, obs, codigo) => {
    await db.runAsync(
        `UPDATE scans SET area = ?, averia = ?, grav = ?, obs = ?, codigo = ?, pendingDamages = ? WHERE code = ?`,
        area, averia, grav, obs, codigo, 0, vin
    )
    return "Información actualizada"
    //return await danoCloudUpdate(infoToUpdate)
};

// Borrar un registro
export const deleteScan = async (id) => {
    await db.runAsync(
      `DELETE FROM scans WHERE id = ?`,
      [id]);
};

// Borrar todo
export const clearScans = async () => {
  await db.deleteAsync('scanner.db')
};

export default db