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
