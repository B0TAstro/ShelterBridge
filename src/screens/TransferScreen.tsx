import { useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import type { TransferReport, VaultInfo } from "../types";
import { PrimaryButton } from "../components/shared";
import { SlotSelector, VaultRecap } from "../components/vault";
import { playClick, playConfirm, playError } from "../lib/sound";
import { makeStamp } from "../lib/stamp";

/** Screen 2: pick a target slot for the save loaded on the previous screen. */
export function TransferScreen({
  sourcePath,
  vault,
  onBack,
  onPrepared,
}: {
  sourcePath: string;
  vault: VaultInfo;
  onBack: () => void;
  onPrepared: (report: TransferReport) => void;
}) {
  const { t } = useTranslation();
  const [slot, setSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function prepare() {
    if (!slot) return;
    playClick();
    setError(null);
    try {
      const report = await invoke<TransferReport>("prepare_transfer", {
        sourcePath,
        slot,
        stamp: makeStamp(),
      });
      playConfirm();
      onPrepared(report);
    } catch (e) {
      setError(String(e));
      playError();
    }
  }

  return (
    <section>
      <PrimaryButton variant="secondary" className="back" onClick={onBack}>
        ← {t("common.back")}
      </PrimaryButton>
      <h1 className="screen-title">{t("transfer.screenTitle")}</h1>
      <p className="tagline">{t("transfer.tagline")}</p>

      <VaultRecap vault={vault} />

      <div className="transfer-slots">
        <h3 className="section-title">{t("transfer.chooseSlot")}</h3>
        <SlotSelector value={slot} onChange={setSlot} />
      </div>

      <PrimaryButton onClick={prepare} disabled={!slot}>
        {t("transfer.prepare")}
      </PrimaryButton>

      {error && <p className="error">{t("error", { message: error })}</p>}
    </section>
  );
}
