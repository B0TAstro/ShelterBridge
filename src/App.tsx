import { useState } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type VaultInfo = {
  vault_name: string;
  app_version: string | null;
  dweller_count: number;
  caps: number;
  food: number;
  water: number;
  power: number;
  stimpaks: number;
  radaway: number;
  nuka_quantum: number;
  mr_handy: number;
  lunchboxes: number;
};

type SaveInspection = {
  sha256: string;
  vault: VaultInfo;
};

const LANGS = ["en", "fr"] as const;

function App() {
  const { t, i18n } = useTranslation();
  const [inspection, setInspection] = useState<SaveInspection | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function chooseSave() {
    setError(null);
    const path = await open({
      multiple: false,
      filters: [{ name: "Fallout Shelter save", extensions: ["sav"] }],
    });
    if (typeof path !== "string") return; // user cancelled

    try {
      setInspection(await invoke<SaveInspection>("read_save", { path }));
    } catch (e) {
      setInspection(null);
      setError(String(e));
    }
  }

  function changeLang(lng: string) {
    void i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  }

  // Format numbers with the active locale (e.g. 15,349 vs 15 349).
  const nf = (n: number) => n.toLocaleString(i18n.language);

  return (
    <main className="container">
      <div className="lang-switch">
        {LANGS.map((lng) => (
          <button
            key={lng}
            className={i18n.language.startsWith(lng) ? "active" : ""}
            onClick={() => changeLang(lng)}
          >
            {lng.toUpperCase()}
          </button>
        ))}
      </div>

      <h1>{t("app.title")}</h1>
      <p className="tagline">{t("app.tagline")}</p>
      <button onClick={chooseSave}>{t("app.chooseSave")}</button>

      {error && <p className="error">{t("error", { message: error })}</p>}

      {inspection && (
        <section className="vault">
          <h2>{t("vault.heading", { name: inspection.vault.vault_name })}</h2>
          <ul>
            <li>
              {t("vault.dwellers")}: {inspection.vault.dweller_count}
            </li>
            <li>
              {t("vault.caps")}: {nf(inspection.vault.caps)}
            </li>
            <li>
              {t("vault.food")}: {nf(inspection.vault.food)}
            </li>
            <li>
              {t("vault.water")}: {nf(inspection.vault.water)}
            </li>
            <li>
              {t("vault.power")}: {nf(inspection.vault.power)}
            </li>
            <li>
              {t("vault.stimpaks")}: {inspection.vault.stimpaks}
            </li>
            <li>
              {t("vault.radaway")}: {inspection.vault.radaway}
            </li>
            <li>
              {t("vault.quantum")}: {inspection.vault.nuka_quantum}
            </li>
            <li>
              {t("vault.mrHandy")}: {inspection.vault.mr_handy}
            </li>
            <li>
              {t("vault.lunchboxes")}: {inspection.vault.lunchboxes}
            </li>
            {inspection.vault.app_version && (
              <li>
                {t("vault.gameVersion")}: {inspection.vault.app_version}
              </li>
            )}
          </ul>
          <p className="hash">SHA-256: {inspection.sha256}</p>
        </section>
      )}
    </main>
  );
}

export default App;
