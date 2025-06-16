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
  "/App.js": {
    code: `import React, { useState } from "react";
import "./index.css";

export default function App() {
  const [value, setValue] = useState("// Start coding!");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">React + Tailwind</h1>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        className="w-full max-w-xl h-64 p-2 border rounded font-mono"
      />
    </div>
  );
}
`.trim(),
  },
  "/index.js": {
    code: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
`.trim(),
  },
  "/index.css": {
    code: `@tailwind base;
@tailwind components;
@tailwind utilities;
`.trim(),
  },
  "/tailwind.config.js": {
    code: `module.exports = {
  content: ["./App.js", "./index.js"],
  theme: { extend: {} },
  plugins: [],
};
`.trim(),
  },
  "/postcss.config.js": {
    code: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`.trim(),
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
You are an expert AI coding assistant for a React (Vite) project. 
Follow these rules strictly:
- Use /App.js as the entry point (never App.jsx or index.js).
- Never use or create a src directory; all files must be at the project root.
- Use lucide-react for icons.
- Use the Unsplash API for images.
- Only include files that are changed or newly created.
- Do NOT use Next.js or /pages directory.
- Always specify file paths clearly.

Here is the current state of my project:
${projectFiles || "(For new projects, this section will be empty.)"}

My request:
${userRequest}

Respond ONLY in the following JSON format:

{
  "projectTitle": "<simple title>",
  "explanation": "<clear explanation of the changes or code's purpose>",
  "files": {
    "/App.js": { "code": "<full code>" },
    "/components/SomeComponent.js": { "code": "<full code>" }
  },
  "generatedFiles": [
    "/path/to/newFile.js"
  ]
}
`.trim();
}
