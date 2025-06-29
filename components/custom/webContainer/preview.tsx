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
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type filestructure = Record<string, { code: string }>;

interface WebContainerPreviewProps {
  webContainer: WebContainer | null;
  files: filestructure;
  responseRecevied: boolean;
}

export function WebContainerPreview({
  webContainer,
  files,
  responseRecevied,
}: WebContainerPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iError,setIError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [Url, setUrl] = useState("");
  const [isOnline] = useState(true);
  const [port, setport] = useState("3000");
  const [loadingState, setLoadingState] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");
  const [installationPhase, setInstallationPhase] = useState<
    "idle" | "installing" | "starting" | "ready"
  >("idle");
  const [serverProcess, setServerProcess] = useState<WebContainerProcess | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (responseRecevied) {
      startServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

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
      return;
    }
    setInstallationPhase("starting");
    const server = await webContainer.spawn("npm", ["run", "dev"]);
    setServerProcess(server);
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
    });
  }
  const onStart = () => {
    if (!isRunning) startServer();
  };
  const onStop = async () => {
    if (serverProcess) {
      await serverProcess.kill();
      setIsRunning(false);
      setInstallationPhase("idle");
      setServerProcess(null);
      setUrl("");
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
  return (
    <>
    <AlertDialog open={iError} onOpenChange={setIError}>
      <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Dependency installation failed</AlertDialogTitle>
            <AlertDialogDescription>
            An error occurred during the dependency installation process. Please try restarting the server or consider creating a new project if the issue persists.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogAction onClick={() => setIError(false)}>OK</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
    <div
      className={`bg-card border rounded-lg overflow-hidden flex flex-col ${
        isFullscreen ? "fixed inset-4 z-50" : "h-[79vh]"
      }`}
    >
      {/* Browser Header */}
      <div className="h-12 bg-muted border-b flex items-center gap-2 px-4">
        {/* Traffic Lights */}
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <div className="w-3 h-3 bg-green-400 rounded-full" />
        </div>

        {/* URL Bar */}
        <div className="flex-1 mx-4">
          <div className="bg-background px-3 py-1 rounded flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground truncate">
              {Url || "localhost:3000"}
            </span>
            {loadingState === "loading" && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={refreshPreview}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={openInNewTab}>
            <ExternalLink className="h-4 w-4" />
          </Button>

          {/* Server Controls */}
          {!isRunning ? (
            <Button size="sm" onClick={onStart} disabled={!webContainer || isRunning}>
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={onRestart}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Restart
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={onStop}
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Preview */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          {Url && installationPhase === "ready" ? (
            <div className="w-full h-full bg-white relative">
              {loadingState === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
            <div className="text-center">
              {webContainer ? (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    {isRunning ? (
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    ) : (
                      <Eye className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    {!isRunning ? (
                      <>
                        <h3 className="font-medium mb-2">Ready to Preview</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Click Start to run your application
                        </p>
                        <Button onClick={onStart}>
                          <Play className="h-4 w-4 mr-2" />
                          Start Development Server
                        </Button>
                      </>
                    ) : (
                      <>
                        {installationPhase === "installing" && (
                          <>
                            <h3 className="font-medium mb-2">
                              Installing Dependencies
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Installing npm packages...
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Installing the NPM package for the first time may
                              take a little longer than usual. Thanks for your
                              patience!{" "}
                            </p>
                          </>
                        )}
                        {installationPhase === "starting" && (
                          <>
                            <h3 className="font-medium mb-2">
                              Starting Server
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Running development server...
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              The preview may take 10–15 seconds to load after the server starts.
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium mb-2">
                      Initializing WebContainer
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Setting up the development environment...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-muted/50 border-t flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500" : "bg-gray-400"}`}
            />
            <span>{isRunning ? "Running" : "Stopped"}</span>
          </div>
          {isRunning && <span>Port: {port}</span>}
        </div>
        <div className="flex items-center gap-4">
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
    </div>
    </>
  );
}
