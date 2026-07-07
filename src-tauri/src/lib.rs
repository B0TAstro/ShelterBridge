pub mod save;

use save::SaveInspection;

/// Read a `Vault*.sav` from disk and return its hash + parsed info.
/// Read-only: the original file is never modified.
#[tauri::command]
fn read_save(path: String) -> Result<SaveInspection, String> {
    let bytes = std::fs::read(&path).map_err(|e| format!("cannot read file: {e}"))?;
    save::inspect_save(&bytes)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![read_save])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
