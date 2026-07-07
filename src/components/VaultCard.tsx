import { useTranslation } from "react-i18next";
import type { SaveInspection } from "../types";
import { TerminalPanel } from "./TerminalPanel";
import { HashChip } from "./HashChip";
import "./VaultCard.css";

export function VaultCard({ inspection }: { inspection: SaveInspection }) {
  const { t, i18n } = useTranslation();
  const v = inspection.vault;
  const nf = (n: number) => n.toLocaleString(i18n.language);

  const stats: { label: string; value: string | number }[] = [
    { label: t("vault.dwellers"), value: v.dweller_count },
    { label: t("vault.caps"), value: nf(v.caps) },
    { label: t("vault.food"), value: nf(v.food) },
    { label: t("vault.water"), value: nf(v.water) },
    { label: t("vault.power"), value: nf(v.power) },
    { label: t("vault.stimpaks"), value: v.stimpaks },
    { label: t("vault.radaway"), value: v.radaway },
    { label: t("vault.quantum"), value: v.nuka_quantum },
    { label: t("vault.mrHandy"), value: v.mr_handy },
    { label: t("vault.lunchboxes"), value: v.lunchboxes },
  ];
  if (v.app_version) {
    stats.push({ label: t("vault.gameVersion"), value: v.app_version });
  }

  return (
    <TerminalPanel>
      <h2 className="sb-vault-title">{t("vault.heading", { name: v.vault_name })}</h2>
      <dl className="sb-vault-stats">
        {stats.map((s) => (
          <div key={s.label} className="sb-stat">
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
      <HashChip label="SHA-256" value={inspection.sha256} />
    </TerminalPanel>
  );
}
