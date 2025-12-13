
import { supabase } from "./supabase";
import db from "../database/Database";


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

export const danoCloudUpdate = async (infoToUpdate) => {
  const [vin, area, averia, grav, obs, codigo] = infoToUpdate
  const { error } = await supabase.from("scans")
    .update({ area: area, averia: averia, grav: grav, obs: obs, codigo: codigo })
    .eq('code', vin)
    
    if (!error) return "Información actualizada"
    
    return error
}

// Sincronizar fotos + metadatos supabase

export const syncPendingPicts = async ()=> {

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