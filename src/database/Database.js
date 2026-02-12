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
        destino TEXT DEFAULT NULL,
        synced INTEGER DEFAULT 0)
      `,
  );

  await db.execAsync(
    `PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS pictures (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        local_scan_id INTEGER,
        scan_id INTEGER,
        vin TEXT NOT NULL,
        metadata TEXT NOT NULL,
        pictureurl TEXT,
        user TEXT NOT NULL,
        synced INTEGER DEFAULT NULL)
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
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        local_scan_id INTEGER,
        scan_id INTEGER,
        supabase_id UUID NULL,
        vin TEXT NOT NULL,
        date TEXT NOT NULL,
        area TEXT NOT NULL,
        averia TEXT NOT NULL,
        grav TEXT NOT NULL,
        obs TEXT,
        deleted INTEGER DEFAULT 0,
        user TEXT NOT NULL,
        synced INTEGER DEFAULT NULL)
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
  destino,
) => {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO scans (vin, type, clima, movimiento, lugar, batea, user, destino, date, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
    vin,
    type,
    weatherCondition,
    movimiento,
    lugar,
    transportUnit,
    user,
    destino,
    new Date().toISOString(),
  );

  return result.lastInsertRowId;
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
export const savePict = async (vin, local_ScanId, metadata, user) => {
  const db = await getDb();
  // buscar el scan
  const scan = await db.getFirstAsync(
    `SELECT remote_id, synced FROM scans WHERE id = ?`,
    local_ScanId,
  );

  const hasRemoteScan = scan?.synced === 1 && scan?.remote_id != null;

  try {
    const id = await db.runAsync(
      `INSERT INTO pictures (vin, local_scan_id, scan_id, metadata, user, synced) VALUES (?, ?, ?, ?, ?, ?);`,
      vin,
      local_ScanId,
      hasRemoteScan ? scan.remote_id : null,
      metadata,
      user,
      hasRemoteScan ? 0 : null,
    );
    return id.lastInsertRowId;
  } catch (error) {
    console.log("Error al esribir en tabla pictures", error);
  }
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
      s.batea,
      s.movimiento,

      -- 🛠 Daños (por remote_id)
      IFNULL(
        (
          SELECT json_group_array(
            json_object(
              'id', d.id,
              'scan_id', d.scan_id,
              'localScanId', d.local_scan_id,
              'area', d.area,
              'averia', d.averia,
              'grav', d.grav,
              'obs', d.obs,
              'date', d.date
            )
          )
          FROM damages d
          WHERE d.local_scan_id = s.id
        ),
        '[]'
      ) AS damages,

      -- 📸 Fotos (por id local offline first)
      IFNULL(
        (
          SELECT json_group_array(JSON_EXTRACT(p.metadata, '$.carpeta'))
          FROM pictures p
          WHERE p.local_scan_id = s.id
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
      batea: row.batea,
      movimiento: row.movimiento,
      damages,
      fotos: JSON.parse(row.fotos),
    };
  });
};

// Verificar si el vin / movimiento existen
export const scanExists = async (vin, movimiento) => {
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

// Añadir daños al vin colectado
export const addInfo = async (
  vin,
  local_scanId,
  area,
  averia,
  grav,
  obs,
  user,
) => {
  const db = await getDb();

  // buscar el scan
  const scan = await db.getFirstAsync(
    `SELECT remote_id, synced FROM scans WHERE id = ?`,
    local_scanId,
  );
  const hasRemoteScan = scan?.synced === 1 && scan?.remote_id != null;

  try {
    const fecha = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO damages (vin, local_scan_id, scan_id, area, averia, grav, obs, user, date, synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      vin,
      local_scanId,
      hasRemoteScan ? scan.remote_id : null,
      area,
      averia,
      grav,
      obs,
      user,
      fecha,
      hasRemoteScan ? 0 : null,
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
    await db.runAsync(`UPDATE damages SET deleted = 1 WHERE id = ?`, damageId);
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

export async function markToSyncHelper(table, remoteScanId, localScanId) {
  console.log("PARAMS markToSyncHelper: ", table, remoteScanId, localScanId);
  const db = await getDb();

  try {
    const result = await db.runAsync(
      `
      UPDATE ${table}
      SET scan_id = ?, synced = 0
      WHERE local_scan_id = ? AND (synced IS NULL OR synced != 0)
      `,
      parseInt(remoteScanId),
      parseInt(localScanId),
    );
    console.log("Registros listos para sync: ", result.changes);
  } catch (error) {
    console.log("Error al marcar registros para sync, ", error);
  }
}

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
