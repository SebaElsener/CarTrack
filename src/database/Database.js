import * as SQLite from "expo-sqlite";

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
        vin TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        synced INTEGER DEFAULT 0)
      `
  );

  await db.execAsync(
    `PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS pictures (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        vin TEXT NOT NULL,
        metadata TEXT NOT NULL,
        pictureurl TEXT,
        synced INTEGER DEFAULT 0)
      `
  );

  await db.execAsync(
    `PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS tableForPendingImages (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        id_heredado INTEGER NOT NULL,
        name TEXT NOT NULL,
        binary BLOB NOT NULL,
        synced INTEGER DEFAULT 0)
      `
  );

  await db.execAsync(
    `PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS damages (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        vin TEXT NOT NULL,
        area TEXT NOT NULL,
        averia TEXT NOT NULL,
        grav TEXT NOT NULL,
        obs TEXT,
        codigo TEXT NOT NULL,
        synced INTEGER DEFAULT 0)
      `
  );

  // await db.execAsync(
  //   `
  //   CREATE INDEX IF NOT EXISTS idx_damages_vin
  //   ON damages(vin);

  //   CREATE INDEX IF NOT EXISTS idx_damaged_vin
  //   ON damages(vin);
  //   `
  // );

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
      DROP TABLE IF EXISTS pictures;
      DROP TABLE IF EXISTS tableForPendingImages;
      DROP TABLE IF EXISTS scans;
      DROP TABLE IF EXISTS damages;
    `);
  } catch (error) {
    console.log("Error al eliminar tablas, ", error);
  }
};

// Guardar un escaneo
export const saveScan = async (vin, type) => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO scans (vin, type, date, synced) VALUES (?, ?, ?, 0);`,
    vin,
    type,
    new Date().toISOString()
  );
};

// Guardar name y binary foto para subir a supabase bucket
export const savePendingImage = async (pictId, nombre, binary) => {
  /// pictId es heredado de savePict
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO tableForPendingImages (id_heredado, name, binary, synced) VALUES (?, ?, ?, 0);`,
    pictId,
    nombre,
    binary
  );
};

// Guardar fotos + metadata para subir a supabase
export const savePict = async (vin, metadata) => {
  const db = await getDb();
  const id = await db.runAsync(
    `INSERT INTO pictures (vin, metadata, synced) VALUES (?, ?, 0);`,
    vin,
    metadata
  );
  return id.lastInsertRowId;
};

// Obtener todos los escaneos, opcional filtros para querys
/**
 * Obtener scans con sus daños y fotos
 * @param {Object} options
 * @param {string} [options.vin] - Filtrar por VIN específico
 * @param {number} [options.limit] - Cantidad de resultados
 * @param {number} [options.offset] - Offset para paginación
 */
export const getScans = async ({ vin = null, limit = 50, offset = 0 } = {}) => {
  const db = await getDb();

  // Condición WHERE opcional
  const whereClause = vin ? `WHERE s.vin = ?` : "";

  // Traemos scans con daños concatenados y fotos por VIN
  const rows = await db.getAllAsync(
    `
    SELECT
      s.id AS scan_id,
      s.vin,
      s.date AS scan_date,
      GROUP_CONCAT(
        d.id || '||' || d.area || '||' || d.averia || '||' || d.grav || '||' || d.obs || '||' || d.codigo,
        ';;'
      ) AS damages_concat,
      IFNULL((
        SELECT GROUP_CONCAT(p.pictureurl, ',')
        FROM pictures p
        WHERE p.vin = s.vin
      ), '') AS photos_concat
    FROM scans s
    LEFT JOIN damages d ON s.vin = d.vin
    ${whereClause}
    GROUP BY s.id
    ORDER BY s.id DESC
    LIMIT ? OFFSET ?;
  `,
    vin ? [vin, limit, offset] : [limit, offset]
  );
  // Parseamos daños y fotos
  return rows.map((row) => {
    const damages = row.damages_concat
      ? row.damages_concat.split(";;").map((d) => {
          const [id, area, averia, grav, obs, codigo] = d.split("||");
          return { id: Number(id), area, averia, grav, obs, codigo };
        })
      : [];

    const fotos = row.photos_concat ? row.photos_concat.split(",") : [];
    return {
      id: row.scan_id,
      vin: row.vin,
      date: row.scan_date,
      damages,
      fotos,
    };
  });
};

// Buscar un vin en base local
export const getScan = async (vin) => {
  const db = await getDb();
  const result = await db.getAllAsync(`SELECT * FROM scans WHERE vin = ?`, [
    vin,
  ]);

  if (result.length === 0) return null;

  return result;
};

// Añadir información al vin colectado
export const addInfo = async (vin, area, averia, grav, obs, codigo) => {
  const db = await getDb();
  try {
    const result = await db.runAsync(
      `INSERT INTO damages (area, averia, grav, obs, codigo, synced, vin) VALUES (?, ?, ?, ?, ?, 0, ?);`,
      area,
      averia,
      grav,
      obs,
      codigo,
      vin
    );
    console.log("Registros actualizados: ", result.changes);
    return "Información actualizada";
  } catch (error) {
    console.log("Error al actualizar, ", error);
    return error;
  }
};

// Borrar un registro
export const deleteScan = async (id) => {
  const db = await getDb();
  await db.runAsync(`DELETE FROM scans WHERE id = ?`, id);
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
