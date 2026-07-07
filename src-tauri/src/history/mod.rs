//! Local transfer history, stored as a JSON array in the app data folder.

use std::fs;
use std::path::Path;

use crate::backup::TransferReport;

/// Read all recorded transfers. Returns an empty list if the file doesn't exist.
pub fn read(path: &Path) -> Result<Vec<TransferReport>, String> {
    if !path.exists() {
        return Ok(Vec::new());
    }
    let data = fs::read_to_string(path).map_err(|e| format!("cannot read history: {e}"))?;
    serde_json::from_str(&data).map_err(|e| format!("cannot parse history: {e}"))
}

/// Append a transfer to the history file (creating it and its folder if needed).
pub fn append(path: &Path, report: &TransferReport) -> Result<(), String> {
    let mut entries = read(path)?;
    entries.push(report.clone());

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("cannot create app data dir: {e}"))?;
    }
    let json = serde_json::to_string_pretty(&entries)
        .map_err(|e| format!("cannot serialize history: {e}"))?;
    fs::write(path, json).map_err(|e| format!("cannot write history: {e}"))
}
