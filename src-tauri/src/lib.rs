pub mod backup;
pub mod history;
pub mod save;

use std::path::{Path, PathBuf};

use save::SaveInspection;
use tauri::Manager;

/// Read a `Vault*.sav` from disk and return its hash + parsed info.
/// Read-only: the original file is never modified.
#[tauri::command]
fn read_save(path: String) -> Result<SaveInspection, String> {
    let bytes = std::fs::read(&path).map_err(|e| format!("cannot read file: {e}"))?;
    save::inspect_save(&bytes)
}

fn history_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("cannot locate app data dir: {e}"))?;
    Ok(dir.join("history.json"))
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
    let report = backup::prepare_transfer(Path::new(&source_path), slot, &backup_dir, stamp)?;

    // Record in local history (best-effort: the transfer itself already succeeded).
    if let Ok(path) = history_path(&app) {
        let _ = history::append(&path, &report);
    }

    Ok(report)
}

/// List all previously recorded transfers, newest handling left to the frontend.
#[tauri::command]
fn list_history(app: tauri::AppHandle) -> Result<Vec<backup::TransferReport>, String> {
    history::read(&history_path(&app)?)
}

/// Scan for local Fallout Shelter saves. With no `dir`, uses the default Steam
/// location (`%LOCALAPPDATA%\FalloutShelter` on Windows). Returns [] if none.
#[tauri::command]
fn scan_saves(app: tauri::AppHandle, dir: Option<String>) -> Result<Vec<save::FoundSave>, String> {
    let scan_dir = match dir {
        Some(d) => PathBuf::from(d),
        None => app
            .path()
            .local_data_dir()
            .map_err(|e| format!("cannot locate local data dir: {e}"))?
            .join("FalloutShelter"),
    };
    Ok(save::scan_dir(&scan_dir))
}

/// Open a folder in the OS file manager (Finder / Explorer / files).
/// Runs via the opener plugin from Rust, so it needs no JS-side permission.
#[tauri::command]
fn open_folder(app: tauri::AppHandle, path: String) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;
    app.opener()
        .open_path(path, None::<&str>)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_save,
            prepare_transfer,
            list_history,
            scan_saves,
            open_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
