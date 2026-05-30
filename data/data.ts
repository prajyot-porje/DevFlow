import {
  FileText,
  Camera,
  Music,
  Heart,
  Star,
  Rocket,
  Target,
  Code,
  Palette,
  Database,
  Globe,
  Zap,
  Layers,
  Settings,
  BookOpen,
  Eye,
  Sparkles,
  Briefcase,
} from "lucide-react";
import { ChatMessage } from "./Types";

export const greetingMessage: ChatMessage = {
  id: "greeting",
  type: "assistant",
  content:
    "Hello! I'm your AI assistant. I can help you build beautiful web interfaces. What would you like to create today?",
  timestamp: Date.now(),
};

export const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Transform your ideas into beautiful code with advanced AI",
    demo: "Generate a modern dashboard with charts and analytics",
  },
  {
    icon: Eye,
    title: "Real-time Preview",
    description: "See your creations come to life instantly",
    demo: "Preview across mobile, tablet, and desktop devices",
  },
  {
    icon: Code,
    title: "Clean Code Output",
    description: "Production-ready code with best practices",
    demo: "Export optimized React components with TypeScript",
  },
];

export const projectIcons = [
  FileText,
  Code,
  Palette,
  Database,
  Globe,
  Zap,
  Layers,
  Settings,
  BookOpen,
  Briefcase,
  Camera,
  Music,
  Heart,
  Star,
  Rocket,
  Target,
];

export const iconColors = [
  "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  "text-purple-500 bg-purple-500/10 border-purple-500/20",
  "text-orange-500 bg-orange-500/10 border-orange-500/20",
  "text-pink-500 bg-pink-500/10 border-pink-500/20",
  "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  "text-red-500 bg-red-500/10 border-red-500/20",
  "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "text-teal-500 bg-teal-500/10 border-teal-500/20",
  "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
];

export const quickPrompts = [
  "Build a SaaS Landing Page",
  "Create an AI Chat Interface",
  "Design a Personal Portfolio",
];

export const existingProjectPrompts = [
  "Add search and filter functionality",
  "Implement a responsive dark mode",
  "Add interactive analytics charts",
];

export const DefaultFiles = {
  "/index.html": {
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  },

  "/vite.config.js": {
    code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});`,
  },

  "/postcss.config.js": {
    code: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
  },

  "/tailwind.config.js": {
    code: `export default {
  content: ["./index.html", "./**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};`,
  },

  "/package.json": {
    code: `{
  "name": "vite-react-tailwind-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "motion": "^12.19.2",
    "lucide-react": "^0.276.0",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.15",
    "postcss": "^8.4.24",
    "clsx": "^2.1.1",
    "class-variance-authority": "^0.7.0",
    "tailwind-variants": "^0.1.6",
    "@radix-ui/react-checkbox": "^1.0.5",
    "@radix-ui/react-icons": "^1.3.0"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.1.0"
  },
  "packageManager": "pnpm@8.15.4"
}`,
  },

  "/pnpm-lock.yaml": {
    code: `lockfileVersion: '6.0'
packageManager: pnpm@8.15.4
importers:
  .:
    dependencies:
      '@radix-ui/react-checkbox': 1.0.5
      '@radix-ui/react-icons': 1.3.0
      autoprefixer: 10.4.15
      class-variance-authority: 0.7.0
      clsx: 2.1.1
      motion: 12.19.2
      lucide-react: 0.276.0
      postcss: 8.4.24
      react: 18.2.0
      react-dom: 18.2.0
      tailwind-variants: 0.1.6
      tailwindcss: 3.4.1
    devDependencies:
      '@vitejs/plugin-react': 4.1.0
      vite: 5.2.0`,
  },

  "/src/main.jsx": {
    code: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  },

  "/src/App.jsx": {
    code: `import { useState } from "react";
import { motion } from "framer-motion";
import { Sun } from "lucide-react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6"
    >
      <Sun className="text-blue-500 w-10 h-10 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Vite + React + Tailwind</h1>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Clicked {count} times
      </button>
    </motion.div>
  );
}`,
  },

  "/src/index.css": {
    code: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
  },
};
