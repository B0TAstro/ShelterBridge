import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import type { TransferReport } from "../types";
import { PrimaryButton, TerminalPanel, HashChip } from "../components/shared";
import { playClick } from "../lib/sound";

/** Screen 3: the transfer report + open the backup folder. */
export function ReportScreen({ report, onBack }: { report: TransferReport; onBack: () => void }) {
  const { t } = useTranslation();

  async function openFolder() {
    playClick();
    try {
      await invoke("open_folder", { path: report.backup_dir });
    } catch {
      // Folder may be unavailable; ignore.
    }
  }

  return (
    <section>
      <PrimaryButton variant="secondary" className="back" onClick={onBack}>
        ← {t("common.back")}
      </PrimaryButton>
      <h1 className="screen-title">{t("report.screenTitle")}</h1>

      <TerminalPanel>
        <p className="sb-status">{t("transfer.done", { slot: report.target_slot })}</p>
        <dl className="sb-vault-stats">
          <div className="sb-stat">
            <dt>{t("transfer.slotFile")}</dt>
            <dd>{report.target_slot}</dd>
          </div>
          <div className="sb-stat">
            <dt>{t("transfer.folder")}</dt>
            <dd className="path">{report.backup_dir}</dd>
          </div>
        </dl>
        <HashChip label="SHA-256" value={report.prepared_sha256} />
        <div className="transfer-actions">
          <PrimaryButton onClick={openFolder}>{t("transfer.openFolder")}</PrimaryButton>
        </div>
      </TerminalPanel>
    </section>
  );
}
