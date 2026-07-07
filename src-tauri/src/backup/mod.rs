//! Preparing a save for transfer: copy the source into a timestamped backup
//! folder and produce the correctly-named VaultX.sav. The original is only ever
//! READ — every write here is a copy, never a move or an in-place edit.

use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::save::{inspect_save, sha256_hex};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferReport {
    pub stamp: String,
    pub source_file: String,
    pub target_slot: String,
    pub source_sha256: String,
    pub prepared_sha256: String,
    pub backup_dir: String,
    pub prepared_path: String,
    pub status: String,
}

/// Prepare `source` for the given slot (1-3) inside `backup_dir`.
/// Creates the folder, copies the source as a backup, writes the prepared
/// `VaultX.sav`, verifies it byte-for-byte, and writes `transfer_report.json`.
pub fn prepare_transfer(
    source: &Path,
    slot: u8,
    backup_dir: &Path,
    stamp: String,
) -> Result<TransferReport, String> {
    if !(1..=3).contains(&slot) {
        return Err(format!("slot must be 1, 2 or 3 (got {slot})"));
    }

    // Read + validate the source; this also proves it is a real save, and gives
    // us the source hash.
    let bytes = fs::read(source).map_err(|e| format!("cannot read source: {e}"))?;
    let source_sha256 = inspect_save(&bytes)?.sha256;

    let source_file = source
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "Vault.sav".to_string());

    fs::create_dir_all(backup_dir).map_err(|e| format!("cannot create backup folder: {e}"))?;

    // 1) Keep a copy of the source (a copy, never a move).
    let source_copy = backup_dir.join(format!("source_{source_file}"));
    fs::copy(source, &source_copy).map_err(|e| format!("cannot back up source: {e}"))?;

    // 2) Write the prepared, correctly-named file for the chosen slot.
    let target_slot = format!("Vault{slot}.sav");
    let prepared_path = backup_dir.join(&target_slot);
    fs::copy(source, &prepared_path).map_err(|e| format!("cannot write prepared file: {e}"))?;

    // 3) Verify the prepared copy is byte-identical to the source.
    let prepared_bytes =
        fs::read(&prepared_path).map_err(|e| format!("cannot read prepared file: {e}"))?;
    let prepared_sha256 = sha256_hex(&prepared_bytes);
    if prepared_sha256 != source_sha256 {
        return Err("verification failed: prepared file does not match source".to_string());
    }

    // 4) Write the transfer report.
    let report = TransferReport {
        stamp,
        source_file,
        target_slot,
        source_sha256,
        prepared_sha256,
        backup_dir: backup_dir.to_string_lossy().into_owned(),
        prepared_path: prepared_path.to_string_lossy().into_owned(),
        status: "success".to_string(),
    };
    let json = serde_json::to_string_pretty(&report)
        .map_err(|e| format!("cannot serialize report: {e}"))?;
    fs::write(backup_dir.join("transfer_report.json"), json)
        .map_err(|e| format!("cannot write report: {e}"))?;

    Ok(report)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn prepares_transfer_without_touching_original() {
        let source = Path::new("../dev-saves/Vault1.sav");
        if !source.exists() {
            eprintln!("skipping: {} not found", source.display());
            return;
        }

        // Hash the original before, to prove it is untouched afterwards.
        let before_hash = sha256_hex(&fs::read(source).unwrap());

        let dest = std::env::temp_dir().join("shelterbridge-test-backup");
        let _ = fs::remove_dir_all(&dest);

        let report = prepare_transfer(source, 2, &dest, "test-stamp".to_string())
            .expect("prepare_transfer should succeed");

        assert_eq!(report.target_slot, "Vault2.sav");
        assert_eq!(report.prepared_sha256, before_hash);
        assert!(dest.join("Vault2.sav").exists());
        assert!(dest.join("source_Vault1.sav").exists());
        assert!(dest.join("transfer_report.json").exists());

        // GOLDEN RULE: the original save is byte-for-byte unchanged.
        let after_hash = sha256_hex(&fs::read(source).unwrap());
        assert_eq!(before_hash, after_hash, "original save must be untouched");

        let _ = fs::remove_dir_all(&dest);
    }
}
