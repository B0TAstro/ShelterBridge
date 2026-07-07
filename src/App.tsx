import { useState } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { TerminalFrame } from "./components/TerminalFrame";
import { BootSequence } from "./components/BootSequence";
import { Clock, VolumeOnIcon, VolumeOffIcon } from "./components/shared";
import { InspectScreen } from "./screens/InspectScreen";
import { TransferScreen } from "./screens/TransferScreen";
import { ReportScreen } from "./screens/ReportScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { isMuted, setMuted, playBoot, playClick, playConfirm, playError } from "./lib/sound";
import type { SaveInspection, TransferReport } from "./types";

const LANGS = ["en", "fr"] as const;
type Screen = "inspect" | "transfer" | "report" | "history";

function App() {
  const { t, i18n } = useTranslation();
  const [booted, setBooted] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [screen, setScreen] = useState<Screen>("inspect");

  // The loaded save is shared across screens (inspect + transfer).
  const [sourcePath, setSourcePath] = useState<string | null>(null);
  const [inspection, setInspection] = useState<SaveInspection | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [report, setReport] = useState<TransferReport | null>(null);

  async function loadSave() {
    playClick();
    setLoadError(null);
    const path = await open({
      multiple: false,
      filters: [{ name: "Fallout Shelter save", extensions: ["sav"] }],
    });
    if (typeof path !== "string") return;

    try {
      const result = await invoke<SaveInspection>("read_save", { path });
      setSourcePath(path);
      setInspection(result);
      playConfirm();
    } catch (e) {
      setSourcePath(null);
      setInspection(null);
      setLoadError(String(e));
      playError();
    }
  }

  function clearSave() {
    setSourcePath(null);
    setInspection(null);
    setLoadError(null);
  }

  function selectSave(path: string, insp: SaveInspection) {
    setSourcePath(path);
    setInspection(insp);
    setLoadError(null);
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

  const toolbar = (
    <>
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
    </>
  );

  let content;
  if (screen === "transfer" && inspection && sourcePath) {
    content = (
      <TransferScreen
        sourcePath={sourcePath}
        vault={inspection.vault}
        onBack={() => setScreen("inspect")}
        onPrepared={(r) => {
          setReport(r);
          setScreen("report");
        }}
      />
    );
  } else if (screen === "report") {
    content = (
      <ReportScreen
        report={report}
        inspection={inspection}
        sourcePath={sourcePath}
        onBack={() => setScreen(report ? "transfer" : "inspect")}
      />
    );
  } else if (screen === "history") {
    content = <HistoryScreen onBack={() => setScreen("inspect")} />;
  } else {
    content = (
      <InspectScreen
        inspection={inspection}
        error={loadError}
        onChoose={loadSave}
        onClear={clearSave}
        onSelectSave={selectSave}
        onGoTransfer={(detected) => {
          if (detected) {
            setScreen("transfer");
          } else {
            // No game detected → nothing is prepared: show the manual guide,
            // never a stale report.
            setReport(null);
            setScreen("report");
          }
        }}
      />
    );
  }

  return (
    <div className="sb-app">
      <TerminalFrame
        title="SHELTERBRIDGE // LOCAL VAULT INTERFACE"
        toolbar={toolbar}
        footer={
          <>
            <span className="footer-info">LOCAL-FIRST · NO NETWORK</span>
            <div className="footer-right">
              <button className="footer-cell footer-hist" onClick={() => setScreen("history")}>
                {t("history.cta")}
              </button>
              <span className="footer-cell">
                <Clock />
              </span>
            </div>
          </>
        }
      >
        {content}
      </TerminalFrame>
    </div>
  );
}

export default App;
