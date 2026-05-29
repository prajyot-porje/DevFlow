"use client";

import { useState, useRef, useEffect } from "react";
import type { WebContainer, WebContainerProcess } from "@webcontainer/api";
import {
  Eye,
  Play,
  Square,
  RefreshCw,
  Loader2,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  Globe,
  Package,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type filestructure = Record<string, { code: string }>;

interface WebContainerPreviewProps {
  webContainer: WebContainer | null;
  files: filestructure;
  responseReceived: boolean;
}

export function WebContainerPreview({
  webContainer,
  files,
  responseReceived,
}: WebContainerPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iError, setIError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [Url, setUrl] = useState("");
  const [port, setport] = useState("3000");
  const [loadingState, setLoadingState] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const [installationPhase, setInstallationPhase] = useState<
    "idle" | "installing" | "starting" | "ready"
  >("idle");
  const [serverProcess, setServerProcess] = useState<WebContainerProcess | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const serverStartedRef = useRef(false);

  useEffect(() => {
    if (responseReceived && !serverStartedRef.current && webContainer) {
      serverStartedRef.current = true;
      startServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, responseReceived, webContainer]);

  // Ping the server to check if it's responsive and load the iframe early
  useEffect(() => {
    if (!Url || loadingState !== "loading") return;

    let active = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const checkServerReady = async () => {
      try {
        await fetch(Url, { mode: "no-cors", cache: "no-store" });
        if (active) {
          setLoadingState("loaded");
        }
      } catch {
        if (active) {
          timerId = setTimeout(checkServerReady, 500);
        }
      }
    };

    checkServerReady();

    // Safety fallback: if pinging fails or page takes too long to load, force-display it after 2.5 seconds
    const fallbackId = setTimeout(() => {
      if (active) {
        setLoadingState("loaded");
      }
    }, 2500);

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
      clearTimeout(fallbackId);
    };
  }, [Url, loadingState]);

  async function startServer() {
    if (!webContainer) return;
    setIsRunning(true);
    setInstallationPhase("installing");
    const installProcess = await webContainer.spawn("pnpm", ["install"]);
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      })
    );
    const installExitCode = await installProcess.exit;
    if (installExitCode !== 0) {
      setIError(true);
      setInstallationPhase("idle");
      setIsRunning(false);
      setLoadingState("error");
      serverStartedRef.current = false;
      return;
    }
    setInstallationPhase("starting");
    const server = await webContainer.spawn("npm", ["run", "dev"]);
    setServerProcess(server);

    server.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log("[Vite Dev Server Output]", data);
        },
      })
    );

    webContainer.on("server-ready", (port, url) => {
      setUrl(url);
      setport(port.toString());
      setInstallationPhase("ready");
      setLoadingState("loading"); 
    });

    server.exit.then(() => {
      setIsRunning(false);
      setInstallationPhase("idle");
      setServerProcess(null);
      serverStartedRef.current = false;
    });
  }

  const onStart = () => {
    if (!isRunning) {
      serverStartedRef.current = true;
      startServer();
    }
  };

  const onStop = async () => {
    if (serverProcess) {
      await serverProcess.kill();
      setIsRunning(false);
      setInstallationPhase("idle");
      setServerProcess(null);
      setUrl("");
      serverStartedRef.current = false;
    }
  };

  const onRestart = async () => {
    await onStop();
    startServer();
  };

  const handleIframeLoad = () => {
    setLoadingState("loaded");
  };

  const handleIframeError = () => {
    setLoadingState("error");
  };

  const openInNewTab = () => {
    if (Url) {
      window.open(Url, "_blank");
    }
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      setLoadingState("loading");
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // ── Progress steps ─────────────────────────────────────────────────────────
  const steps = [
    { id: "installing", label: "Installing packages", icon: Package },
    { id: "starting", label: "Starting dev server", icon: Zap },
    { id: "ready", label: "Preview ready", icon: CheckCircle2 },
  ];

  const getStepState = (stepId: string) => {
    const order = ["installing", "starting", "ready"];
    const currentIdx = order.indexOf(installationPhase);
    const stepIdx = order.indexOf(stepId);
    if (stepIdx < currentIdx) return "complete";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  };

  return (
    <>
    <AlertDialog open={iError} onOpenChange={setIError}>
      <AlertDialogContent className="bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] rounded-2xl">
        <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-[var(--color-text-primary)] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--color-danger)]" />
              Installation Failed
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--color-text-secondary)]">
            An error occurred during dependency installation. Try restarting the server or create a new project if the issue persists.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogAction
          onClick={() => setIError(false)}
          className="rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white"
        >
          OK
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>

    <div
      className={`bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl overflow-hidden flex flex-col shadow-sm ${
        isFullscreen ? "fixed inset-4 z-50 rounded-2xl shadow-2xl shadow-black/40" : "h-[calc(100vh-180px)] mb-6"
      }`}
    >
      {/* ── Browser Chrome ── */}
      <div className="h-11 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-subtle)] flex items-center gap-3 px-4">
        {/* Traffic Lights */}
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all cursor-default" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:brightness-90 transition-all cursor-default" />
          <div className="w-3 h-3 rounded-full bg-[#28C840] hover:brightness-90 transition-all cursor-default" />
        </div>

        {/* URL Bar */}
        <div className="flex-1 mx-1">
          <div className="bg-[var(--color-bg-inset)] h-7 px-3 rounded-lg flex items-center gap-2 border border-[var(--color-border-subtle)]">
            <Globe className="h-3 w-3 text-[var(--color-text-tertiary)] shrink-0" />
            <span className="text-[12px] font-mono text-[var(--color-text-secondary)] truncate flex-1">
              {Url || "localhost:3000"}
            </span>
            {loadingState === "loading" && (
              <Loader2 className="h-3 w-3 animate-spin text-[var(--color-accent)] shrink-0" />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={refreshPreview}
            className="h-7 w-7 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all duration-150"
            title="Refresh"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={openInNewTab}
            className="h-7 w-7 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all duration-150"
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          {/* Server Controls */}
          {!isRunning ? (
            <Button
              size="sm"
              onClick={onStart}
              disabled={!webContainer || isRunning}
              className="h-7 text-[12px] rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white gap-1 px-3 font-medium"
            >
              <Play className="h-3 w-3" />
              Start
            </Button>
          ) : (
            <>
              <button
                onClick={onRestart}
                className="h-7 px-2.5 rounded-lg flex items-center gap-1 text-[12px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-hover)] transition-all duration-150"
              >
                <RefreshCw className="h-3 w-3" />
                Restart
              </button>
              <button
                onClick={onStop}
                className="h-7 px-2.5 rounded-lg flex items-center gap-1 text-[12px] font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all duration-150"
              >
                <Square className="h-3 w-3" />
                Stop
              </button>
            </>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-7 w-7 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all duration-150 ml-1"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center bg-[var(--color-bg-page)]">
          {Url && installationPhase === "ready" ? (
            <div className="w-full h-full bg-white relative">
              {loadingState === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-surface)]/80 backdrop-blur-sm z-10">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
                    <span className="text-[13px] font-body text-[var(--color-text-secondary)]">Loading preview…</span>
                  </div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={Url}
                className="w-full h-full border-0"
                title="Preview"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ visibility: loadingState === "loaded" ? "visible" : "hidden" }}
              />
            </div>
          ) : (
            <div className="text-center max-w-sm px-6">
              {webContainer ? (
                <div className="space-y-6">
                  {!isRunning ? (
                    /* Idle state */
                    <>
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] flex items-center justify-center">
                        <Eye className="h-7 w-7 text-[var(--color-text-tertiary)]" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-[var(--color-text-primary)] mb-1.5">Ready to Preview</h3>
                        <p className="font-body text-[13px] text-[var(--color-text-secondary)] mb-5 leading-relaxed">
                          Start the development server to see your application
                        </p>
                        <Button
                          onClick={onStart}
                          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white gap-2 rounded-xl h-10 px-5 font-medium"
                        >
                          <Play className="h-4 w-4" />
                          Start Server
                        </Button>
                      </div>
                    </>
                  ) : (
                    /* Progress steps */
                    <>
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
                        <Loader2 className="h-7 w-7 animate-spin text-[var(--color-accent)]" />
                      </div>
                      <div className="space-y-4">
                        {steps.map((step) => {
                          const state = getStepState(step.id);
                          const Icon = step.icon;
                          return (
                            <div
                              key={step.id}
                              className={`flex items-center gap-3 text-left transition-all duration-300 ${
                                state === "pending" ? "opacity-30" : "opacity-100"
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                state === "complete"
                                  ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                                  : state === "active"
                                  ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                                  : "bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)]"
                              }`}>
                                {state === "complete" ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : state === "active" ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Icon className="w-4 h-4" />
                                )}
                              </div>
                              <span className={`font-body text-[13px] ${
                                state === "active"
                                  ? "text-[var(--color-text-primary)] font-medium"
                                  : state === "complete"
                                  ? "text-[var(--color-success)]"
                                  : "text-[var(--color-text-tertiary)]"
                              }`}>
                                {step.label}
                                {state === "active" && "…"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {installationPhase === "installing" && (
                        <p className="font-body text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
                          First-time installs may take a moment
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* WebContainer initializing */
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-[var(--color-text-tertiary)]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-[var(--color-text-primary)] mb-1.5">
                      Initializing Environment
                    </h3>
                    <p className="font-body text-[13px] text-[var(--color-text-secondary)]">
                      Setting up the development environment…
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="h-7 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-subtle)] flex items-center justify-between px-4 text-[11px] font-mono text-[var(--color-text-tertiary)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isRunning ? "bg-[var(--color-online)]" : "bg-[var(--color-text-tertiary)]"
              }`}
            />
            <span>{isRunning ? "Running" : "Stopped"}</span>
          </div>
          {isRunning && <span>Port {port}</span>}
        </div>
        {installationPhase !== "idle" && installationPhase !== "ready" && (
          <span className="text-[var(--color-accent)]">
            {installationPhase === "installing" ? "Installing…" : "Starting…"}
          </span>
        )}
      </div>
    </div>
    </>
  );
}