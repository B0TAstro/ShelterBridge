import { useTranslation } from "react-i18next";

const SLOTS = [1, 2, 3] as const;

export function SlotSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (slot: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="slot-selector" role="group" aria-label={t("transfer.chooseSlot")}>
      {SLOTS.map((n) => (
        <button
          key={n}
          type="button"
          className={`slot-bay ${value === n ? "active" : ""}`}
          onClick={() => onChange(n)}
        >
          <span className="slot-num">{n}</span>
          <span className="slot-file">Vault{n}.sav</span>
        </button>
      ))}
    </div>
  );
}
