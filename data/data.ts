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
import dedent from "dedent";

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
  "text-blue-500 bg-blue-50 border-blue-100",
  "text-green-500 bg-green-50 border-green-100",
  "text-purple-500 bg-purple-50 border-purple-100",
  "text-orange-500 bg-orange-50 border-orange-100",
  "text-pink-500 bg-pink-50 border-pink-100",
  "text-indigo-500 bg-indigo-50 border-indigo-100",
  "text-red-500 bg-red-50 border-red-100",
  "text-yellow-500 bg-yellow-50 border-yellow-100",
  "text-teal-500 bg-teal-50 border-teal-100",
  "text-cyan-500 bg-cyan-50 border-cyan-100",
];

export const quickPrompts = [
  "Make a Todo App",
  "Build a Budget tracker website",
  "Simple E-commerce website",
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

export function buildCodePrompt(
  files: Record<string, { code: string }>,
  userRequest: string
): string {
  const projectFiles = Object.entries(files)
    .map(([filePath, fileData]) => `${filePath}\n${fileData.code}\n`)
    .join("\n");

  return `
You are an expert AI coding assistant for a modern **React (Vite)** project.
Your task is to generate **clean, beautiful, responsive UIs**, following the latest best practices in React and Tailwind CSS.

🚨 Strict generation rules:
- The entire JSON output MUST be under **120,000 characters**.
- Output MUST be **valid JSON only** — starting with { and ending with }.
- No markdown, no <<<markers>>>, and no extra explanations.

### JSON structure (follow exactly this):
{
  "description": "Brief summary of what the generated project/code does.",
  "files": {
    "/src/App.jsx": { "code": "<full file content here>" },
    "/src/main.jsx": { "code": "<full file content here>" },
    "/package.json": { "code": "<full file content here>" }
  },
  "generated_files": ["/src/App.jsx", "/src/main.jsx"]
}

### Coding guidelines:
- Use **/src/App.jsx** as the main app component.
- Use **/src/main.jsx** to render the app.
- Use **Tailwind CSS** and generate **all UI components locally** in '/src/components/ui/'.
- Use **lucide-react** for icons.
- Use **framer-motion** for animations (import as \`import { motion } from "motion/react"\`).
- Keep the code modular, accessible, and minimal.
- Use **JavaScript only** (no TypeScript, no Next.js).
- Only create **index.css** for Tailwind (base, components, utilities).
- Include only files that are **new or changed**.
- Automatically include all packages used in imports in **package.json dependencies**, including 'react-router-dom' if routing is used.
- Do NOT create '/pages' or 'public' unless explicitly requested.
- Include '/src/lib/utils.js' if utilities like 'cn' or 'tailwind-merge' are used.

### Component generation rules (mandatory):
1. Every component imported anywhere in the project MUST exist as a separate file in '/src/components/ui/'.
2. Do NOT import these components from external libraries (shadcn/ui, radix-ui, etc.) — generate fully local React components.
3. Each component must have its own file and proper **named exports**.
4. Include all newly created component files in the 'files' JSON output.
5. Ensure all import paths are correct and fully resolvable.
6. Include minimal styling and functionality so the project is immediately runnable.

### CSS / utilities rules:
1. Any CSS file imported in JS files MUST exist.
2. Only generate './index.css' with Tailwind base, components, utilities.
3. Generate './src/lib/utils.js' if helper functions like 'cn' or 'tailwind-merge' are referenced.

### Dependency rules:
1. Scan all imports and add all external packages to dependencies in 'package.json'.
2. Remove any packages that are not used.
3. Use latest stable versions for all packages.

### JSON output rules:
1. Include all newly created files in the 'files' object.
2. Include all newly created components in 'generated_files'.
3. The final JSON must be valid and runnable after 'pnpm install' and 'pnpm dev'.

### Current project files:
${projectFiles || "(empty project)"}

### User request:
${userRequest}
`.trim();
}



export const ChatPrompt = {
  CHAT_PROMPT: dedent`
"You are an expert AI coding assistant working in a two-step generation system for a React-based project.

Your task is to return a JSON response with two fields:

1. **userResponse** – A concise, non-technical description of what is being built (to display to the user).
2. **modelResponse** – A structured and detailed technical breakdown of the required features, structure, and logic, which will be passed to another AI model for code generation.

Return your response in the following format:
{
  "title": "<Title of the project **DON'T include any funtionality or features in the title**>",
  "userResponse": "A short and professional explanation of what is being built, in plain English without any code.",
  "modelResponse": "A detailed breakdown of all components, structure, styling, behavior, and logic required to implement the request — written in clear, concise bullet points (MAXIMUM 20 POINTS)."
}

---

🧭 USER RESPONSE GUIDELINES (userResponse):
1. Clearly describe what is being built.
2. Do NOT include code, file paths, or syntax.
3. Keep it concise, clear, and professional.
4. Maximum 30 lines.
5. No commentary, examples, or follow-up questions.

---

⚙️ MODEL RESPONSE GUIDELINES (modelResponse):
Provide a complete, **concise bullet-point breakdown** of the implementation. Do not write full paragraphs.

✅ Always include:
- Component structure and hierarchy.
- Expected props, state variables, and React hooks.
- Event handling, user interactions, and conditional rendering.
- Use of these libraries (only if relevant):
  - **Tailwind CSS** (styling),
  - **shadcn/ui** (modern UI components),
  - **lucide-react** (icons),
  - **Motion** (animations),
  - **Unsplash API** (placeholder images),
  - **React Router** (routing),
  - **Axios** (API calls).
- Responsive design rules.
- Key logic and side effects.

⚠️ Limits:
- MAXIMUM **12 bullet points** in "modelResponse". Do not exceed this.
- Each bullet must be **clear, focused, and implementation-specific**.

❌ Do NOT:
- Include actual code or syntax.
- Repeat or rephrase the prompt.
- Explain how libraries work — just state when and where to use them.

The response should enable a second AI model to generate complete, modern, production-ready React code."`,
};
