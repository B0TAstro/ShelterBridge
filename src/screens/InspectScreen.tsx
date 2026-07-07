import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import type { FoundSave, SaveInspection } from "../types";
import { PrimaryButton, Typewriter, ScanLoader, CloseIcon } from "../components/shared";
import { VaultCard } from "../components/vault";
import { playClick, playConfirm } from "../lib/sound";

/** Screen 1: auto-scans the default location on arrival. Whether the game is
 * detected there decides where the transfer button leads. */
export function InspectScreen({
  inspection,
  error,
  onChoose,
  onClear,
  onSelectSave,
  onGoTransfer,
}: {
  inspection: SaveInspection | null;
  error: string | null;
  onChoose: () => void;
  onClear: () => void;
  onSelectSave: (path: string, inspection: SaveInspection) => void;
  onGoTransfer: (gameDetected: boolean) => void;
}) {
  const { t } = useTranslation();
  const [scanned, setScanned] = useState<FoundSave[] | null>(null); // null = scanning
  const [gameDetected, setGameDetected] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Auto-scan the default Steam location on arrival. A hit there = the game is
  // installed on this PC → the transfer can offer slot selection (screen 2).
  // A chosen folder or a manual file is just an import → transfer goes to the
  // manual guide (screen 3).
  useEffect(() => {
    invoke<FoundSave[]>("scan_saves", { dir: null })
      .then((r) => {
        setScanned(r);
        setGameDetected(r.length > 0);
      })
      .catch((e) => {
        setScanned([]);
        setScanError(String(e));
      });
  }, []);

  async function scanFolder() {
    const dir = await open({ directory: true });
    if (typeof dir !== "string") return;
    playClick();
    setScanError(null);
    setScanned(null);
    try {
      setScanned(await invoke<FoundSave[]>("scan_saves", { dir }));
    } catch (e) {
      setScanned([]);
      setScanError(String(e));
    }
  }

  function select(f: FoundSave) {
    playConfirm();
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
          <PrimaryButton variant="secondary" onClick={() => onGoTransfer(gameDetected)}>
            {t("inspect.transferCta")} →
          </PrimaryButton>
        )}
      </header>

      <div className="choose-row">
        <PrimaryButton onClick={scanFolder}>{t("inspect.scanFolder")}</PrimaryButton>
        <PrimaryButton onClick={onChoose}>{t("app.chooseSave")}</PrimaryButton>
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

      {error && <p className="error">{t("error", { message: error })}</p>}
      {scanError && <p className="error">{t("error", { message: scanError })}</p>}

      {inspection ? (
        <>
          <p className="sb-status">
            <Typewriter key={inspection.sha256} text={t("system.decoded")} />
          </p>
          <VaultCard inspection={inspection} />
        </>
      ) : scanned === null ? (
        <ScanLoader label={t("inspect.scanning")} />
      ) : (
        <>
          <p className="scan-count">
            {scanned.length > 0
              ? t("inspect.found", { count: scanned.length })
              : t("inspect.noSaves")}
          </p>
          {scanned.length > 0 && (
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
        </>
      )}
    </section>
  );
}
