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
    ` PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        remote_id INTEGER,
        vin TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        clima TEXT NOT NULL,
        batea TEXT,
        movimiento TEXT NOT NULL,
        lugar TEXT NOT NULL DEFAULT 'Desconocido',
        user TEXT NOT NULL,
        synced INTEGER DEFAULT 0)
      `,
  );

  await db.execAsync(
    `PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS pictures (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        scan_id INTEGER NOT NULL,
        vin TEXT NOT NULL,
        metadata TEXT NOT NULL,
        pictureurl TEXT,
        user TEXT NOT NULL,
        synced INTEGER DEFAULT 0)
      `,
  );

  await db.execAsync(
    `PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS tableForPendingImages (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        id_heredado INTEGER NOT NULL,
        name TEXT NOT NULL,
        binary BLOB NOT NULL,
        synced INTEGER DEFAULT 0)
      `,
  );

  await db.execAsync(
    `PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS damages (
        local_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        scan_id INTEGER NOT NULL,
        supabase_id UUID NULL,
        vin TEXT NOT NULL,
        date TEXT NOT NULL,
        area TEXT NOT NULL,
        averia TEXT NOT NULL,
        grav TEXT NOT NULL,
        obs TEXT,
        deleted INTEGER DEFAULT 0,
        user TEXT NOT NULL,
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
      DROP TABLE IF EXISTS pictures;
      DROP TABLE IF EXISTS tableForPendingImages;
      DROP TABLE IF EXISTS scans;
      DROP TABLE IF EXISTS damages;
    `);
  } catch (error) {
    console.log("Error al eliminar tablas, ", error);
  }

  await initDB();
};

// Guardar un escaneo
export const saveScan = async (
  vin,
  type,
  weatherCondition,
  movimiento,
  lugar,
  transportUnit,
  user,
) => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO scans (vin, type, clima, movimiento, lugar, batea, user, date, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    vin,
    type,
    weatherCondition,
    movimiento,
    lugar,
    transportUnit,
    user,
    new Date().toISOString(),
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
    binary,
  );
};

// Guardar fotos + metadata para subir a supabase
export const savePict = async (vin, remoteId, metadata, user) => {
  const db = await getDb();
  const id = await db.runAsync(
    `INSERT INTO pictures (vin, scan_id, metadata, user, synced) VALUES (?, ?, ?, ?, 0);`,
    vin,
    remoteId,
    metadata,
    user,
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
export const getScans = async ({
  vin = null,
  movimiento = null,
  limit = 50,
  offset = 0,
} = {}) => {
  const db = await getDb();

  const whereConditions = [];
  const params = [];

  if (vin) {
    whereConditions.push("s.vin = ?");
    params.push(vin);
  }

  if (movimiento) {
    whereConditions.push("s.movimiento = ?");
    params.push(movimiento);
  }

  const whereClause = whereConditions.length
    ? `WHERE ${whereConditions.join(" AND ")}`
    : "";

  params.push(limit, offset);

  const rows = await db.getAllAsync(
    `
    SELECT
      s.id AS scan_id_local,
      s.remote_id,
      s.vin,
      s.date AS scan_date,

      -- 🛠 Daños (por remote_id)
      IFNULL(
        (
          SELECT json_group_array(
            json_object(
              'id', d.local_id,
              'scan_id', d.scan_id,
              'area', d.area,
              'averia', d.averia,
              'grav', d.grav,
              'obs', d.obs,
              'date', d.date
            )
          )
          FROM damages d
          WHERE d.scan_id = s.remote_id
        ),
        '[]'
      ) AS damages,

      -- 📸 Fotos (por remote_id)
      IFNULL(
        (
          SELECT json_group_array(JSON_EXTRACT(p.metadata, '$.carpeta'))
          FROM pictures p
          WHERE p.scan_id = s.remote_id
        ),
        '[]'
      ) AS fotos

    FROM scans s
    ${whereClause}
    ORDER BY s.id DESC
    LIMIT ? OFFSET ?;
    `,
    params,
  );

  return rows.map((row) => {
    let damages = JSON.parse(row.damages);

    damages = damages.filter(
      (d) =>
        d.area !== null ||
        d.averia !== null ||
        d.grav !== null ||
        d.obs !== null,
    );

    return {
      scan_id_local: row.scan_id_local,
      remote_id: row.remote_id,
      vin: row.vin,
      scan_date: row.scan_date,
      damages,
      fotos: JSON.parse(row.fotos),
    };
  });
};

// Verificar si el vin / movimiento existen
export const scanExists = async (vin, movimiento) => {
  console.log(vin, movimiento);
  if (!vin || !movimiento) return false;

  const db = await getDb();

  const rows = await db.getAllAsync(
    `
    SELECT 1
    FROM scans
    WHERE vin = ?
      AND movimiento = ?
    LIMIT 1;
    `,
    [vin, movimiento],
  );

  return rows.length > 0;
};

// Añadir información al vin colectado
export const addInfo = async (vin, scanid, area, averia, grav, obs, user) => {
  const db = await getDb();
  try {
    const fecha = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO damages (vin, scan_id, area, averia, grav, obs, user, date, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);`,
      vin,
      scanid,
      area,
      averia,
      grav,
      obs,
      user,
      fecha,
    );
    console.log("Registros actualizados: ", result.changes);
    return "Información actualizada";
  } catch (error) {
    console.log("Error al actualizar, ", error);
    return error;
  }
};

// Borrar un registro y sus daños
export const deleteScan = async (scan_id) => {
  const db = await getDb();
  try {
    await db.runAsync(`DELETE FROM scans WHERE id = ?`, scan_id);
    await db.runAsync(`DELETE FROM damages WHERE scan_id = ?`, scan_id);
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
      damageId,
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
  try {
    const result = await db.getFirstAsync(
      "SELECT COUNT(*) as count FROM scans",
    );
    return result?.count ?? 0;
  } catch {
    return 0;
  }
}
