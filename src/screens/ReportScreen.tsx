import { useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import type { TransferReport } from "../types";
import {
  PrimaryButton,
  TerminalPanel,
  HashChip,
  StepGuide,
  Modal,
  InfoIcon,
} from "../components/shared";
import { playClick } from "../lib/sound";

/** Screen 3: the transfer report. The guided iPhone steps open in a modal. */
export function ReportScreen({ report, onBack }: { report: TransferReport; onBack: () => void }) {
  const { t } = useTranslation();
  const [guideOpen, setGuideOpen] = useState(false);
  const steps = t("guide.steps", { returnObjects: true }) as unknown as string[];

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
      <div className="screen-title-row">
        <h1 className="screen-title">{t("report.screenTitle")}</h1>
        <button
          className="icon-btn"
          onClick={() => setGuideOpen(true)}
          aria-label={t("guide.title")}
        >
          <InfoIcon />
        </button>
      </div>

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

      {guideOpen && (
        <Modal title={t("guide.title")} onClose={() => setGuideOpen(false)}>
          <StepGuide steps={steps} />
        </Modal>
      )}
    </section>
  );
}
