import WebContainerService from "@/services/webcontainer-service";
import { WebContainer, type FileSystemTree } from "@webcontainer/api";
import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InputFileStructure = Record<string, { code: string }>;

// ---------------------------------------------------------------------------
// Pure helper – converts the flat file map used in the editor into the nested
// FileSystemTree format that WebContainer.mount() expects.
// ---------------------------------------------------------------------------

export function convertToWebContainerFileSystem(
  fileStructure: InputFileStructure
): FileSystemTree {
  const root: FileSystemTree = {};

  for (const fullPath in fileStructure) {
    const parts = fullPath.replace(/^\//, "").split("/");
    let current: FileSystemTree = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current[part] = {
          file: {
            contents: fileStructure[fullPath].code,
          },
        };
      } else {
        if (!current[part]) {
          current[part] = { directory: {} };
        } else if (!("directory" in current[part])) {
          throw new Error(
            `Conflict at ${fullPath}: trying to create directory but found a file.`
          );
        }
        current = (current[part] as { directory: FileSystemTree }).directory;
      }
    }
  }

  return root;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useWebContainer = () => {
  const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initContainer = async () => {
      try {
        const service = WebContainerService.getInstance();
        const container = await service.getContainer();
        setWebContainer(container);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize WebContainer"
        );
        console.error("WebContainer initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initContainer();
  }, []);

  /**
   * Mounts (or re-mounts) a set of files into the running WebContainer.
   * Safe to call whenever the file map changes – no-ops if the container
   * is not yet ready.
   */
  const mountFiles = useCallback(
    async (files: InputFileStructure) => {
      if (!webContainer || Object.keys(files).length === 0) return;
      try {
        const converted = convertToWebContainerFileSystem(files);
        await webContainer.mount(converted);
      } catch (err) {
        console.error("Failed to update WebContainer files:", err);
      }
    },
    [webContainer]
  );

  return { webContainer, isLoading, error, mountFiles };
};
