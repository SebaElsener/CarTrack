
import db from "../database/Database";
import { supabase } from "./supabase";


// Sincronizar vin al escanear supabase
export const syncPendingScans = async () => {
  const unsyncedScans = await db.getAllAsync(`SELECT * FROM scans WHERE synced = 0`);
  
        for (const item of unsyncedScans) {
          const { error } = await supabase.from("scans").insert({
            localSQL_id: item.id,
            code: item.code,
            type: item.type,
            date: item.date
          })

          if (!error) {
            await db.runAsync(`UPDATE scans SET synced = 1 WHERE id = ?`, item.id) 
          } 
        }
}

// Sincronizar daños supabase
export const danoCloudUpdate = async () => {
  const unsyncedDamages = await db.getAllAsync(`SELECT * FROM scans WHERE pendingDamages = 0`)
  //const [vin, area, averia, grav, obs, codigo] = infoToUpdate || []
  for (const item of unsyncedDamages) {
    const { error } = await supabase.from("scans")
      .update({ area: item.area, averia: item.averia, grav: item.grav, obs: item.obs, codigo: item.codigo })
      .eq('code', item.code)

  if (!error) {
    await db.runAsync(`UPDATE scans SET pendingDamages = 1 WHERE id = ?`, item.id)
    return "Información actualizada"
  } else return "Error, la información no pudo ser actualizada"
  }
}

// Sincronizar fotos bucket supabase
export const syncPendingImages = async ()=> {
  const unsyncedImages = await db.getAllAsync(`SELECT * FROM tableForPendingImages WHERE synced = 0`)
  for (const img of unsyncedImages) {
      // Subir a Supabase Storage
    const { data, error } = await supabase.storage
    .from("pics")                 // ← tu bucket
    .upload(img.name, img.binary, {
      contentType: 'image/jpg',
      upsert: true
    })
    if (error) {
      console.log("ERROR SUBIENDO FOTO:", img.name, error);
      return null;
    } else {
      await db.runAsync(`UPDATE tableForPendingImages SET synced = 1 WHERE name = ?`, img.name)
      // URL publica bucket para agregar a tabla fotos
      const { data: publicUrlData, error: urlError } = await supabase.storage
      .from("pics")
      .getPublicUrl(img.name)
      if (urlError) throw urlError
      const publicUrl = publicUrlData.publicUrl
      // Actualizar tabla fotos con URL
      await db.runAsync(
        `UPDATE pictures SET pictureurl = ? WHERE code = ?`,
        publicUrl, img.vin)
      }
  }
}

// Sincronizar base datos fotos + metadatos supabase
export const syncPendingPicts = async ()=> {
  await syncPendingImages()
  const unsyncedPicts = await db.getAllAsync(`SELECT * FROM pictures WHERE synced = 0`)
  for (const picts of unsyncedPicts) {
    const { error } = await supabase.from("pictures")
      .insert({
        vin: picts.code,
        pictureurl: picts.pictureurl,
        metadata: picts.metadata
      })
          if (!error) {
            await db.runAsync(`UPDATE pictures SET synced = 1 WHERE id = ?`, picts.id)
          } 
  }
}