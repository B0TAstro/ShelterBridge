import { useTranslation } from "react-i18next";
import type { SaveInspection } from "../../types";
import { TerminalPanel, HashChip } from "../shared";
import { VaultStats } from "./VaultStats";

export function VaultCard({ inspection }: { inspection: SaveInspection }) {
  const { t } = useTranslation();

  return (
    <TerminalPanel>
      <h2 className="sb-vault-title">
        {t("vault.heading", { name: inspection.vault.vault_name })}
      </h2>
      <VaultStats vault={inspection.vault} />
      <HashChip label="SHA-256" value={inspection.sha256} />
    </TerminalPanel>
  );
}
