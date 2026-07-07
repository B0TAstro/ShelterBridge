pub mod backup;
pub mod save;

use save::SaveInspection;
use tauri::Manager;

/// Read a `Vault*.sav` from disk and return its hash + parsed info.
/// Read-only: the original file is never modified.
#[tauri::command]
fn read_save(path: String) -> Result<SaveInspection, String> {
    let bytes = std::fs::read(&path).map_err(|e| format!("cannot read file: {e}"))?;
    save::inspect_save(&bytes)
}

/// Prepare a save for the chosen slot (1-3) inside a timestamped folder under
/// the user's Documents. Only copies — the original is never modified.
#[tauri::command]
fn prepare_transfer(
    app: tauri::AppHandle,
    source_path: String,
    slot: u8,
    stamp: String,
) -> Result<backup::TransferReport, String> {
    let docs = app
        .path()
        .document_dir()
        .map_err(|e| format!("cannot locate Documents folder: {e}"))?;
    let backup_dir = docs.join("ShelterBridge Backups").join(&stamp);
    backup::prepare_transfer(std::path::Path::new(&source_path), slot, &backup_dir, stamp)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![read_save, prepare_transfer])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
