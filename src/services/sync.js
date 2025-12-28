import { getDb, isDbReady } from "../database/Database";
import { supabase } from "./supabase";

async function waitForDb() {
  while (!isDbReady()) {
    await new Promise((r) => setTimeout(r, 50));
  }
}

// Sincronizar vin al escanear supabase
export const syncPendingScans = async () => {
  await waitForDb();
  const db = await getDb();
  const unsyncedScans = await db.getAllAsync(
    `SELECT * FROM scans WHERE synced = 0`
  );
  if (!unsyncedScans || unsyncedScans.length === 0) {
    return 0;
  }
  let syncedCount = 0;
  for (const item of unsyncedScans) {
    const { error } = await supabase.from("scans").insert({
      localSQL_id: item.id,
      vin: item.vin,
      type: item.type,
      date: item.date,
    });
    if (!error) {
      await db.runAsync(`UPDATE scans SET synced = 1 WHERE id = ?`, item.id);
      syncedCount++;
    } else {
      break;
    }
  }
  return unsyncedScans.length - syncedCount;
};

// Sincronizar daños supabase
export const danoCloudUpdate = async () => {
  await waitForDb();
  const db = await getDb();
  const unsyncedDamages = await db.getAllAsync(
    `SELECT * FROM damages WHERE synced = 0`
  );
  if (!unsyncedDamages || unsyncedDamages.length === 0) {
    return 0; // nada pendiente
  }
  let syncedCount = 0;
  for (const item of unsyncedDamages) {
    const { error } = await supabase.from("damages").insert({
      id: item.id,
      area: item.area,
      averia: item.averia,
      grav: item.grav,
      obs: item.obs,
      codigo: item.codigo,
      vin: item.vin,
      date: item.date,
    });
    if (!error) {
      await db.runAsync(`UPDATE damages SET synced = 1 WHERE id = ?`, item.id);
      syncedCount++;
    } else {
      break;
    }
  }
  // devolvemos cuántos daños quedaron pendientes
  return unsyncedDamages.length - syncedCount;
};

// Sincronizar fotos bucket supabase
export const syncPendingImages = async () => {
  await waitForDb();
  const db = await getDb();
  const unsyncedImages = await db.getAllAsync(
    `SELECT * FROM tableForPendingImages WHERE synced = 0`
  );
  for (const img of unsyncedImages) {
    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from("pics")
      .upload(img.name, img.binary, {
        contentType: "image/jpg",
        upsert: true,
      });
    // URL publica bucket para agregar a tabla fotos
    const { data: publicUrlData, error: urlError } = supabase.storage
      .from("pics")
      .getPublicUrl(img.name);
    if (urlError) throw urlError;
    const publicUrl = publicUrlData.publicUrl;
    // Actualizar tabla fotos con URL
    await db.runAsync(
      `UPDATE pictures SET pictureurl = ? WHERE id = ?`,
      publicUrl,
      img.id_heredado
    );
    if (error) {
      console.log("ERROR SUBIENDO FOTO:", img.name, error);
      return null;
    } else {
      await db.runAsync(
        `UPDATE tableForPendingImages SET synced = 1 WHERE id = ?`,
        img.id
      );
    }
  }
};

// Sincronizar base datos fotos + metadatos supabase
export const syncPendingPicts = async () => {
  await waitForDb();
  const db = await getDb();
  await syncPendingImages();
  const unsyncedPicts = await db.getAllAsync(
    `SELECT * FROM pictures WHERE synced = 0`
  );
  if (!unsyncedPicts || unsyncedPicts.length === 0) {
    return 0; // nada pendiente
  }
  let syncedCount = 0;
  for (const picts of unsyncedPicts) {
    const { error } = await supabase.from("pictures").insert({
      vin: picts.vin,
      pictureurl: picts.pictureurl,
      metadata: picts.metadata,
    });
    if (!error) {
      await db.runAsync(
        `UPDATE pictures SET synced = 1 WHERE id = ?`,
        picts.id
      );
      syncedCount++;
    } else {
      break;
    }
  }
  // devolvemos cuántas fotos quedan pendientes
  return unsyncedPicts.length - syncedCount;
};
