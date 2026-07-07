import { useTranslation } from "react-i18next";
import type { VaultInfo } from "../../types";
import { VaultStats } from "./VaultStats";

/** A collapsible recap: shows just the Vault name closed, full stats when open. */
export function VaultRecap({ vault }: { vault: VaultInfo }) {
  const { t } = useTranslation();

  return (
    <details className="vault-recap">
      <summary>{t("vault.heading", { name: vault.vault_name })}</summary>
      <div className="vault-recap-body">
        <VaultStats vault={vault} />
      </div>
    </details>
  );
}
