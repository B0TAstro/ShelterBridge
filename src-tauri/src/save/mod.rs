//! Reading, decrypting and parsing Fallout Shelter save files.
//!
//! `Vault*.sav` files are AES-256-CBC encrypted JSON, then Base64 encoded.
//! The AES key is derived with PBKDF2-HMAC-SHA1 from fixed, community-known
//! parameters (identical for every save). We only ever READ saves here — never
//! write or modify the original.

use aes::cipher::{block_padding::Pkcs7, BlockDecryptMut, KeyIvInit};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use pbkdf2::pbkdf2_hmac;
use serde::de::IgnoredAny;
use serde::{Deserialize, Serialize};
use sha1::Sha1;

/// Fixed decryption parameters documented by the Fallout Shelter community.
/// The same values decrypt every save file.
const IV: [u8; 16] = *b"tu89geji340t89u2";
const PBKDF2_PASSWORD: &[u8] = b"UGxheWVy";
const PBKDF2_ROUNDS: u32 = 1000;

/// A CBC decryptor specialised for AES-256.
type Aes256CbcDec = cbc::Decryptor<aes::Aes256>;

/// Decrypt the raw bytes of a `Vault*.sav` file into its JSON text.
///
/// Returns an error message if the input is not valid base64, cannot be
/// decrypted, or is not valid UTF-8 — i.e. if it does not look like a real save.
pub fn decrypt_save(raw: &[u8]) -> Result<String, String> {
    // The file is base64 text. Drop any trailing newline/space, then decode it
    // back into the raw encrypted bytes.
    let trimmed = raw.trim_ascii_end();
    let ciphertext = STANDARD
        .decode(trimmed)
        .map_err(|e| format!("not valid base64: {e}"))?;

    // Derive the 32-byte AES key. Password, salt (the IV) and rounds are all
    // fixed, so this always yields the same key — but deriving it keeps the
    // code self-documenting rather than hiding a magic constant.
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha1>(PBKDF2_PASSWORD, &IV, PBKDF2_ROUNDS, &mut key);

    // AES-256-CBC decrypt, and strip the PKCS7 padding, in a single call.
    let plaintext = Aes256CbcDec::new(&key.into(), &IV.into())
        .decrypt_padded_vec_mut::<Pkcs7>(&ciphertext)
        .map_err(|e| format!("decryption failed (wrong key/IV/rounds?): {e}"))?;

    // The decrypted bytes should be UTF-8 JSON.
    String::from_utf8(plaintext).map_err(|e| format!("decrypted data is not UTF-8: {e}"))
}

/// The subset of a Vault's data we reliably parse and show to the user.
/// Resource amounts are stored as floats in the save; we round them for display.
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

/// Parse the decrypted JSON into the reliable fields we display.
///
/// Only the fields we trust are extracted; everything else in the save is
/// ignored. Returns an error if the JSON doesn't have the expected shape.
pub fn parse_vault(json: &str) -> Result<VaultInfo, String> {
    let raw: RawSave = serde_json::from_str(json).map_err(|e| format!("invalid save JSON: {e}"))?;

    // Destructure the parsed data so we can move fields out cleanly.
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

// --- Internal shapes matching the raw save JSON ---------------------------
// We only declare the fields we need; serde ignores every other key in the
// save. `#[serde(rename)]` maps our snake_case fields to the game's key names.

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
    // We only need the number of dwellers, so ignore each element's contents.
    dwellers: Vec<IgnoredAny>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn decrypts_and_parses_real_save() {
        // Uses a real save from dev-saves/ (gitignored). Skips gracefully when
        // the file is absent (e.g. on CI or a fresh clone).
        let path = Path::new("../dev-saves/Vault1.sav");
        if !path.exists() {
            eprintln!("skipping: {} not found", path.display());
            return;
        }

        let raw = std::fs::read(path).expect("read save file");
        let json = decrypt_save(&raw).expect("decrypt save");
        assert!(json.trim_start().starts_with('{'), "expected a JSON object");

        let info = parse_vault(&json).expect("parse vault");
        assert!(info.dweller_count > 0, "expected at least one dweller");
        println!("Parsed VaultInfo:\n{info:#?}");
    }
}
