import { useState } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { PrimaryButton } from "./components/PrimaryButton";
import { VaultCard } from "./components/VaultCard";
import { BootSequence } from "./components/BootSequence";
import { Typewriter } from "./components/Typewriter";
import { TerminalFrame } from "./components/TerminalFrame";
import { Clock } from "./components/Clock";
import { VolumeOnIcon, VolumeOffIcon } from "./components/icons";
import { isMuted, setMuted, playBoot, playClick, playConfirm, playError } from "./lib/sound";
import type { SaveInspection } from "./types";

const LANGS = ["en", "fr"] as const;

function App() {
  const { t, i18n } = useTranslation();
  const [inspection, setInspection] = useState<SaveInspection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const [muted, setMutedState] = useState(isMuted());

  async function chooseSave() {
    playClick();
    setError(null);
    const path = await open({
      multiple: false,
      filters: [{ name: "Fallout Shelter save", extensions: ["sav"] }],
    });
    if (typeof path !== "string") return; // user cancelled

    try {
      setInspection(await invoke<SaveInspection>("read_save", { path }));
      playConfirm();
    } catch (e) {
      setInspection(null);
      setError(String(e));
      playError();
    }
  }

  function changeLang(lng: string) {
    void i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  if (!booted) {
    return (
      <BootSequence
        onDone={() => {
          playBoot();
          setBooted(true);
        }}
      />
    );
  }

  return (
    <div className="sb-app">
      <TerminalFrame
        title="SHELTERBRIDGE // LOCAL VAULT INTERFACE"
        footer={
          <>
            <span>LOCAL-FIRST · NO NETWORK</span>
            <Clock />
          </>
        }
      >
        <header className="app-header">
          <div className="brand">
            <h1 className="screen-title sb-glitch" data-text={t("app.screenTitle")}>
              {t("app.screenTitle")}
            </h1>
            <p className="tagline">{t("app.tagline")}</p>
          </div>
          <div className="toolbar">
            <button className="icon-btn" onClick={toggleMute} aria-label="toggle sound">
              {muted ? <VolumeOffIcon /> : <VolumeOnIcon />}
            </button>
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
          </div>
        </header>

        <PrimaryButton onClick={chooseSave}>{t("app.chooseSave")}</PrimaryButton>

        {error && <p className="error">{t("error", { message: error })}</p>}
        {inspection && (
          <>
            <p className="sb-status">
              <Typewriter key={inspection.sha256} text={t("system.decoded")} />
            </p>
            <VaultCard inspection={inspection} />
          </>
        )}
      </TerminalFrame>
    </div>
  );
}

export default App;
