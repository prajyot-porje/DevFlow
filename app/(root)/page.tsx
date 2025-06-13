"use client";

import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Code,
  Eye,
  Star,
  Users,
  Palette,
  Download,
  Github,
  Twitter,
  Linkedin,
  Shield,
  Rocket,
  TrendingUp,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MessageContext } from "@/context/MessageContext";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GetUserDetails } from "@/hooks/GetUserDetails";

export default function LandingPage() {

  const [userInput, setuserInput] = useState("");
  const {setMessages } = useContext(MessageContext);
  const  userDetails = GetUserDetails();
  const {user} = useUser();
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);

  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();

  const OnGenerate = async (input: string) => {
    if (!user?.id) {
      router.push("/sign-in");
      return;
    }
    if (!userDetails || !userDetails._id) {
      alert("User details not loaded. Please try again in a moment.");
      return;
    }
    const msg = { 
      role: "user", 
      content: input 
    };
    setIsTyping(true);
    setMessages(msg);

    const workspaceID = await CreateWorkspace({
      user: userDetails._id,
      message: msg,
    });
    console.log("Workspace created with ID:", workspaceID);
    router.push(`/chat/${workspaceID}`);

    setTimeout(() => {
      setIsTyping(false);
      setuserInput(""); 
    }, 1500);
  }

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
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

  const testimonials = [
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

  

  const quickPrompts = [
    "Create a modern landing page with hero section",
    "Build a dashboard with analytics charts",
    "Design an e-commerce product grid",
    "Make a contact form with validation",
    "Create a pricing table component",
    "Build a testimonials carousel",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">DevFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm hover:text-primary transition-colors"
            >
              How it Works
            </a>
            <a
              href="#testimonials"
              className="text-sm hover:text-primary transition-colors"
            >
              Reviews
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => router.push("/chat")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Build Beautiful UIs
              <br />
              <span className="text-foreground">with AI Magic</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into production-ready React components in
              seconds. No more starting from scratch.
            </p>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>10K+ Developers</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span>1M+ Components Generated</span>
              </div>
            </div>
          </div>

      {/* Interactive Chat Section */}
          <div className="max-w-4xl mx-auto mt-24">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5" />
              <CardContent className="p-8">
                <div className="flex gap-8">
                  {/* Chat Input */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="flex justify-center items-center flex-col text-center  mb-2">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                          
                          Try it
                          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            {" "}
                            right now
                          </span>
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                          Describe what you want to build and watch the magic
                          happen
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center min-h-[200px]">
                      <div className="relative ">
                        <Textarea
                          placeholder="e.g., Create a modern pricing card with gradient background, hover effects, and a call-to-action button..."
                          value={userInput}
                          onChange={(e) => setuserInput(e.target.value)}
                          className="h-28 w-[700px] resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              OnGenerate(userInput);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          className="absolute right-2 bottom-2 h-8 w-8 p-0"
                          onClick={()=>OnGenerate(userInput)}
                          disabled={!userInput.trim() || isTyping}
                        >
                          {isTyping ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {isTyping && (
                        <div className="flex items-center mt-4 gap-2 text-sm text-muted-foreground animate-in slide-in-from-bottom-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                          <span>AI is thinking... Redirecting to app...</span>
                        </div>
                      )}

                      <div className="space-y-2 mt-5 flex flex-col">
                        <p className="text-sm text-muted-foreground pl-12">
                          Quick examples:
                        </p>
                        <div className="flex flex-wrap gap-2 pl-12">
                          {quickPrompts.slice(0, 3).map((prompt, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs hover:scale-105 transition-transform"
                              onClick={() => {
                                setuserInput(prompt);
                                alert(prompt); // <-- see if this fires
                              }}
                            >
                              {prompt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {" "}
                build faster
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to accelerate your development workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer ${
                  activeFeature === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5" />
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm font-mono">
                    {feature.demo}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Rocket,
                title: "Lightning Fast",
                desc: "Generate components in seconds",
              },
              {
                icon: Shield,
                title: "Production Ready",
                desc: "Clean, optimized code output",
              },
              {
                icon: Palette,
                title: "Customizable",
                desc: "Match your design system",
              },
              {
                icon: TrendingUp,
                title: "Always Learning",
                desc: "AI improves with every use",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to amazing results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Describe Your Idea",
                description:
                  "Tell our AI what you want to build in natural language",
                icon: Sparkles,
              },
              {
                step: "02",
                title: "AI Generates Code",
                description:
                  "Watch as your idea transforms into beautiful, functional code",
                icon: Code,
              },
              {
                step: "03",
                title: "Export & Deploy",
                description:
                  "Download your code or deploy directly to production",
                icon: Download,
              },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 opacity-30" />
                )}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <item.icon className="w-8 h-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* exmple section */}
      <section id="try-now" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div
            className={`mt-16 transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-3xl" />
              <Card className="relative bg-card/50 backdrop-blur-sm border-2">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        AI is generating...
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-left">
                        <p className="text-sm font-mono">
                          Create a modern pricing card with gradient background
                          and hover effects
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-lg p-6 border">
                      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        <CardHeader>
                          <CardTitle>Pro Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-2">$19/mo</div>
                          <Button variant="secondary" className="w-full">
                            Get Started
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Loved by developers
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {" "}
                worldwide
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community is saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {testimonial.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={testimonial.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl">DevFlow</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Building the future of web development with AI-powered code
                generation.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Templates
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Tutorials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; 2024 CodeCraft AI. All rights reserved. Built with ❤️ for
              developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
