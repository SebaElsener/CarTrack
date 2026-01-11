import * as SQLite from "expo-sqlite";

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
        clima TEXT NOT NULL,
        batea TEXT,
        user TEXT NOT NULL,
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
        user TEXT NOT NULL,
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
        local_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        supabase_id UUID NULL,
        vin TEXT NOT NULL,
        date TEXT NOT NULL,
        area TEXT NOT NULL,
        averia TEXT NOT NULL,
        grav TEXT NOT NULL,
        obs TEXT,
        codigo TEXT NOT NULL,
        deleted INTEGER DEFAULT 0,
        user TEXT NOT NULL,
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
export const saveScan = async (
  vin,
  type,
  weatherCondition,
  transportUnit,
  user
) => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO scans (vin, type, clima, batea, user, date, synced) VALUES (?, ?, ?, ?, ?, ?, 0);`,
    vin,
    type,
    weatherCondition,
    transportUnit,
    user,
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
export const savePict = async (vin, metadata, user) => {
  const db = await getDb();
  const id = await db.runAsync(
    `INSERT INTO pictures (vin, metadata, user, synced) VALUES (?, ?, ?, 0);`,
    vin,
    metadata,
    user
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
  const whereClause = vin ? `WHERE s.vin = ?` : "";

  const params = vin ? [vin, limit, offset] : [limit, offset];

  const rows = await db.getAllAsync(
    `
    SELECT
      s.id AS scan_id,
      s.vin,
      s.date AS scan_date,

      -- 🛠 Daños
      IFNULL(
        (
          SELECT json_group_array(
            json_object(
              'id', d.local_id,
              'area', d.area,
              'averia', d.averia,
              'grav', d.grav,
              'obs', d.obs,
              'date', d.date
            )
          )
          FROM damages d
          WHERE d.vin = s.vin
        ),
        '[]'
      ) AS damages,

      -- 📸 Fotos
      IFNULL(
        (
          SELECT json_group_array(JSON_EXTRACT(p.metadata, '$.carpeta'))
          FROM pictures p
          WHERE p.vin = s.vin
        ),
        '[]'
      ) AS fotos

    FROM scans s
    ${whereClause}
    ORDER BY s.id DESC
    LIMIT ? OFFSET ?;
    `,
    params
  );
  const result = rows.map((row) => {
    let damages = JSON.parse(row.damages);

    damages = damages.filter(
      (d) =>
        d.area !== null ||
        d.averia !== null ||
        d.grav !== null ||
        d.obs !== null
    );

    return {
      ...row,
      damages,
      fotos: JSON.parse(row.fotos),
    };
  });

  return result.length ? result : false;
};

// Añadir información al vin colectado
export const addInfo = async (vin, area, averia, grav, obs, codigo, user) => {
  const db = await getDb();
  try {
    const fecha = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO damages (area, averia, grav, obs, codigo, synced, vin, date, user) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?);`,
      area,
      averia,
      grav,
      obs,
      codigo,
      vin,
      fecha,
      user
    );
    console.log("Registros actualizados: ", result.changes);
    return "Información actualizada";
  } catch (error) {
    console.log("Error al actualizar, ", error);
    return error;
  }
};

// Borrar un registro y sus daños
export const deleteScan = async (vin) => {
  const db = await getDb();
  try {
    await db.runAsync(`DELETE FROM scans WHERE vin = ?`, vin);
    await db.runAsync(`DELETE FROM damages WHERE vin = ?`, vin);
  } catch (error) {
    console.log("Error al eliminar registros", error);
    return error;
  }
  return "Registros eliminados";
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

export const markToDelete = async (damageId) => {
  const db = await getDb();
  try {
    await db.runAsync(
      `UPDATE damages SET deleted = 1 WHERE local_id = ?`,
      damageId
    );
  } catch (error) {
    console.log("Error al marcar daño a eliminar: ", damageId);
    return error;
  }
};

export const deleteDamageById = async () => {
  const db = await getDb();
  try {
    await db.runAsync("DELETE FROM damages WHERE deleted = 1");
  } catch (error) {
    console.log("Error al eliminar registro de daño: ", error);
    return error;
  }
};

//Contar scans guardados para actualizar barra contador scans
export async function getScansCount() {
  const db = await getDb();
  const result = await db.getFirstAsync(`SELECT COUNT(*) as count FROM scans`);
  return result?.count ?? 0;
}
