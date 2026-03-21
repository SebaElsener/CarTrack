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
        remote_id INTEGER,
        vin TEXT NOT NULL,
        transport_nbr TEXT NOT NULL,
        origen TEXT NOT NULL,
        destino TEXT NOT NULL,
        gps_stamp JSONB NOT NULL,
        movimiento TEXT NOT NULL,
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
      DROP TABLE IF EXISTS pictures;
      DROP TABLE IF EXISTS tableForPendingImages;
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

export const getScansByVins = async (vins) => {
  const db = await getDb();

  if (!vins.length) return [];

  const placeholders = vins.map(() => "?").join(",");

  return await db.getAllAsync(
    `SELECT vin, movimiento FROM scans WHERE vin IN (${placeholders})`,
    vins,
  );
};

export const savePict = async (vin, local_ScanId, metadata, user) => {
  console.log(vin, local_ScanId, metadata, user);
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

export const hasPendingData = async () => {
  const db = await getDb();

  try {
    const scans = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM scans WHERE synced = 0`,
    );

    const pictures = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM pictures WHERE synced = 0`,
    );

    const pendingImages = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM tableForPendingImages WHERE synced = 0`,
    );

    return scans?.count > 0 || pictures?.count > 0 || pendingImages?.count > 0;
  } catch (e) {
    console.log("Error checking pending data", e);
    return true;
  }
};

export async function markToSyncHelper(table, remoteScanId, localScanId) {
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
