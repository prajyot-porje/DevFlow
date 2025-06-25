import { Code, Eye, Sparkles } from "lucide-react";
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

export const testimonials = [
  {
    name: "Sarah Chen",
    role: "Frontend Developer",
    company: "TechCorp",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "CodeCraft AI has revolutionized my workflow. I can prototype ideas 10x faster now!",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Product Designer",
    company: "StartupXYZ",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "The AI understands design patterns perfectly. It's like having a senior developer on demand.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "Full-stack Engineer",
    company: "InnovateLab",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "From concept to deployment in minutes. This tool is a game-changer for rapid prototyping.",
    rating: 5,
  },
];

export const quickPrompts = [
  "Create a modern landing page with hero section",
  "Build a dashboard with analytics charts",
  "Design an e-commerce product grid",
  "Make a contact form with validation",
  "Create a pricing table component",
  "Build a testimonials carousel",
];

export const sandpackFiles = {
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
</html>`.trim(),
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
});`.trim(),
},

  "/postcss.config.js": {
    code: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`.trim(),
  },

  "/tailwind.config.js": {
    code: `export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};`.trim(),
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
    "lucide-react": "^0.276.0",
    "motion": "^12.18.1",
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
  }
}`.trim()
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
);`.trim(),
  },

  "/src/App.jsx": {
    code: `import { useState } from "react";
import { motion } from "motion/react";
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
}`.trim(),
  },

  "/src/index.css": {
    code: `@tailwind base;
@tailwind components;
@tailwind utilities;`.trim(),
  },
};


export function buildAIPrompt(
  files: Record<string, { code: string }>,
  userRequest: string
): string {
  const projectFiles = Object.entries(files)
    .map(([filePath, fileData]) => `${filePath}\n${fileData.code}\n`)
    .join('\n');

  return `
You are an expert AI coding assistant for a modern **React (Vite)** project.  
Your task is to generate **clean, beautiful, and responsive UIs**, following the latest best practices in React and Tailwind CSS.

🚨 Strict guidelines to follow:
- Use **/src/App.jsx** as the main app component.
- Use **/src/main.jsx** to render the app.
- Use **Tailwind CSS** for styling.
- Use **shadcn/ui** components where appropriate.
- edit the package.json and keep only that dependencies which are being used in this project
- Use **lucide-react** for icons.
- For images, use the **Unsplash API** if necessary.
- Apply **modern animations** using **framer-motion** where helpful.
- while using **framer-motion** always remember to import framer motion like "import { motion } from "motion/react""as this is the new version of it
- Ensure a **clean, modern, minimal aesthetic** (no outdated or plain styles).
- Keep components **modular and accessible**.
- Do **NOT** use Next.js or create any '/pages'directory.
- Do **NOT** use typescript , keep the project in javascript only
- Do **NOT** place files in a 'public' folder (unless explicitly requested).
- Include **only** files that are **new or changed**.
- Always include **full file paths and full code** for each file.

Here is the current state of my project:
${projectFiles || "(For new projects, this section will contain the basic starter template.)"}

My request:
${userRequest}

Respond ONLY in the following JSON format:

{
  "explanation": "<clear explanation of the changes or code's purpose>",
  "files": {
    "/src/App.jsx": { "code": "<full code>" },
    "/src/components/SomeComponent.jsx": { "code": "<full code>" },
    "/tailwind.config.js": { "code": "<if updated>" }
  },
  "generatedFiles": [
    "/src/components/SomeComponent.jsx"
  ]
}
`.trim();
}

