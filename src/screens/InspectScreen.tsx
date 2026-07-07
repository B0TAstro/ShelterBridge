import { useState } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import type { FoundSave, SaveInspection } from "../types";
import { PrimaryButton, Typewriter, CloseIcon } from "../components/shared";
import { VaultCard } from "../components/vault";
import { playClick, playConfirm } from "../lib/sound";

/** Screen 1: import or scan for a save, then inspect it. The loaded save lives
 * in App and is shared with the transfer screen. */
export function InspectScreen({
  inspection,
  error,
  onChoose,
  onClear,
  onGoTransfer,
  onSelectSave,
}: {
  inspection: SaveInspection | null;
  error: string | null;
  onChoose: () => void;
  onClear: () => void;
  onGoTransfer: () => void;
  onSelectSave: (path: string, inspection: SaveInspection) => void;
}) {
  const { t } = useTranslation();
  const [scanned, setScanned] = useState<FoundSave[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  async function scan(dir?: string) {
    playClick();
    setScanning(true);
    setScanError(null);
    try {
      setScanned(await invoke<FoundSave[]>("scan_saves", { dir: dir ?? null }));
    } catch (e) {
      setScanned([]);
      setScanError(String(e));
    } finally {
      setScanning(false);
    }
  }

  async function scanFolder() {
    const dir = await open({ directory: true });
    if (typeof dir === "string") await scan(dir);
  }

  function select(f: FoundSave) {
    playConfirm();
    setScanned(null);
    onSelectSave(f.path, f.inspection);
  }

  return (
    <section>
      <header className="screen-head">
        <div>
          <h1 className="screen-title sb-glitch" data-text={t("app.screenTitle")}>
            {t("app.screenTitle")}
          </h1>
          <p className="tagline">{t("app.tagline")}</p>
        </div>
        {inspection && (
          <PrimaryButton variant="secondary" onClick={onGoTransfer}>
            {t("inspect.transferCta")} →
          </PrimaryButton>
        )}
      </header>

      <div className="choose-row">
        <PrimaryButton onClick={onChoose}>{t("app.chooseSave")}</PrimaryButton>
        <PrimaryButton variant="secondary" onClick={() => scan()}>
          {t("inspect.scan")}
        </PrimaryButton>
        <PrimaryButton variant="secondary" onClick={scanFolder}>
          {t("inspect.scanFolder")}
        </PrimaryButton>
        {inspection && (
          <PrimaryButton
            variant="secondary"
            className="sb-btn--icon"
            onClick={onClear}
            aria-label={t("inspect.clear")}
          >
            <CloseIcon />
          </PrimaryButton>
        )}
      </div>

      {scanning && <p className="sb-status">{t("inspect.scanning")}</p>}
      {scanError && <p className="error">{t("error", { message: scanError })}</p>}
      {error && <p className="error">{t("error", { message: error })}</p>}

      {!inspection && !scanning && scanned?.length === 0 && (
        <p className="tagline">{t("inspect.noSaves")}</p>
      )}

      {!inspection && scanned && scanned.length > 0 && (
        <div className="scan-results">
          {scanned.map((f) => (
            <button key={f.path} className="scan-card" onClick={() => select(f)}>
              <span className="scan-card-vault">
                {t("vault.heading", { name: f.inspection.vault.vault_name })}
              </span>
              <span className="scan-card-file">{f.file}</span>
              <span className="scan-card-meta">
                {t("vault.dwellers")}: {f.inspection.vault.dweller_count}
              </span>
            </button>
          ))}
        </div>
      )}

      {inspection && (
        <>
          <p className="sb-status">
            <Typewriter key={inspection.sha256} text={t("system.decoded")} />
          </p>
          <VaultCard inspection={inspection} />
        </>
      )}
    </section>
  );
}
