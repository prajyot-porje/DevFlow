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
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { EditorView } from "@codemirror/view";

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
}

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
        className={`flex items-center gap-1 p-1 rounded cursor-pointer hover:bg-accent/50 transition-colors ${
          isSelected ? "bg-accent" : ""
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === "folder" ? (
          <div className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </div>
        ) : (
          <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}

        <span className="text-sm truncate flex-1 select-none">{node.name}</span>
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
  extensions.push(EditorView.lineWrapping);
  return extensions;
};

export function ResizableEditor({
  files,
  selectedFile,
  onFileSelect,
  onFileChange,
}: ResizableEditorProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["/components", "/components/ui"])
  );
  const [openTabs, setOpenTabs] = useState<string[]>([selectedFile]);
  const [activeTab, setActiveTab] = useState(selectedFile);
  const { theme } = useTheme();
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileTree = useMemo(() => buildFileTree(files), [files]);
  const currentFile = files[activeTab];
  const language = getLanguageFromFile(activeTab);
  const [unsavedCode, setUnsavedCode] = useState<string | null>(null);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const codeMirrorRef = useRef<{ view?: EditorView } | null>(null);
  const [streamingFile, setStreamingFile] = useState<string | null>(null);

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

  useEffect(() => {
    if (streamingFile && files[streamingFile]) {
      const lines = files[streamingFile].code.split("\n");
      let index = 0;

      const interval = setInterval(() => {
        if (index < lines.length) {
          setUnsavedCode((prev) => (prev || "") + lines[index] + "\n");
          index++;
        } else {
          clearInterval(interval);
          setStreamingFile(null);
        }
      }, 100); // Adjust delay for streaming effect

      return () => clearInterval(interval);
    }
  }, [streamingFile, files]);

  return (
    <div className="min-w-full">
      <ResizablePanelGroup
        direction="horizontal"
        className={`border-2 min-h-[79vh] border-gray-500 bg-background ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
      >
        {/* File Explorer */}
        <ResizablePanel
          defaultSize={20}
          className="bg-card border-r max-w-1/2 min-w-1/12 flex flex-col"
        >
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <span className="font-medium text-sm">Explorer</span>
            </div>
          </div>
          <div className="flex-1 p-2">
            <div className="space-y-1">
              {[...fileTree]
                .sort((a, b) => {
                  const aIsFolder = a.type === "folder";
                  const bIsFolder = b.type === "folder";

                  if (aIsFolder === bIsFolder) {
                    return a.name.localeCompare(b.name); 
                  }
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
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Code Editor */}
        <ResizablePanel className="flex-1 bg-card flex flex-col">
          {currentFile ? (
            <>
              {/* Tabs */}
              <div className="border-b bg-background/50 backdrop-blur">
                <div className="flex items-center overflow-x-auto">
                  {openTabs.map((fileName) => (
                    <div
                      key={fileName}
                      className={`flex items-center gap-2 px-3 py-2 border-r cursor-pointer hover:bg-accent/50 transition-colors ${
                        activeTab === fileName ? "bg-accent" : ""
                      }`}
                      onClick={() => {
                        setActiveTab(fileName);
                        onFileSelect(fileName);
                      }}
                    >
                      <span className="text-sm truncate max-w-32">
                        {fileName.split("/").pop()}
                      </span>
                      {openTabs.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTabClose(fileName);
                          }}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {language}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadProject}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={handleSave}
                      disabled={unsavedCode === null}
                    >
                      Save
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            setFontSize(Math.max(10, fontSize - 1))
                          }
                        >
                          Font Size: {fontSize}px (-)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setFontSize(Math.min(24, fontSize + 1))
                          }
                        >
                          Font Size: {fontSize}px (+)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
              </div>

              {/* Editor Content */}
              <div className="flex min-h-[64vh] w-full">
                {/* Code Area */}
                <div className="flex-1 relative h-full">
                  <ScrollArea className="h-[64vh] w-full">
                    <CodeMirror
                      ref={codeMirrorRef}
                      value={unsavedCode !== null ? unsavedCode : currentFile.code}
                      height="100%"
                      theme={theme === "dark" ? vscodeDark : sublime}
                      extensions={getCodeMirrorExtensions(language)}
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
                          'Monaco, "Cascadia Code", "Segoe UI Mono", "Roboto Mono", Consolas, "Courier New", monospace',
                        minHeight: "64vh",
                        height: "100%",
                        background: "transparent",
                        overflowX: "hidden",
                      }}
                      editable={true}
                      spellCheck={false}
                    />
                  </ScrollArea>
                  {showSavePopup && unsavedCode !== null && (
                    <div className="fixed left-1/2 bottom-8 z-50 transform -translate-x-1/2 bg-background border shadow-lg px-6 py-3 rounded flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                      <span className="text-sm">You have unsaved changes.</span>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        className="px-4"
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Bar */}
              <div className="h-6 bg-muted/50 border-t flex items-center justify-between px-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>{language.toUpperCase()}</span>
                  <span>UTF-8</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Spaces: 2</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Type className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
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
