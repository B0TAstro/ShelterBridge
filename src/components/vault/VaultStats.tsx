import { useTranslation } from "react-i18next";
import type { VaultInfo } from "../../types";

/** The reliable Vault stats as a grid. Shared by VaultCard and VaultRecap. */
export function VaultStats({ vault }: { vault: VaultInfo }) {
  const { t, i18n } = useTranslation();
  const nf = (n: number) => n.toLocaleString(i18n.language);

  const stats: { label: string; value: string | number }[] = [
    { label: t("vault.dwellers"), value: vault.dweller_count },
    { label: t("vault.caps"), value: nf(vault.caps) },
    { label: t("vault.food"), value: nf(vault.food) },
    { label: t("vault.water"), value: nf(vault.water) },
    { label: t("vault.power"), value: nf(vault.power) },
    { label: t("vault.stimpaks"), value: vault.stimpaks },
    { label: t("vault.radaway"), value: vault.radaway },
    { label: t("vault.quantum"), value: vault.nuka_quantum },
    { label: t("vault.mrHandy"), value: vault.mr_handy },
    { label: t("vault.lunchboxes"), value: vault.lunchboxes },
  ];
  if (vault.app_version) {
    stats.push({ label: t("vault.gameVersion"), value: vault.app_version });
  }

  return (
    <dl className="sb-vault-stats">
      {stats.map((s) => (
        <div key={s.label} className="sb-stat">
          <dt>{s.label}</dt>
          <dd>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
