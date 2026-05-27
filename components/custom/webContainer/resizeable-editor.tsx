"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Download,
  Settings,
  Maximize2,
  Minimize2,
  Type,
  Folder,
  FileJson,
  FileCode2,
  FileText,
  FileType,
  X,
  Check,
} from "lucide-react";
import { EditorView } from "@uiw/react-codemirror";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useTheme } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { sublime } from "@uiw/codemirror-theme-sublime";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";


interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
}

interface ResizableEditorProps {
  files: Record<string, { code: string }>;
  selectedFile: string;
  onFileSelect: (fileName: string) => void;
  onFileChange: (fileName: string, code: string) => void;
  readOnly?: boolean;
}

// ── File type icon helper ────────────────────────────────────────────────────
const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
      return <FileCode2 className="h-3.5 w-3.5 text-yellow-400 shrink-0" />;
    case "ts":
    case "tsx":
      return <FileCode2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    case "css":
    case "scss":
      return <FileType className="h-3.5 w-3.5 text-purple-400 shrink-0" />;
    case "html":
      return <FileCode2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />;
    case "json":
      return <FileJson className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
    case "md":
      return <FileText className="h-3.5 w-3.5 text-[var(--color-text-tertiary)] shrink-0" />;
    case "yaml":
    case "yml":
      return <FileText className="h-3.5 w-3.5 text-rose-400 shrink-0" />;
    default:
      return <FileText className="h-3.5 w-3.5 text-[var(--color-text-tertiary)] shrink-0" />;
  }
};

// ── Folder icon with color ───────────────────────────────────────────────────
const getFolderIcon = (name: string, isExpanded: boolean) => {
  let color = "text-[var(--color-text-tertiary)]";
  if (name === "src") color = "text-blue-400";
  else if (name === "components") color = "text-emerald-400";
  else if (name === "ui") color = "text-purple-400";
  else if (name === "lib" || name === "utils") color = "text-amber-400";
  else if (name === "public" || name === "assets") color = "text-teal-400";

  return (
    <div className="flex items-center gap-0.5">
      {isExpanded ? (
        <ChevronDown className="h-3 w-3 text-[var(--color-text-tertiary)]" />
      ) : (
        <ChevronRight className="h-3 w-3 text-[var(--color-text-tertiary)]" />
      )}
      <Folder className={`h-3.5 w-3.5 ${color} shrink-0`} />
    </div>
  );
};

const buildFileTree = (files: Record<string, { code: string }>): FileNode[] => {
  const tree: FileNode[] = [];
  const pathMap = new Map<string, FileNode>();

  Object.keys(files).forEach((filePath) => {
    const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    const parts = cleanPath.split("/");
    let currentPath = "";

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const fullPath = `/${currentPath}`;

      if (!pathMap.has(fullPath)) {
        const node: FileNode = {
          name: part,
          type: isLast ? "file" : "folder",
          path: fullPath,
          children: isLast ? undefined : [],
        };

        pathMap.set(fullPath, node);

        if (index === 0) {
          tree.push(node);
        } else {
          const parentPath = `/${parts.slice(0, index).join("/")}`;
          const parent = pathMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        }
      }
    });
  });

  return tree;
};

const getLanguageFromFile = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "css":
      return "css";
    case "scss":
      return "scss";
    case "html":
      return "html";
    case "yaml":
      return "yaml";
    case "json":
      return "json";
    case "md":
      return "markdown";
    default:
      return "text";
  }
};

const downloadProjectAsZip = async (
  files: Record<string, { code: string }>
) => {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  Object.entries(files).forEach(([filePath, fileData]) => {
    const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    zip.file(cleanPath, fileData.code);
  });

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "project.zip";
  a.click();
  URL.revokeObjectURL(url);
};

function FileTreeNode({
  node,
  level = 0,
  selectedFile,
  onFileSelect,
  expandedFolders,
  setExpandedFolders,
}: {
  node: FileNode;
  level?: number;
  selectedFile: string;
  onFileSelect: (fileName: string) => void;
  expandedFolders: Set<string>;
  setExpandedFolders: (folders: Set<string>) => void;
}) {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedFile === node.path;

  const toggleFolder = () => {
    const newExpanded = new Set(expandedFolders);
    if (isExpanded) {
      newExpanded.delete(node.path);
    } else {
      newExpanded.add(node.path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleClick = () => {
    if (node.type === "folder") {
      toggleFolder();
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-[5px] px-2 rounded-md cursor-pointer transition-colors duration-150 ${
          isSelected
            ? "bg-[var(--color-accent-glow)] text-[var(--color-accent-light)]"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === "folder" ? (
          getFolderIcon(node.name, isExpanded)
        ) : (
          getFileIcon(node.name)
        )}
        <span className="text-[13px] font-body truncate flex-1 select-none">{node.name}</span>
      </div>

      {node.type === "folder" && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              expandedFolders={expandedFolders}
              setExpandedFolders={setExpandedFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const getCodeMirrorExtensions = (language: string) => {
  const extensions = [];

  switch (language) {
    case "javascript":
      extensions.push(javascript());
      break;
    case "typescript":
      extensions.push(javascript({ typescript: true }));
      break;
    case "css":
      extensions.push(css());
      break;
    case "html":
      extensions.push(html());
      break;
    case "json":
      extensions.push(json());
      break;
    case "markdown":
      extensions.push(markdown());
      break;
    default:
      break;
  }

  return extensions;
};



export function ResizableEditor({
  files,
  selectedFile,
  onFileSelect,
  onFileChange,
  readOnly = false,
}: ResizableEditorProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["/components", "/components/ui", "/src", "/src/components", "/src/components/ui"])
  );
  const [openTabs, setOpenTabs] = useState<string[]>([selectedFile]);
  const [activeTab, setActiveTab] = useState(selectedFile);
  const { theme } = useTheme();
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileTree = useMemo(() => buildFileTree(files), [files]);
  const currentFile = files[activeTab];
  const language = getLanguageFromFile(activeTab);
  const [unsavedCode, setUnsavedCode] = useState<string | null>(null);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const codeMirrorRef = useRef<ReactCodeMirrorRef | null>(null);


  useEffect(() => {
    if (selectedFile && !openTabs.includes(selectedFile)) {
      setOpenTabs((prev) => [...prev, selectedFile]);
    }
    setActiveTab(selectedFile);
    setUnsavedCode(null); 
    setShowSavePopup(false);
  }, [selectedFile, openTabs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "s"
      ) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [unsavedCode, activeTab, currentFile]);

  const handleTabClose = (fileName: string) => {
    if (openTabs.length <= 1) return;
    const newTabs = openTabs.filter((tab) => tab !== fileName);
    setOpenTabs(newTabs);
    if (activeTab === fileName) {
      const currentIndex = openTabs.indexOf(fileName);
      const nextTab =
        newTabs[currentIndex] || newTabs[currentIndex - 1] || newTabs[0];
      setActiveTab(nextTab);
      onFileSelect(nextTab);
    }
  };

  const copyToClipboard = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadProject = () => {
    downloadProjectAsZip(files);
  };
  
  const handleSave = () => {
    if (unsavedCode !== null && currentFile) {
      onFileChange(activeTab, unsavedCode);
      setUnsavedCode(null);
      setShowSavePopup(false);
      if (codeMirrorRef.current && codeMirrorRef.current.view) {
        codeMirrorRef.current.view.focus();
      }
    }
  };

  const handleCodeChange = (value: string) => {
    if (value !== currentFile.code) {
      setUnsavedCode(value);
      setShowSavePopup(true);
    } else {
      setUnsavedCode(null);
      setShowSavePopup(false);
    }
  };


  return (
    <div className="min-w-full">
      <ResizablePanelGroup
        direction="horizontal"
        className={`border border-[var(--color-border-default)] rounded-lg overflow-hidden min-h-[79vh] bg-[var(--color-bg-page)] ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
      >
        {/* ── File Explorer ── */}
        <ResizablePanel
          defaultSize={20}
          className="bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] max-w-1/2 min-w-1/12 flex flex-col"
        >
          <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-2">
              <Folder className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
              <span className="font-heading font-medium text-[13px] text-[var(--color-text-secondary)] uppercase tracking-wider">Explorer</span>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-2 px-1">
              {[...fileTree]
                .sort((a, b) => {
                  const aIsFolder = a.type === "folder";
                  const bIsFolder = b.type === "folder";
                  if (aIsFolder === bIsFolder) return a.name.localeCompare(b.name);
                  return aIsFolder ? -1 : 1;
                })
                .map((node) => (
                  <FileTreeNode
                    key={node.path}
                    node={node}
                    selectedFile={selectedFile}
                    onFileSelect={onFileSelect}
                    expandedFolders={expandedFolders}
                    setExpandedFolders={setExpandedFolders}
                  />
                ))}
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle className="w-[1px] bg-[var(--color-border-subtle)] hover:bg-[var(--color-accent)]/30 transition-colors duration-200" />

        {/* ── Code Editor ── */}
        <ResizablePanel className="flex-1 bg-[var(--color-bg-surface)] flex flex-col">
          {currentFile ? (
            <>
              {/* Tab bar */}
              <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] flex items-center">
                <div className="flex-1 flex items-center overflow-x-auto hide-scrollbar">
                  {openTabs.map((fileName) => {
                    const isActive = activeTab === fileName;
                    const hasUnsaved = fileName === activeTab && unsavedCode !== null;
                    return (
                      <div
                        key={fileName}
                        className={`group relative flex items-center gap-2 px-3.5 py-2.5 border-r border-[var(--color-border-subtle)] cursor-pointer transition-all duration-150 text-[13px] font-body ${
                          isActive
                            ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]/50"
                        }`}
                        onClick={() => {
                          setActiveTab(fileName);
                          onFileSelect(fileName);
                        }}
                      >
                        {/* Active tab top indicator */}
                        {isActive && (
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--color-accent)]" />
                        )}
                        {getFileIcon(fileName.split("/").pop() || "")}
                        <span className="truncate max-w-32">
                          {fileName.split("/").pop()}
                        </span>
                        {/* Unsaved dot */}
                        {hasUnsaved && (
                          <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
                        )}
                        {/* Close button */}
                        {openTabs.length > 1 && (
                          <button
                            className={`w-4 h-4 rounded flex items-center justify-center transition-all duration-150 ${
                              isActive
                                ? "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
                                : "opacity-0 group-hover:opacity-100 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTabClose(fileName);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-0.5 px-2 shrink-0 border-l border-[var(--color-border-subtle)]">
                  <button
                    onClick={copyToClipboard}
                    className="h-7 w-7 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all duration-150"
                    title="Copy file"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-[var(--color-success)]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={handleDownloadProject}
                    className="h-7 w-7 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all duration-150"
                    title="Download project"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-7 w-7 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all duration-150">
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-[var(--color-bg-elevated)] border-[var(--color-border-default)] rounded-xl">
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          setFontSize(Math.max(10, fontSize - 1))
                        }
                        className="rounded-lg"
                      >
                        Font Size: {fontSize}px (−)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setFontSize(Math.min(24, fontSize + 1))
                        }
                        className="rounded-lg"
                      >
                        Font Size: {fontSize}px (+)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-7 w-7 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all duration-150"
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

              {/* Editor Content */}
              <div className="flex min-h-[64vh] w-full">
                <div className="flex-1 relative h-full">
                  <ScrollArea className="h-[64vh] w-full">
                    <CodeMirror
                       ref={codeMirrorRef}
                       value={unsavedCode !== null ? unsavedCode : currentFile.code}
                       height="100%"
                       theme={theme === "dark" ? vscodeDark : sublime}
                       extensions={[
                         ...getCodeMirrorExtensions(language),
                         EditorView.lineWrapping,
                       ]}
                       onChange={handleCodeChange}
                       basicSetup={{
                         lineNumbers: true,
                         highlightActiveLine: true,
                         foldGutter: true,
                         autocompletion: true,
                         indentOnInput: true,
                       }}
                       style={{
                         fontSize: `${fontSize}px`,
                         fontFamily:
                           'var(--font-mono), Monaco, "Cascadia Code", "Segoe UI Mono", "Roboto Mono", Consolas, monospace',
                         minHeight: "64vh",
                         height: "100%",
                         background: "transparent",
                         overflowX: "hidden",
                       }}
                       editable={!readOnly}
                       spellCheck={false}
                    />
                  </ScrollArea>
                  {/* Unsaved changes bar */}
                  {showSavePopup && unsavedCode !== null && (
                    <div className="absolute left-1/2 bottom-6 z-30 -translate-x-1/2 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] shadow-xl shadow-black/20 px-5 py-2.5 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                      <span className="text-[13px] font-body text-[var(--color-text-secondary)]">Unsaved changes</span>
                      <button
                        onClick={handleSave}
                        className="text-[13px] font-medium font-body text-[var(--color-accent)] hover:text-[var(--color-accent-light)] transition-colors px-3 py-1 rounded-lg hover:bg-[var(--color-accent)]/10"
                      >
                        Save
                      </button>
                      <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">Ctrl+S</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Bar */}
              <div className="h-7 bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-subtle)] flex items-center justify-between px-4 text-[11px] font-mono text-[var(--color-text-tertiary)]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    {getFileIcon(activeTab.split("/").pop() || "")}
                    {language.toUpperCase()}
                  </span>
                  <span>UTF-8</span>
                  {unsavedCode !== null && (
                    <span className="flex items-center gap-1 text-[var(--color-accent)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                      Modified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span>Spaces: 2</span>
                  <span>{fontSize}px</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Type className="h-12 w-12 mx-auto mb-4 text-[var(--color-text-tertiary)] opacity-50" />
                <p className="font-body text-[var(--color-text-secondary)]">
                  Select a file to start editing
                </p>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
