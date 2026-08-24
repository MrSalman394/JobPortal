import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  Cpu,
  Lock,
  Layers,
  Compass,
  Check,
  ChevronRight,
  Award,
  BarChart3,
  Flame,
  Globe,
  Radio,
  Fingerprint,
  Code2,
  Terminal,
  Activity,
  Maximize2,
  Sliders,
  DollarSign,
  Share2,
  Rocket,
  ShieldCheck,
  RefreshCw,
  Eye,
  MousePointerClick
} from "lucide-react";
import type { Review } from "@shared/schema";
import dashboardImage from "@assets/images/modern_job_portal_dashboard_interface.png";
import successImage from "@assets/images/business_success_celebration_moment.png";
import teamImage from "@assets/images/diverse_professionals_collaborating.png";
import hanzlaPic from "@assets/images/hanzla.png";
import mariamPic from "@assets/images/mariam.png";
import safiaPic from "@assets/images/safia.png";
import salmanPic from "@assets/images/salman.png";

// --- 3D PARTICLE & ROTATING GEOMETRIC MATRIX CANVAS ---
function Cyber3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 3D Particles
    const count = Math.min(width > 768 ? 85 : 40, 110);
    interface Point3D {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      color: string;
      size: number;
    }

    const palette = ["#00f5d4", "#00bbf9", "#7b2cbf", "#f72585", "#4361ee"];
    const points: Point3D[] = [];

    for (let i = 0; i < count; i++) {
      points.push({
        x: (Math.random() - 0.5) * width * 1.8,
        y: (Math.random() - 0.5) * height * 1.8,
        z: Math.random() * 900 + 50,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        vz: (Math.random() - 0.5) * 0.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: Math.random() * 2.5 + 1,
      });
    }

    // 3D Polyhedron Crystal (Icosahedron vertices)
    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;

    const phi = (1 + Math.sqrt(5)) / 2;
    const baseIcosahedron = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ].map(v => ({ x: v[0] * 130, y: v[1] * 130, z: v[2] * 130 }));

    const fov = 440;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      angleX += 0.003;
      angleY += 0.005;
      angleZ += 0.002;

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Rotating 3D Crystal Centerpiece
      const rotIcosa = baseIcosahedron.map(v => {
        let x1 = v.x * Math.cos(angleY) - v.z * Math.sin(angleY);
        let z1 = v.x * Math.sin(angleY) + v.z * Math.cos(angleY);
        let y2 = v.y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = v.y * Math.sin(angleX) + z1 * Math.cos(angleX);
        let x3 = x1 * Math.cos(angleZ) - y2 * Math.sin(angleZ);
        let y3 = x1 * Math.sin(angleZ) + y2 * Math.cos(angleZ);

        const depth = z2 + 550;
        const scale = fov / depth;
        return {
          px: centerX + x3 * scale + (mouse.x - centerX) * 0.08,
          py: centerY + y3 * scale + (mouse.y - centerY) * 0.08 - 40,
          scale,
        };
      });

      // Draw Crystal Wireframe Edges
      ctx.strokeStyle = "rgba(0, 245, 212, 0.18)";
      ctx.lineWidth = 1.3;
      for (let i = 0; i < rotIcosa.length; i++) {
        for (let j = i + 1; j < rotIcosa.length; j++) {
          const dx = rotIcosa[i].px - rotIcosa[j].px;
          const dy = rotIcosa[i].py - rotIcosa[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(rotIcosa[i].px, rotIcosa[i].py);
            ctx.lineTo(rotIcosa[j].px, rotIcosa[j].py);
            ctx.stroke();
          }
        }
      }

      // Draw Crystal Vertices
      rotIcosa.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.px, node.py, 3.5 * node.scale, 0, Math.PI * 2);
        ctx.fillStyle = "#00f5d4";
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#00f5d4";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Particle Constellation
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.y < -height) p.y = height;
        if (p.y > height) p.y = -height;
        if (p.z < 40) p.z = 900;
        if (p.z > 900) p.z = 40;

        const scale = fov / (fov + p.z);
        const px = centerX + (p.x + (mouse.x - centerX) * 0.25) * scale;
        const py = centerY + (p.y + (mouse.y - centerY) * 0.25) * scale;

        ctx.beginPath();
        ctx.arc(px, py, p.size * scale * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, scale * 1.5);
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby points
        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dz = p.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 170) {
            const scale2 = fov / (fov + p2.z);
            const px2 = centerX + (p2.x + (mouse.x - centerX) * 0.25) * scale2;
            const py2 = centerY + (p2.y + (mouse.y - centerY) * 0.25) * scale2;

            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px2, py2);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 170) * 0.22 * scale;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-70 dark:opacity-90"
    />
  );
}

// --- 3D TILT CONTAINER WITH MULTI-DEPTH PARALLAX ---
function TiltCard3D({
  children,
  className = "",
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  glare?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -14;
    const rotY = ((x - centerX) / centerX) * 14;

    setRotate({ x: rotX, y: rotY });
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.22,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div style={{ perspective: "1200px" }} className="w-full h-full">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(0px)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.12s cubic-bezier(0.2, 0, 0, 1)",
        }}
        className={`relative w-full h-full rounded-3xl ${className}`}
      >
        {children}

        {glare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300 z-30"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.6) 0%, transparent 65%)`,
            }}
          />
        )}
      </div>
    </div>
  );
}

// --- ANIMATED 3D KINETIC TEXT FLIPPER ---
function TextWordCycler() {
  const words = ["Intelligent", "Autonomous", "3D-Engineered", "Next-Generation", "Instantaneous"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative h-[1.15em] min-w-[280px] sm:min-w-[340px] overflow-hidden align-top">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 50, opacity: 0, rotateX: -60 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -50, opacity: 0, rotateX: 60 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="absolute inset-x-0 font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-primary to-indigo-600 dark:from-cyan-400 dark:via-teal-300 dark:via-primary dark:to-accent drop-shadow-[0_0_35px_rgba(0,245,212,0.3)]"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// --- HOLOGRAPHIC 3D AI MATCH SIMULATOR ---
function HolographicMatchSimulator() {
  const [activePreset, setActivePreset] = useState(0);

  const presets = [
    {
      title: "Senior Full Stack Architect",
      company: "Quantum Scale Labs",
      salary: "$165k – $210k • Remote",
      score: 99.4,
      matchGrade: "Top 0.5% Match",
      tags: ["React 19", "Node / Express", "PostgreSQL", "System Design", "AWS"],
      metrics: { latency: "140ms", accuracy: "99.8%", verification: "2FA Certified" },
    },
    {
      title: "AI & Neural Systems Lead",
      company: "Synthetix Intelligence",
      salary: "$190k – $250k • Hybrid NYC",
      score: 98.6,
      matchGrade: "Exceptional Fit",
      tags: ["PyTorch", "LLM Agents", "Vector Embeddings", "FastAPI", "CUDA"],
      metrics: { latency: "190ms", accuracy: "99.2%", verification: "2FA Certified" },
    },
    {
      title: "Cybersecurity & DevOps Specialist",
      company: "Aegis Cloud Security",
      salary: "$150k – $195k • Remote",
      score: 97.9,
      matchGrade: "High Probability",
      tags: ["Kubernetes", "Zero-Trust", "Docker", "Terraform", "CI/CD"],
      metrics: { latency: "110ms", accuracy: "98.9%", verification: "2FA Certified" },
    },
  ];

  const current = presets[activePreset];

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl p-1 bg-gradient-to-br from-cyan-400 via-primary to-fuchsia-600 shadow-[0_0_50px_rgba(0,187,249,0.35)]">
      <div className="relative rounded-[22px] bg-slate-950/95 backdrop-blur-2xl border border-white/15 p-6 md:p-8 text-white overflow-hidden">

        {/* Animated Cyber Scanner Beam */}
        <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f5d4] animate-[bounce_3s_infinite]" />

        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
              Neural Match Engine v4.0
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            <Activity className="h-3 w-3 animate-pulse" /> LIVE SIMULATION
          </span>
        </div>

        {/* Preset Selector Chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {presets.map((p, idx) => (
            <button
              key={p.title}
              onClick={() => setActivePreset(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border ${activePreset === idx
                ? "bg-gradient-to-r from-cyan-500 to-primary text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(0,245,212,0.4)]"
                : "bg-white/5 text-white/70 border-white/10 hover:bg-white/15"
                }`}
            >
              {p.title.split(" ")[0]} {p.title.split(" ")[1]}
            </button>
          ))}
        </div>

        {/* Dynamic Holographic Content */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xl md:text-2xl font-black text-white">{current.title}</h4>
              <p className="text-sm text-cyan-200/80 font-semibold flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-cyan-400" />
                {current.company}
              </p>
              <p className="text-sm font-bold text-emerald-400">{current.salary}</p>
            </div>

            {/* Glowing 3D Score Ring */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-400/40 shadow-[0_0_25px_rgba(0,245,212,0.2)] shrink-0">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-white font-mono">
                {current.score}%
              </span>
              <span className="text-[10px] tracking-widest text-emerald-300 font-bold uppercase font-mono">
                {current.matchGrade}
              </span>
            </div>
          </div>

          {/* Parsed Skill Tags */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-white/50 font-mono font-bold">
              Verified Candidate Competencies
            </span>
            <div className="flex flex-wrap gap-2">
              {current.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-white/10 text-cyan-200 border border-white/15 shadow-inner"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Engine Real-time Specs */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Inference</p>
              <p className="text-sm font-black text-white font-mono">{current.metrics.latency}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Precision</p>
              <p className="text-sm font-black text-emerald-400 font-mono">{current.metrics.accuracy}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Security</p>
              <p className="text-sm font-black text-cyan-300 font-mono">{current.metrics.verification}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- INTERACTIVE 3D ROLE HUB COMMAND CENTER ---
function RoleHubNavigator() {
  const [activeRole, setActiveRole] = useState<"candidate" | "employer" | "admin">("candidate");

  const rolesData = {
    candidate: {
      badge: "CANDIDATE INTELLIGENCE",
      title: "Smart Profile & Direct Matching",
      desc: "Construct one comprehensive qualification profile, receive automated match percentages on open roles, and track real-time hiring progress with 2FA security.",
      bullets: [
        "Instant AI skill match percentage for every listed job",
        "Interactive CV & qualification builder with verified badges",
        "1-Click applications with live status stage updates",
      ],
      mockMetric: "98.5% Fit Rating",
      icon: Search,
      accent: "from-cyan-500 to-blue-600",
    },
    employer: {
      badge: "EMPLOYER COMMAND",
      title: "Automated Candidate Sourcing",
      desc: "Publish vacancies in 60 seconds, access pre-screened applicant scores, streamline shortlists, and build employer brand authority with verified reviews.",
      bullets: [
        "Automated ranking of applicants based on requirement score",
        "Company profile branding with verified review reputation",
        "Team-based candidate evaluation and shortlist workflow",
      ],
      mockMetric: "4x Faster Hiring",
      icon: Building2,
      accent: "from-emerald-500 to-teal-600",
    },
    admin: {
      badge: "PLATFORM GOVERNANCE",
      title: "Unified Ecosystem Health",
      desc: "Audit job postings, enforce multi-factor security rules, manage user rights, track real-time analytics, and monitor platform feedback streams.",
      bullets: [
        "Comprehensive user, employer, and job oversight suite",
        "Security audit logs & 2FA recovery governance",
        "Live sentiment analysis and platform feedback moderation",
      ],
      mockMetric: "100% Zero-Trust",
      icon: Shield,
      accent: "from-purple-500 to-fuchsia-600",
    },
  };

  const current = rolesData[activeRole];
  const Icon = current.icon;

  return (
    <div className="relative rounded-[32px] p-[2px] overflow-hidden group">
      {/* Animated Rotating Laser Glow */}
      <div
        className="absolute inset-[-100%] animate-[spin_8s_linear_infinite]"
        style={{
          background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, #00f5d4 90deg, #7b2cbf 180deg, #f72585 270deg, transparent 360deg)"
        }}
      />

      <div className="relative rounded-[30px] p-8 sm:p-12 bg-slate-950/95 backdrop-blur-3xl border border-white/15">

        {/* 3D Tabs Header */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            {(["candidate", "employer", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeRole === r
                  ? "bg-gradient-to-r from-cyan-400 to-primary text-slate-950 shadow-[0_0_20px_rgba(0,245,212,0.4)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                For {r}s
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Interactive Role Body */}
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold">
              <Icon className="h-4 w-4" /> {current.badge}
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-white">{current.title}</h3>
            <p className="text-base text-white/70 leading-relaxed font-medium">{current.desc}</p>

            <div className="space-y-3 pt-2">
              {current.bullets.map((b) => (
                <div key={b} className="flex items-start gap-3 text-sm font-semibold text-white/90">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Preview Dashboard Window */}
          <div className="lg:col-span-6">
            <TiltCard3D>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                    <span className="text-xs font-mono text-white/40 ml-2">portal-interface.view</span>
                  </div>
                  <Badge className="bg-emerald-400/20 text-emerald-300 border-emerald-400/30 text-[10px] font-mono">
                    {current.mockMetric}
                  </Badge>
                </div>

                <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 aspect-video relative">
                  <img
                    src={activeRole === "candidate" ? successImage : activeRole === "employer" ? dashboardImage : teamImage}
                    alt="Role visual demonstration"
                    className="w-full h-full object-cover opacity-90 transition-all duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Active Workspace
                    </span>
                    <span className="text-xs font-mono text-cyan-300">Live Sync 🟢</span>
                  </div>
                </div>
              </div>
            </TiltCard3D>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STATS COUNTER ---
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    let startTime: number | null = null;
    const duration = 1400;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.round(target * progress));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [target]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

// --- REVIEWS MARQUEE ---
function ReviewsShowcase() {
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-hidden py-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="min-w-[320px] border-border/60 bg-card/70 animate-pulse">
            <CardContent className="h-40 p-6" />
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-dashed border-border/70 bg-card/60">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Be the first to leave a review!</h3>
            <p className="max-w-xl text-sm text-muted-foreground">
              Community feedback and employee ratings appear here automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayReviews = [...reviews, ...reviews, ...reviews];

  return (
    <div className="relative overflow-hidden py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="landing-marquee flex gap-6 whitespace-nowrap">
        {displayReviews.map((review, index) => (
          <TiltCard3D key={`${review.id}-${index}`} className="inline-block min-w-[320px] max-w-[380px] whitespace-normal">
            <Card className="h-full border-border/60 bg-card/90 shadow-xl backdrop-blur-xl hover:border-primary/50 transition-colors">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={`h-4 w-4 ${starIndex < review.rating ? "fill-current" : "text-border"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {review.userRole || "Verified"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground italic font-medium">
                  "{review.feedback}"
                </p>
                <div className="border-t border-border/60 pt-3 flex items-center justify-between">
                  <p className="font-bold text-sm text-foreground">
                    {review.userName || "Verified User"}
                  </p>
                  <span className="text-[10px] text-muted-foreground font-mono">JobConnect Member</span>
                </div>
              </CardContent>
            </Card>
          </TiltCard3D>
        ))}
      </div>
    </div>
  );
}

// --- MAIN 3D LANDING COMPONENT ---
export default function Landing() {
  const [, setLocation] = useLocation();

  const { data: statsData } = useQuery<{
    activeJobs: number;
    topCompanies: number;
    jobSeekers: number;
    successfulHires: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const stats = statsData ?? {
    activeJobs: 12,
    topCompanies: 8,
    jobSeekers: 45,
    successfulHires: 18,
  };

  const platformStats = [
    { label: "Active Job Openings", value: stats.activeJobs, suffix: "+", icon: Briefcase, color: "from-cyan-400 to-blue-600" },
    { label: "Verified Employers", value: stats.topCompanies, suffix: "+", icon: Building2, color: "from-emerald-400 to-teal-600" },
    { label: "Elite Candidates", value: stats.jobSeekers, suffix: "+", icon: Users, color: "from-purple-400 to-fuchsia-600" },
    { label: "Successful Placements", value: stats.successfulHires, suffix: "+", icon: Award, color: "from-amber-400 to-orange-600" },
  ];

  const bentoItems = [
    {
      title: "Real-Time AI Resume Radar",
      desc: "Instant breakdown of candidate qualifications matched against tech openings with deep percentage precision.",
      icon: Cpu,
      span: "md:col-span-8",
      accent: "from-cyan-500/20 via-primary/10 to-transparent",
      badge: "Neural AI",
    },
    {
      title: "Biometric 2FA Security Vault",
      desc: "Enterprise-grade TOTP protection with single-use emergency backup recovery codes and zero-trust verification.",
      icon: Fingerprint,
      span: "md:col-span-4",
      accent: "from-purple-500/20 via-indigo-500/10 to-transparent",
      badge: "Zero-Trust",
    },
    {
      title: "Live Global Talent Radar",
      desc: "Interactive talent heatmap tracking engineering roles across San Francisco, London, Tokyo, Berlin, and remote hubs.",
      icon: Globe,
      span: "md:col-span-4",
      accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
      badge: "Worldwide",
    },
    {
      title: "Dynamic Compensation Engine",
      desc: "Transparent salary, equity, and bonus compensation analytics tailored to role seniority and location.",
      icon: DollarSign,
      span: "md:col-span-8",
      accent: "from-amber-500/20 via-orange-500/10 to-transparent",
      badge: "Market Intel",
    },
  ];

  const teamMembers = [
    {
      name: "Salman Khan",
      role: "Software Engineering Student",
      note: "University of Wah Engineering College",
      contact: "+92 321 6230206",
      email: "isalman.consult@gmail.com",
      image: salmanPic,
      tag: "Lead Developer",
      accent: "text-cyan-400",
    },
    {
      name: "Safia Batool",
      role: "Software Engineering Student",
      note: "University of Wah Engineering College",
      contact: "+92 313 5729534",
      email: "uw-23-sw-bs-024@wecue.edu.pk",
      image: safiaPic,
      tag: "Core Engineer",
      accent: "text-rose-400",
    },
    {
      name: "Mariam Zaman",
      role: "Software Engineering Student",
      note: "University of Wah Engineering College",
      contact: "+92 307 7600549",
      email: "uw-23-sw-bs-049@wecue.edu.pk",
      image: mariamPic,
      tag: "UI/UX Systems",
      accent: "text-amber-400",
    },
    {
      name: "Hanzla Shehzad",
      role: "Software Engineering Student",
      note: "University of Wah Engineering College",
      contact: "+92 306 9302388",
      email: "uw-23-sw-bs-031@wecue.edu.pk",
      image: hanzlaPic,
      tag: "Backend & Cloud",
      accent: "text-emerald-400",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <style>{`
        @keyframes landing-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.1); }
        }
        @keyframes cyber-grid {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .landing-marquee {
          animation: landing-marquee 32s linear infinite;
        }
        .landing-marquee:hover {
          animation-play-state: paused;
        }
        .cyber-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(0, 245, 212, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 245, 212, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: cyber-grid 20s linear infinite;
        }
      `}</style>

      <Navbar />

      {/* --- HERO SECTION: 3D CYBERNETIC UNIVERSE --- */}
      <section className="relative min-h-[96vh] flex items-center justify-center pt-24 pb-16 overflow-hidden cyber-grid-pattern">
        {/* Interactive 3D Canvas with Rotating Icosahedron & Starfield */}
        <Cyber3DCanvas />

        {/* Ambient Neon Auras */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-cyan-500/20 blur-[140px] animate-[pulse-glow_7s_infinite]" />
        <div className="pointer-events-none absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-fuchsia-500/20 blur-[150px] animate-[pulse-glow_7s_infinite]" style={{ animationDelay: "3.5s" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Hero Pitch */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-6 space-y-8 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 dark:border-cyan-400/40 bg-primary/10 dark:bg-cyan-400/10 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-primary dark:text-cyan-300 shadow-[0_0_20px_rgba(0,245,212,0.15)]">
                <Sparkles className="h-3.5 w-3.5 text-primary dark:text-cyan-400 animate-spin" style={{ animationDuration: "5s" }} />
                Next-Gen Hiring Architecture
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-foreground">
                Hiring, Engineered to be{" "}
                <TextWordCycler />
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                Eliminate hiring friction. Instant AI qualification matching, zero-trust 2FA security, and unified command centers for candidates, employers, and administrators.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Button
                  size="lg"
                  onClick={() => setLocation("/register")}
                  className="h-14 px-8 rounded-full bg-gradient-to-r from-cyan-400 via-primary to-accent text-slate-950 font-black text-base shadow-[0_0_30px_rgba(0,245,212,0.4)] hover:scale-105 transition-all"
                >
                  <Rocket className="mr-2 h-5 w-5 fill-current" />
                  Launch Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/login")}
                  className="h-14 px-8 rounded-full border-border/80 dark:border-white/20 bg-card/60 backdrop-blur-xl font-bold text-base hover:bg-muted/80 transition-all"
                >
                  Sign In to Portal
                </Button>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/50 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary dark:text-cyan-400 text-xs font-mono font-bold">
                    <Fingerprint className="h-4 w-4" /> 2FA SECURED
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">Google Authenticator Ready</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                    <Cpu className="h-4 w-4" /> AI FIT RADAR
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">Precision Match Scoring</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-xs font-mono font-bold">
                    <Globe className="h-4 w-4" /> UNIFIED HUB
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">Seekers • Hiring • Admins</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Holographic AI Live Match Engine */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-6 relative"
            >
              <TiltCard3D>
                <HolographicMatchSimulator />
              </TiltCard3D>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- 3D FLOATING STATS HUB --- */}
      <section className="relative z-10 -mt-6 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {platformStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <TiltCard3D key={stat.label}>
                  <Card className="h-full border-border/60 bg-card/85 backdrop-blur-2xl shadow-xl hover:border-primary/50 transition-all">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-slate-950 font-bold shadow-[0_0_20px_rgba(0,187,249,0.3)] shrink-0`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-black text-foreground font-mono">
                          <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                        </p>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                          {stat.label}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TiltCard3D>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- 3D BENTO GRID MATRIX --- */}
      <section className="py-24 relative overflow-hidden bg-muted/20 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-primary font-bold">
              <Layers className="h-3.5 w-3.5" /> High-Performance Architecture
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              Everything You Need to Hire & Get Hired
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-medium">
              Explore the four core pillars powering modern recruitment with unmatched speed and security.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {bentoItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`${item.span}`}>
                  <TiltCard3D>
                    <Card className={`h-full border-border/60 bg-gradient-to-br ${item.accent} bg-card/85 backdrop-blur-2xl shadow-xl p-8 flex flex-col justify-between overflow-hidden relative group`}>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="p-3 rounded-2xl bg-background/80 border border-border text-primary shadow-sm group-hover:scale-110 transition-transform">
                            <Icon className="h-6 w-6" />
                          </div>
                          <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
                            {item.badge}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black text-foreground">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </TiltCard3D>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE 3D ROLE HUB --- */}
      <section id="roles" className="py-24 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 dark:border-cyan-400/40 bg-primary/10 dark:bg-cyan-400/10 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-primary dark:text-cyan-300 font-bold">
              <MousePointerClick className="h-3.5 w-3.5 text-primary dark:text-cyan-400" /> Interactive Command Center
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              One Unified Portal. Three Focus Modes.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Select a workspace below to preview customized workflows in action.
            </p>
          </div>

          <RoleHubNavigator />
        </div>
      </section>

      {/* --- HOW IT WORKS TIMELINE --- */}
      <section id="workflow" className="py-24 relative overflow-hidden bg-muted/20 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 dark:border-cyan-500/30 bg-primary/10 dark:bg-cyan-500/10 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-primary dark:text-cyan-400 font-bold">
              <Compass className="h-3.5 w-3.5" /> Rapid Workflow
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              From Signup to Hired in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Build Your 2FA Profile",
                desc: "Register in 30 seconds, activate Google Authenticator 2FA, and configure your verified qualification portfolio.",
                icon: Fingerprint,
              },
              {
                step: "02",
                title: "AI Skill Match & Publishing",
                desc: "Our neural matching algorithm pairs candidates with verified openings using real-time compatibility scores.",
                icon: Cpu,
              },
              {
                step: "03",
                title: "1-Click Apply & Shortlist",
                desc: "Apply instantly, monitor live interview statuses, build employer shortlists, and leave verified reviews.",
                icon: Award,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <TiltCard3D key={step.step}>
                  <Card className="h-full border-border/60 bg-card/85 backdrop-blur-2xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 text-6xl font-black text-muted/20 font-mono select-none">
                      {step.step}
                    </div>
                    <CardContent className="p-8 space-y-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
                    </CardContent>
                  </Card>
                </TiltCard3D>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- COMMUNITY REVIEWS MARQUEE --- */}
      <section id="reviews" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            <Star className="h-3.5 w-3.5 fill-current" /> Verified Community Voices
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground">Loved by Candidates & Employers</h2>
        </div>

        <ReviewsShowcase />
      </section>

      {/* --- 3D TEAM SHOWCASE --- */}
      <section id="team" className="py-24 relative overflow-hidden border-t border-border/50 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-primary font-bold">
              <Users className="h-3.5 w-3.5" /> Project Architects
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              Meet the Engineering Team
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              University of Wah Engineering College • Department of Software Engineering
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <TiltCard3D key={member.email}>
                <Card className="h-full border-border/60 bg-card/85 backdrop-blur-2xl shadow-xl overflow-hidden group">
                  <div className="aspect-square overflow-hidden relative bg-muted">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-slate-950/80 text-cyan-300 backdrop-blur border border-cyan-400/30 text-[10px] font-mono">
                        {member.tag}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <div>
                      <h4 className="text-lg font-black text-foreground">{member.name}</h4>
                      <p className={`text-xs font-bold ${member.accent}`}>{member.role}</p>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{member.note}</p>
                    <div className="pt-2 border-t border-border/50 flex flex-col gap-1.5 text-xs text-muted-foreground">
                      <a href={`mailto:${member.email}`} className="hover:text-primary transition-colors truncate flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" /> {member.email}
                      </a>
                      <a href={`tel:${member.contact.replace(/\s+/g, "")}`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0" /> {member.contact}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </TiltCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* --- ICONIC 3D QUANTUM PORTAL CTA --- */}
      <section className="py-28 relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <TiltCard3D className="overflow-visible">
            {/* Animated Laser Border Beam wrapper */}
            <div className="relative rounded-[32px] p-[2px] overflow-hidden group">
              {/* Rotating Laser Border Light */}
              <div
                className="absolute inset-[-100%] animate-[spin_6s_linear_infinite]"
                style={{
                  background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, #00f5d4 60deg, #00bbf9 120deg, #7b2cbf 180deg, #f72585 240deg, transparent 300deg)"
                }}
              />

              {/* Main Card Surface */}
              <div className="relative rounded-[30px] p-8 sm:p-16 lg:p-20 bg-slate-950/95 backdrop-blur-3xl border border-white/10 text-center overflow-hidden shadow-[0_0_80px_rgba(0,245,212,0.25)]">

                {/* Hyperdrive Particle Glows */}
                <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] animate-pulse" />
                <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />

                {/* Ambient Cyber Grid Overlay */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "radial-gradient(circle at center, rgba(0,245,212,0.25) 0%, transparent 70%), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "100% 100%, 32px 32px, 32px 32px"
                  }}
                />

                {/* Floating Holographic Parallax Badges (Left & Right) */}
                <div className="hidden lg:block pointer-events-none absolute top-12 left-10 transform -rotate-3 transition-transform duration-500 group-hover:translate-y-[-6px]">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_20px_rgba(0,245,212,0.2)] backdrop-blur-md">
                    <Zap className="h-3.5 w-3.5 text-cyan-400 animate-bounce" /> 60-Second Setup
                  </div>
                </div>

                <div className="hidden lg:block pointer-events-none absolute top-12 right-10 transform rotate-3 transition-transform duration-500 group-hover:translate-y-[-6px]">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-purple-400/30 text-purple-300 text-xs font-mono font-bold shadow-[0_0_20px_rgba(123,44,191,0.2)] backdrop-blur-md">
                    <Fingerprint className="h-3.5 w-3.5 text-purple-400" /> 2FA Zero-Trust
                  </div>
                </div>

                <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
                  {/* Eyebrow Pill */}
                  <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-400/50 bg-cyan-400/10 px-5 py-2 text-xs font-mono uppercase tracking-[0.25em] text-cyan-300 font-black shadow-[0_0_25px_rgba(0,245,212,0.3)]">
                    <Flame className="h-4 w-4 text-cyan-400 animate-pulse" />
                    Launch Your Journey
                  </div>

                  {/* Main Cinematic Heading */}
                  <div className="space-y-4">
                    <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.04]">
                      Ready to Experience{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 via-primary to-fuchsia-400 drop-shadow-[0_0_40px_rgba(0,245,212,0.5)]">
                        Next-Level
                      </span>{" "}
                      Hiring?
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-cyan-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
                      Join hundreds of ambitious candidates and high-growth organizations on JobConnect. Setup takes less than 60 seconds.
                    </p>
                  </div>

                  {/* High-Impact Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4">
                    <Button
                      size="lg"
                      onClick={() => setLocation("/register")}
                      className="relative h-15 px-10 rounded-full bg-gradient-to-r from-cyan-400 via-primary to-accent text-slate-950 font-black text-lg shadow-[0_0_40px_rgba(0,245,212,0.6)] hover:shadow-[0_0_60px_rgba(0,245,212,0.8)] hover:scale-105 transition-all duration-300 group/btn overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Rocket className="h-5 w-5 fill-current" />
                        Create Your Free Account
                        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </span>
                      {/* Button Specular Shine Sweep */}
                      <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setLocation("/give-feedback")}
                      className="h-15 px-9 rounded-full border-white/25 bg-white/5 text-white font-bold text-base hover:bg-white/15 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(0,245,212,0.2)] transition-all backdrop-blur-xl"
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-cyan-300" />
                      Leave Platform Feedback
                    </Button>
                  </div>

                  {/* Social Proof & Live Metrics Footer inside Card */}
                  <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-cyan-200/70">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-white font-bold">1,240+ Professionals Active Now</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                      <span className="text-white font-bold ml-1.5">4.9/5 Average User Rating</span>
                    </div>
                    <div className="text-cyan-400 font-bold">
                      ✓ Instant Free Access
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </TiltCard3D>
        </div>
      </section>

      {/* --- MODERN FOOTER --- */}
      <footer className="border-t border-border/60 bg-background/90 backdrop-blur py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
            <span>JobConnect Portal</span>
          </div>
          <p>© {new Date().getFullYear()} JobConnect Inc. Engineered by Salman Khan, Safia Batool, Mariam Zaman & Hanzla Shehzad.</p>
        </div>
      </footer>
    </div>
  );
}
