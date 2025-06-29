# DevFlow

DevFlow is an AI-powered code generation platform for building, editing, and previewing full-stack React (Vite) projects. It features a modern workspace, project templates, collaborative coding, and a real-time backend powered by Convex. Instantly generate production-ready code with Tailwind CSS, shadcn/ui, and more. DevFlow uses WebContainers to run and preview projects directly in your browser.

---

## Features

- ✨ AI-powered code generation (Gemini API) for React (Vite) projects
- 🗂️ Project templates (Todo App, Notes App, Expense Tracker, Gallery, etc.)
- 💻 Live code editor with file explorer and instant preview (powered by WebContainers)
- 🎨 Tailwind CSS and shadcn/ui integration for modern UI
- 👥 User authentication with Clerk
- ☁️ Real-time backend and project storage with Convex
- 📦 Download generated projects as a ZIP
- 🌙 Light/dark theme support

---

## File Structure

```
.
├── app/                # Next.js app directory (routes, pages, API)
├── components/         # UI and custom components (editor, loaders, sidebar, etc.)
│   ├── custom/
│   └── ui/
├── configs/            # AI model and configuration files
├── context/            # React context providers
├── convex/             # Convex backend functions and schema
├── data/               # Project templates, static data, and types
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and authentication logic
├── public/             # Static assets
├── services/           # WebContainer and backend services
├── .env.local          # Environment variables (not committed)
├── .gitignore
├── components.json
├── eslint.config.mjs
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
└── ... (other config/build files)
```

---

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/your-username/devflow.git
cd devflow
```

### 2. Install dependencies

```sh
npm install
# or
yarn
# or
pnpm install
```

### 3. Set up environment variables

Copy the example environment file and fill in your own keys:

```sh
cp .env.local.example .env.local
```

Edit `.env.local` with your API keys and URLs (see below for details).

### 4. Start Convex (required for backend)

In a separate terminal, run:

```sh
npx convex dev
```

### 5. Run the development server

```sh
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use DevFlow.

---

## Example Environment File

Create a `.env.local.example` file like this:

```env
// Gemini API (for AI code generation)
GEMINI_API_KEY=your_gemini_api_key

// Clerk (authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

// Convex (real-time backend)
CONVEX_DEPLOYMENT=your_convex_deployment
CONVEX_DEPLOYMENT_KEY=your_convex_deployment_key
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud
```

---

## Deployment

The easiest way to deploy your Next.js app is with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---


