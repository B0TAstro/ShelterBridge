//! Read, decrypt and parse Fallout Shelter `Vault*.sav` files (read-only).
//! Format: Base64( AES-256-CBC( JSON ) ), key = PBKDF2-HMAC-SHA1 of fixed params.

use aes::cipher::{block_padding::Pkcs7, BlockDecryptMut, KeyIvInit};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use pbkdf2::pbkdf2_hmac;
use serde::de::IgnoredAny;
use serde::{Deserialize, Serialize};
use sha1::Sha1;
use sha2::{Digest, Sha256};

// Fixed parameters, identical for every Fallout Shelter save.
const IV: [u8; 16] = *b"tu89geji340t89u2";
const PBKDF2_PASSWORD: &[u8] = b"UGxheWVy";
const PBKDF2_ROUNDS: u32 = 1000;

type Aes256CbcDec = cbc::Decryptor<aes::Aes256>;

/// SHA-256 (of the source file) plus the parsed Vault info.
#[derive(Debug, Clone, Serialize)]
pub struct SaveInspection {
    pub sha256: String,
    pub vault: VaultInfo,
}

/// The reliable fields we display for a Vault. Resource amounts are rounded.
#[derive(Debug, Clone, Serialize)]
pub struct VaultInfo {
    pub vault_name: String,
    pub app_version: Option<String>,
    pub dweller_count: usize,
    pub caps: u64,
    pub food: u64,
    pub water: u64,
    pub power: u64,
    pub stimpaks: u32,
    pub radaway: u32,
    pub nuka_quantum: u32,
    pub mr_handy: u32,
    pub lunchboxes: u32,
}

/// Hash, decrypt and parse a save. Succeeding here means it is a valid save.
pub fn inspect_save(raw: &[u8]) -> Result<SaveInspection, String> {
    let sha256 = sha256_hex(raw);
    let json = decrypt_save(raw)?;
    let vault = parse_vault(&json)?;
    Ok(SaveInspection { sha256, vault })
}

/// A valid save file found on disk during a scan.
#[derive(Debug, Serialize)]
pub struct FoundSave {
    pub path: String,
    pub file: String,
    pub inspection: SaveInspection,
}

/// Scan a directory for valid Fallout Shelter saves (`*.sav` / `*.sav.bkp`).
/// Files that don't decrypt/parse are skipped; a missing directory yields [].
pub fn scan_dir(dir: &std::path::Path) -> Vec<FoundSave> {
    let mut found = Vec::new();
    let Ok(entries) = std::fs::read_dir(dir) else {
        return found;
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let lower = entry.file_name().to_string_lossy().to_lowercase();
        if !(lower.ends_with(".sav") || lower.ends_with(".sav.bkp")) {
            continue;
        }
        if let Ok(bytes) = std::fs::read(&path) {
            if let Ok(inspection) = inspect_save(&bytes) {
                found.push(FoundSave {
                    path: path.to_string_lossy().into_owned(),
                    file: entry.file_name().to_string_lossy().into_owned(),
                    inspection,
                });
            }
        }
    }

    found.sort_by(|a, b| a.file.cmp(&b.file));
    found
}

/// Decrypt raw `.sav` bytes into their JSON text.
pub fn decrypt_save(raw: &[u8]) -> Result<String, String> {
    let ciphertext = STANDARD
        .decode(raw.trim_ascii_end())
        .map_err(|e| format!("not valid base64: {e}"))?;

    // Password, salt and rounds are fixed, so the derived key is always the same.
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha1>(PBKDF2_PASSWORD, &IV, PBKDF2_ROUNDS, &mut key);

    let plaintext = Aes256CbcDec::new(&key.into(), &IV.into())
        .decrypt_padded_vec_mut::<Pkcs7>(&ciphertext)
        .map_err(|e| format!("decryption failed: {e}"))?;

    String::from_utf8(plaintext).map_err(|e| format!("decrypted data is not UTF-8: {e}"))
}

/// Parse the decrypted JSON into the reliable fields we display.
pub fn parse_vault(json: &str) -> Result<VaultInfo, String> {
    let raw: RawSave = serde_json::from_str(json).map_err(|e| format!("invalid save JSON: {e}"))?;
    let RawSave {
        vault,
        dwellers,
        app_version,
    } = raw;
    let RawVault {
        vault_name,
        lunchboxes,
        storage,
    } = vault;
    let res = storage.resources;

    Ok(VaultInfo {
        vault_name,
        app_version: app_version.map(|v| v.trim().to_string()),
        dweller_count: dwellers.dwellers.len(),
        caps: res.caps.round() as u64,
        food: res.food.round() as u64,
        water: res.water.round() as u64,
        power: res.power.round() as u64,
        stimpaks: res.stimpaks.round() as u32,
        radaway: res.radaway.round() as u32,
        nuka_quantum: res.quantum.round() as u32,
        mr_handy: res.mr_handy.round() as u32,
        lunchboxes,
    })
}

pub fn sha256_hex(raw: &[u8]) -> String {
    Sha256::digest(raw)
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

// Raw JSON shapes. Only the declared fields are read; serde ignores the rest.

#[derive(Deserialize)]
struct RawSave {
    vault: RawVault,
    dwellers: RawDwellers,
    #[serde(rename = "appVersion")]
    app_version: Option<String>,
}

#[derive(Deserialize)]
struct RawVault {
    #[serde(rename = "VaultName")]
    vault_name: String,
    #[serde(rename = "LunchBoxesCount")]
    lunchboxes: u32,
    storage: RawStorage,
}

#[derive(Deserialize)]
struct RawStorage {
    resources: RawResources,
}

#[derive(Deserialize)]
struct RawResources {
    #[serde(rename = "Nuka")]
    caps: f64,
    #[serde(rename = "Food")]
    food: f64,
    #[serde(rename = "Water")]
    water: f64,
    #[serde(rename = "Energy")]
    power: f64,
    #[serde(rename = "StimPack")]
    stimpaks: f64,
    #[serde(rename = "RadAway")]
    radaway: f64,
    #[serde(rename = "NukaColaQuantum")]
    quantum: f64,
    #[serde(rename = "MrHandy")]
    mr_handy: f64,
}

#[derive(Deserialize)]
struct RawDwellers {
    dwellers: Vec<IgnoredAny>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn inspects_real_save() {
        // Real save from dev-saves/ (gitignored); skips when absent (CI/clone).
        let path = Path::new("../dev-saves/Vault1.sav");
        if !path.exists() {
            eprintln!("skipping: {} not found", path.display());
            return;
        }

        let raw = std::fs::read(path).expect("read save file");
        let inspection = inspect_save(&raw).expect("inspect save");

        assert_eq!(inspection.sha256.len(), 64, "sha256 must be 64 hex chars");
        assert!(
            inspection.vault.dweller_count > 0,
            "expected at least one dweller"
        );
        println!("{inspection:#?}");
    }

    #[test]
    fn scans_a_directory_of_saves() {
        let dir = Path::new("../dev-saves");
        if !dir.exists() {
            eprintln!("skipping: {} not found", dir.display());
            return;
        }
        let found = scan_dir(dir);
        assert!(!found.is_empty(), "expected to find at least one save");
        let names: Vec<&String> = found.iter().map(|f| &f.file).collect();
        println!("Found {} save(s): {names:?}", found.len());
    }
}
