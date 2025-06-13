"use client";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Palette,
  Plus,
  Settings,
  Sparkles,
  Zap,
  History,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface SidebarProps {
    historyOpen: boolean;
    setHistoryOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ historyOpen, setHistoryOpen }) => {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    return (
        <div
            className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 h-full ease-in-out border-r bg-card/50 backdrop-blur-sm flex-shrink-0`}
        >
            <div className="p-4">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    {sidebarOpen && (
                        <div className="animate-in slide-in-from-left-2 duration-200">
                            <h1 className="font-bold text-lg">DevFlow</h1>
                            <p className="text-xs text-muted-foreground">Build with AI</p>
                        </div>
                    )}
                </div>
                {sidebarOpen && (
                    <Button
                        className="w-full mb-4 gap-2"
                        onClick={() => router.push("/chat")}
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </Button>
                )}

                <nav className="space-y-2">
                    {[
                        { icon: Zap, label: "Generate", active: true },
                        { icon: History, label: "History" },
                        { icon: Layers, label: "Projects" },
                        { icon: Palette, label: "Templates" },
                        { icon: Settings, label: "Settings" },
                    ].map((item, index) => (
                        <Button
                            key={index}
                            variant={item.active ? "default" : "ghost"}
                            className={`w-full justify-start gap-3 transition-all duration-200 ${!sidebarOpen ? "px-2" : ""}`}
                            onClick={() => {
                                if (item.label === "History") setHistoryOpen(!historyOpen);
                            }}
                        >
                            <item.icon className="w-4 h-4" />
                            {sidebarOpen && (
                                <span className="animate-in slide-in-from-left-2 duration-200">
                                    {item.label}
                                </span>
                            )}
                        </Button>
                    ))}
                </nav>
            </div>

            <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 -right-3 w-6 h-6 rounded-full border bg-background shadow-md"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? (
                    <ChevronLeft className="w-3 h-3" />
                ) : (
                    <ChevronRight className="w-3 h-3" />
                )}
            </Button>
        </div>
    );
};

export default Sidebar;
