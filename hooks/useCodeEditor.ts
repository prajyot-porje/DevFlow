import { useState, useEffect, useCallback } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DefaultFiles as initialFiles } from "@/data/data";
import { useWebContainer, type InputFileStructure } from "./useWebContainer";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseCodeEditorOptions {
  workspaceId: string;
}

export function useCodeEditor({ workspaceId }: UseCodeEditorOptions) {
  const [files, setFiles] = useState<InputFileStructure>(initialFiles);
  const [selectedFile, setSelectedFile] = useState("/src/App.jsx");
  const [activeTab, setActiveTab] = useState("chat");
  const [loadingHistory, setLoadingHistory] = useState(true);

  const convex = useConvex();
  const UpdateFiles = useMutation(api.workspace.UpdateFiles);
  const { webContainer, mountFiles, error: containerError } = useWebContainer();

  // ── Sync files into WebContainer whenever the file map or container changes ──
  useEffect(() => {
    mountFiles(files);
  }, [files, mountFiles]);

  // ── Load workspace data (files + messages) from Convex ─────────────────────
  const loadWorkspace = useCallback(async () => {
    setLoadingHistory(true);
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceID: workspaceId as Id<"workspaces">,
    });

    if (result?.files) {
      setFiles((prev) => ({ ...prev, ...result.files }));
    }

    // NOTE: setLoadingHistory(false) is left to the caller so the skeleton
    // only unmounts after message state is also populated.
    return result;
  }, [convex, workspaceId]);

  // ── Handles in-editor edits (called by ResizableEditor) ────────────────────
  const handleFileChange = useCallback((fileName: string, code: string) => {
    setFiles((prev) => ({ ...prev, [fileName]: { code } }));
  }, []);

  // ── Persists a new file map to Convex and updates local state ───────────────
  const applyGeneratedFiles = useCallback(
    async (newFiles: InputFileStructure) => {
      const merged = { ...files, ...newFiles };
      setFiles(merged);
      await UpdateFiles({
        workspaceID: workspaceId as Id<"workspaces">,
        files: merged,
      });
      setActiveTab("code");
      return merged;
    },
    [files, workspaceId, UpdateFiles]
  );

  return {
    // State
    files,
    setFiles,
    selectedFile,
    setSelectedFile,
    activeTab,
    setActiveTab,
    loadingHistory,
    setLoadingHistory,
    // Container
    webContainer,
    containerError,
    // Actions
    loadWorkspace,
    handleFileChange,
    applyGeneratedFiles,
  };
}
