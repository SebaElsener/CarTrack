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
    `SELECT * FROM scans WHERE synced = 0`,
  );
  if (!unsyncedScans || unsyncedScans.length === 0) {
    return 0;
  }
  let syncedCount = 0;
  for (const item of unsyncedScans) {
    const { error } = await supabase
      .schema("carpointer")
      .from("scans")
      .insert({
        vin: item.vin,
        origen: item.origen,
        destino: item.destino,
        transport_nbr: item.transport_nbr,
        gps_stamp: item.gps_stamp,
        movimiento: item.movimiento,
      })
      .select()
      .single();

    if (error) {
      console.log("❌ scan sync error", item.id, error);
      continue;
    }
    // await db.runAsync(
    //   `UPDATE scans SET remote_id = ${scan.supabase_id} WHERE id = ?`,
    //   item.id,
    // );
    // await markToSyncHelper("pictures", scan.supabase_id, item.id);
    await db.runAsync(`UPDATE scans SET synced = 1 WHERE id = ?`, item.id);
    syncedCount++;
  }
  return unsyncedScans.length - syncedCount;
};

// Sincronizar fotos bucket supabase
// export const syncPendingImages = async () => {
//   await waitForDb();
//   const db = await getDb();
//   const unsyncedImages = await db.getAllAsync(
//     `SELECT * FROM tableForPendingImages WHERE synced = 0`,
//   );
//   for (const img of unsyncedImages) {
//     // Subir a Supabase Storage
//     const { error } = await supabase.storage
//       .from("pics")
//       .upload(img.name, img.binary, {
//         contentType: "image/jpg",
//         upsert: true,
//       });
//     // URL publica bucket para agregar a tabla fotos
//     const { data: publicUrlData, error: urlError } = supabase.storage
//       .from("pics")
//       .getPublicUrl(img.name);
//     if (urlError) throw urlError;
//     const publicUrl = publicUrlData.publicUrl;
//     // Actualizar tabla fotos con URL
//     await db.runAsync(
//       `UPDATE pictures SET pictureurl = ? WHERE id = ?`,
//       publicUrl,
//       img.id_heredado,
//     );
//     if (error) {
//       console.log("ERROR SUBIENDO FOTO:", img.name, error);
//       continue;
//     } else {
//       await db.runAsync(
//         `UPDATE tableForPendingImages SET synced = 1 WHERE id = ?`,
//         img.id,
//       );
//     }
//   }
// };

// Sincronizar base datos fotos + metadatos supabase
// export const syncPendingPicts = async () => {
//   await waitForDb();
//   const db = await getDb();
//   try {
//     await syncPendingImages();
//   } catch (e) {
//     console.log("Error syncing images", e);
//   }
//   const unsyncedPicts = await db.getAllAsync(
//     `SELECT * FROM pictures WHERE synced = 0`,
//   );
//   if (!unsyncedPicts || unsyncedPicts.length === 0) {
//     return 0; // nada pendiente
//   }
//   let syncedCount = 0;
//   for (const picts of unsyncedPicts) {
//     const { error } = await supabase.from("pictures").insert({
//       vin: picts.vin,
//       scan_id: picts.scan_id,
//       pictureurl: picts.pictureurl,
//       metadata: picts.metadata,
//       user: picts.user,
//     });
//     if (error) {
//       console.log("❌ picture sync error", picts.scan_id, error);
//       continue;
//     }
//     await db.runAsync(`UPDATE pictures SET synced = 1 WHERE id = ?`, picts.id);
//     syncedCount++;
//   }
//   // devolvemos cuántas fotos quedan pendientes
//   return unsyncedPicts.length - syncedCount;
// };
