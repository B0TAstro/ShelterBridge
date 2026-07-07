import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import type { TransferReport } from "../types";
import { PrimaryButton } from "../components/shared";

/** Screen: list of past transfers, read from the local history file. */
export function HistoryScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<TransferReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke<TransferReport[]>("list_history")
      .then((h) => setEntries([...h].reverse())) // newest first
      .catch((e) => setError(String(e)));
  }, []);

  async function openFolder(dir: string) {
    try {
      await invoke("open_folder", { path: dir });
    } catch {
      // ignore
    }
  }

  return (
    <section>
      <PrimaryButton variant="secondary" className="back" onClick={onBack}>
        ← {t("common.back")}
      </PrimaryButton>
      <h1 className="screen-title">{t("history.screenTitle")}</h1>

      {error && <p className="error">{t("error", { message: error })}</p>}

      {entries.length === 0 ? (
        <p className="tagline">{t("history.empty")}</p>
      ) : (
        <ul className="history-list">
          {entries.map((e, i) => (
            <li key={`${e.stamp}-${i}`} className="history-item">
              <div>
                <div className="history-slot">{e.target_slot}</div>
                <div className="history-stamp">{e.stamp}</div>
              </div>
              <PrimaryButton variant="secondary" onClick={() => openFolder(e.backup_dir)}>
                {t("transfer.openFolder")}
              </PrimaryButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
