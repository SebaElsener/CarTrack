import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { getAllScanPositions } from "../database/Database";

export async function exportToExcel() {
  const data = await getAllScanPositions();

  if (!data || data.length === 0) {
    alert("No hay datos para exportar");
    return;
  }

  const formatted = data.map((r) => ({
    VIN: r.vin,
    Sector: r.sector,
    Fila: r.fila,
    Fecha: new Date(r.position_date).toLocaleString("es-AR"),
  }));

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Posiciones");

  const wbout = XLSX.write(wb, {
    type: "base64",
    bookType: "xlsx",
  });

  const fileUri =
    FileSystem.documentDirectory + `posiciones_${Date.now()}.xlsx`;

  await FileSystem.writeAsStringAsync(fileUri, wbout, {
    encoding: "base64",
  });

  await Sharing.shareAsync(fileUri);
}
