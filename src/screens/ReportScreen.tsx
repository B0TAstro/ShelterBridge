import { useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import type { SaveInspection, TransferReport } from "../types";
import {
  PrimaryButton,
  TerminalPanel,
  HashChip,
  StepGuide,
  Modal,
  InfoIcon,
} from "../components/shared";
import { VaultRecap } from "../components/vault";
import { playClick } from "../lib/sound";

/** Screen 3. The guided iPhone steps are always in a modal (via the info
 * button). With a prepared report (game installed → slot chosen): shows the
 * report. Without one (imported save, no game): shows the save recap + file. */
export function ReportScreen({
  report,
  inspection,
  sourcePath,
  onBack,
}: {
  report: TransferReport | null;
  inspection: SaveInspection | null;
  sourcePath: string | null;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [guideOpen, setGuideOpen] = useState(false);
  const steps = t("guide.steps", { returnObjects: true }) as unknown as string[];

  async function openFolder() {
    if (!report) return;
    playClick();
    try {
      await invoke("open_folder", { path: report.backup_dir });
    } catch {
      // Folder may be unavailable; ignore.
    }
  }

  async function revealSource() {
    if (!sourcePath) return;
    playClick();
    try {
      await invoke("reveal_file", { path: sourcePath });
    } catch {
      // File may be unavailable; ignore.
    }
  }

  return (
    <section>
      <PrimaryButton variant="secondary" className="back" onClick={onBack}>
        ← {t("common.back")}
      </PrimaryButton>

      <div className="screen-title-row">
        <h1 className="screen-title">
          {report ? t("report.screenTitle") : t("report.manualTitle")}
        </h1>
        <button
          className="icon-btn"
          onClick={() => setGuideOpen(true)}
          aria-label={t("guide.title")}
        >
          <InfoIcon />
        </button>
      </div>

      {report ? (
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
      ) : inspection ? (
        <>
          <p className="tagline">{t("report.manualHint")}</p>
          <VaultRecap vault={inspection.vault} />
          {sourcePath && (
            <>
              <p className="source-file">
                <span className="source-file-label">{t("transfer.sourceFile")}</span> {sourcePath}
              </p>
              <div className="transfer-actions">
                <PrimaryButton onClick={revealSource}>{t("transfer.openFolder")}</PrimaryButton>
              </div>
            </>
          )}
        </>
      ) : null}

      {guideOpen && (
        <Modal title={t("guide.title")} onClose={() => setGuideOpen(false)}>
          <StepGuide steps={steps} />
        </Modal>
      )}
    </section>
  );
}
