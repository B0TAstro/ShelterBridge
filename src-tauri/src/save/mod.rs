//! Reading and decrypting Fallout Shelter save files.
//!
//! `Vault*.sav` files are AES-256-CBC encrypted JSON, then Base64 encoded.
//! The AES key is derived with PBKDF2-HMAC-SHA1 from fixed, community-known
//! parameters (identical for every save). We only ever READ saves here — never
//! write or modify the original.

use aes::cipher::{block_padding::Pkcs7, BlockDecryptMut, KeyIvInit};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use pbkdf2::pbkdf2_hmac;
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn decrypts_real_save_to_json() {
        // Uses a real save from dev-saves/ (gitignored). Skips gracefully when
        // the file is absent (e.g. on CI or a fresh clone).
        let path = Path::new("../dev-saves/Vault1.sav");
        if !path.exists() {
            eprintln!("skipping: {} not found", path.display());
            return;
        }

        let raw = std::fs::read(path).expect("read save file");
        let json = decrypt_save(&raw).expect("decrypt save");

        // A Fallout Shelter save is a JSON object, so it must start with '{'.
        assert!(json.trim_start().starts_with('{'), "expected a JSON object");
        let preview = &json[..json.len().min(200)];
        println!("First 200 chars of decrypted JSON:\n{preview}");
    }
}
