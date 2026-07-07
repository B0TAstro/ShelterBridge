import { useTranslation } from "react-i18next";
import type { SaveInspection } from "../types";
import { PrimaryButton, Typewriter, CloseIcon } from "../components/shared";
import { VaultCard } from "../components/vault";

/** Screen 1: import a save and inspect it. The loaded save lives in App and is
 * shared with the transfer screen. */
export function InspectScreen({
  inspection,
  error,
  onChoose,
  onClear,
  onGoTransfer,
}: {
  inspection: SaveInspection | null;
  error: string | null;
  onChoose: () => void;
  onClear: () => void;
  onGoTransfer: () => void;
}) {
  const { t } = useTranslation();

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
