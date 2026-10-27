import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Code2,
  FileCode,
  Braces,
  Atom,
  Wind,
  Server,
  Terminal,
  Database,
  CircuitBoard,
  Flame,
  GitBranch,
  Github,
  Container,
  Palette,
  Layout,
  Wrench,
  Search,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Cpu,
  ArrowRight,
} from "lucide-react";
import Lenis from "lenis";
import * as THREE from "three";
import { motion, useScroll, useSpring, useInView } from "motion/react";
import project001 from "@/assets/project-001.jpg";
import project002 from "@/assets/project-002.jpg";
import project003 from "@/assets/project-003.jpg";
import project004 from "@/assets/project-004.jpg";
import project004Sync from "@/assets/project-004-syncwork.svg";
import projectLexicon from "@/assets/project-lexicon.png";
import profilePhoto from "@/assets/pavithran.jpeg";
import skillPython from "@/assets/skills/python.svg";
import skillC from "@/assets/skills/c.svg";
import skillMySQL from "@/assets/skills/mysql.svg";
import skillGit from "@/assets/skills/git.svg";
import skillGitHub from "@/assets/skills/github.svg";
import skillJava from "@/assets/skills/java.svg";
import skillTensorFlow from "@/assets/skills/tensorflow.svg";
import skillNumPy from "@/assets/skills/numpy.svg";
import skillPandas from "@/assets/skills/pandas.svg";
import skillOpenCV from "@/assets/skills/opencv.svg";
import skillGoogleColab from "@/assets/skills/googlecolab.svg";
import skillFastAPI from "@/assets/skills/fastapi.svg";
import skillMachineLearning from "@/assets/skills/machine-learning.svg";
import skillMediaPipe from "@/assets/skills/mediapipe.svg";
import skillUiPath from "@/assets/skills/uipath.svg";
import skillN8n from "@/assets/skills/n8n.svg";
import { SEO } from "@/components/SEO";
import { MotionSection, MotionItem, StaggerContainer } from "@/components/MotionSection";
import { staggerChildVariants } from "@/lib/motion-variants";
import { ScrollTimeline } from "@/components/ScrollTimeline";
import ActivitySection from "@/components/github/ActivitySection";
import { THEMES } from "@/types/theme";

// External scripts loaded via script tags
declare const gsap: {
  registerPlugin: (...plugins: unknown[]) => void;
  timeline: (options?: unknown) => {
    to: (...args: unknown[]) => unknown;
    call: (...args: unknown[]) => unknown;
  };
  to: (target: unknown, vars: unknown) => unknown;
  from: (target: unknown, vars: unknown) => unknown;
};
declare const ScrollTrigger: {
  getAll: () => Array<{ kill: () => void }>;
  refresh: () => void;
  create: (options: unknown) => unknown;
  update: () => void;
};
declare const ScrollToPlugin: unknown;
declare const TextPlugin: unknown;

const SECTION_BG_COLORS = [
  { section: "#home", color: "hsl(var(--bg-void))" },
  { section: "#about", color: "hsl(var(--bg-deep))" },
  { section: "#skills", color: "hsl(var(--bg-void))" },
  { section: "#projects", color: "hsl(var(--bg-surface))" },
  { section: "#experience", color: "hsl(var(--bg-void))" },
  { section: "#activity", color: "hsl(var(--bg-void))" },
  { section: ".achievements-section", color: "hsl(var(--bg-deep))" },
  { section: "#education", color: "hsl(var(--bg-void))" },
  { section: "#contact", color: "hsl(var(--bg-surface))" },
];

const NAV_LINKS = ["home", "about", "skills", "projects", "experience", "education", "contact"];

const SKILL_LOGOS: Record<string, { src: string; alt: string; className?: string }> = {
  Python: { src: skillPython, alt: "Python logo" },
  C: { src: skillC, alt: "C logo" },
  Java: { src: skillJava, alt: "Java logo" },
  "SQL (MySQL)": { src: skillMySQL, alt: "MySQL logo" },
  "Machine Learning": { src: skillMachineLearning, alt: "Machine Learning logo" },
  TensorFlow: { src: skillTensorFlow, alt: "TensorFlow logo" },
  MediaPipe: { src: skillMediaPipe, alt: "MediaPipe logo" },
  NumPy: { src: skillNumPy, alt: "NumPy logo" },
  Pandas: { src: skillPandas, alt: "Pandas logo" },
  "Computer Vision": { src: skillOpenCV, alt: "OpenCV logo" },
  UiPath: { src: skillUiPath, alt: "UiPath logo" },
  n8n: { src: skillN8n, alt: "n8n logo" },
  "Google Colab": { src: skillGoogleColab, alt: "Google Colab logo" },
  FastAPI: { src: skillFastAPI, alt: "FastAPI logo" },
  Git: { src: skillGit, alt: "Git logo" },
  GitHub: { src: skillGitHub, alt: "GitHub logo" },
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LANGUAGES: Terminal,
  FRAMEWORKS: Braces,
  "AI & ML": Atom,
  AUTOMATION: Wind,
  TOOLS: Wrench,
};

const CATEGORY_BADGES: Record<string, string> = {
  LANGUAGES: ">_",
  FRAMEWORKS: "{}",
  "AI & ML": "AI",
  AUTOMATION: "⚡",
  TOOLS: "</>",
};

const CATEGORY_ORDER = ["LANGUAGES", "FRAMEWORKS", "AI & ML", "AUTOMATION", "TOOLS"];

const SKILLS = [
  { name: "Python", category: "LANGUAGES", level: 90, status: "OPERATIONAL" },
  { name: "C", category: "LANGUAGES", level: 80, status: "OPERATIONAL" },
  { name: "Java", category: "LANGUAGES", level: 78, status: "ADVANCED" },
  { name: "SQL (MySQL)", category: "LANGUAGES", level: 75, status: "ADVANCED" },
  { name: "FastAPI", category: "FRAMEWORKS", level: 78, status: "ADVANCED" },
  { name: "Machine Learning", category: "AI & ML", level: 88, status: "OPERATIONAL" },
  { name: "Computer Vision", category: "AI & ML", level: 82, status: "ADVANCED" },
  { name: "TensorFlow", category: "AI & ML", level: 80, status: "OPERATIONAL" },
  { name: "MediaPipe", category: "AI & ML", level: 75, status: "ADVANCED" },
  { name: "NumPy", category: "AI & ML", level: 85, status: "OPERATIONAL" },
  { name: "Pandas", category: "AI & ML", level: 83, status: "OPERATIONAL" },
  { name: "UiPath", category: "AUTOMATION", level: 78, status: "ADVANCED" },
  { name: "n8n", category: "AUTOMATION", level: 72, status: "ADVANCED" },
  { name: "Git", category: "TOOLS", level: 85, status: "OPERATIONAL" },
  { name: "GitHub", category: "TOOLS", level: 88, status: "OPERATIONAL" },
  { name: "Google Colab", category: "TOOLS", level: 80, status: "OPERATIONAL" },
];

const SKILLS_BY_CATEGORY = CATEGORY_ORDER.map((cat) => ({
  category: cat,
  skills: SKILLS.filter((s) => s.category === cat),
}));

const PROJECTS = [
  {
    id: "001",
    title: "Lexicon AI — Agentic Hybrid RAG Engine",
    category: "AI & ML",
    desc: "Agentic Hybrid RAG Engine with Cross-Encoder Reranking, Dynamic Fallbacks, and Real-Time Query Streaming.",
    longDesc: `An enterprise-grade, agentic Retrieval-Augmented Generation (RAG) platform powered by FastAPI, LangGraph, and Google Gemini 2.5 Flash.

Key Architectural Capabilities:
• Hybrid Retrieval Pipeline: Combines dense semantic vector search (Qdrant) with sparse keyword retrieval (BM25) via Reciprocal Rank Fusion (RRF).
• Cross-Encoder Reranking: Implements a cross-encoder model to re-score candidate chunks for maximum context precision.
• Agentic Query Routing: Dynamically evaluates query complexity using LangGraph state machines, delegating between direct synthesis and multi-hop retrieval.
• Real-time SSE Streaming: Delivers chunked tokens over Server-Sent Events with low latency.`,
    tech: ["Python", "FastAPI", "LangGraph", "Qdrant", "Gemini 2.5 Flash", "React", "TypeScript", "Tailwind CSS"],
    image: projectLexicon,
    demo: "https://lexicon-ai.preview.pavithraninfo.dev",
    source: "https://github.com/Pavithran030/lexicon-ai",
  },
  {
    id: "002",
    title: "Real-Time Face Recognition Attendance System",
    category: "AI & ML",
    desc: "AI-driven automated attendance tracking using OpenCV, MediaPipe, and deep learning facial embeddings.",
    longDesc: `Automated facial recognition system designed for institutional classrooms and enterprise logging.

• Utilizes MediaPipe facial landmark detectors and OpenCV pipelines for 60fps real-time camera tracking.
• Implements anti-spoofing liveness verification to prevent photo and replay attacks.
• Automatically synchronizes attendance timestamps to MySQL with instant analytics reporting.`,
    tech: ["Python", "OpenCV", "MediaPipe", "TensorFlow", "MySQL", "Tkinter"],
    image: project001,
    demo: "",
    source: "https://github.com/Pavithran030/Face-Recognition-Attendance-System",
  },
  {
    id: "003",
    title: "Automated Invoice Processing & RPA Workflow",
    category: "AUTOMATION",
    desc: "UiPath & Python end-to-end automation extracting structured data from unstructured PDF invoices into ERP.",
    longDesc: `Intelligent Document Processing (IDP) and Robotic Process Automation workflow.

• Parses thousands of multi-format vendor invoices using OCR and regex pattern extractors.
• Validates line-item calculations, tax rates, and purchase order matches with 99.4% accuracy.
• Automatically logs verified entries into ERP systems with exception queues for human review.`,
    tech: ["UiPath", "Python", "OCR", "Excel VBA", "n8n"],
    image: project002,
    demo: "",
    source: "https://github.com/Pavithran030/RPA-Invoice-Automation",
  },
  {
    id: "004",
    title: "Bilingual AI Chatbot & Knowledge Assistant",
    category: "AI & ML",
    desc: "Context-aware conversational agent supporting dual languages with custom fine-tuned NLP embeddings.",
    longDesc: `Conversational AI system built to assist regional users in English and Tamil.

• Integrates transformer-based sequence models fine-tuned on localized domain knowledge.
• Features speech-to-text input processing and interactive voice synthesis.
• Built with FastAPI backend and reactive client interface.`,
    tech: ["Python", "FastAPI", "Transformers", "NLP", "React"],
    image: project003,
    demo: "",
    source: "https://github.com/Pavithran030/Bilingual-AI-Assistant",
  },
  {
    id: "005",
    title: "SyncWork — Collaborative Agile Suite",
    category: "WEB APPS",
    desc: "Full-stack project management and sprint tracking system with automated status workflows.",
    longDesc: `Comprehensive team collaboration suite featuring real-time task boards, sprint burndown metrics, and automated milestone triggers.

• Full-stack architecture with secure JWT authentication and role-based access control.
• Interactive Kanban boards with drag-and-drop mechanics and instant WebSocket updates.`,
    tech: ["TypeScript", "React", "Node.js", "Express", "Tailwind CSS", "MySQL"],
    image: project004,
    demo: "",
    source: "https://github.com/Pavithran030/syncwork-suite",
  },
];

const ACHIEVEMENTS_STATS = [
  { value: 200, suffix: "+", label: "LeetCode Solved" },
  { value: 3, suffix: "+", label: "Internships Completed" },
  { value: 12, suffix: "", label: "Verified Credentials" },
  { value: 5, suffix: "+", label: "AI & ML Projects" },
];

const ACHIEVEMENT_CARDS = [
  {
    icon: "fa-solid fa-cloud",
    title: "Redis Associate Cloud Operator",
    desc: "Earned the globally recognized Redis Associate Cloud Operator certification, validating expertise in deploying, managing, and operating Redis Cloud infrastructure for scalable, high-availability distributed systems.",
    issuer: "Redis",
    date: "September 17, 2026",
    credentialId: "194406109",
    credentialUrl: "https://university.redis.com/certificates/",
    imageUrl: "/certificates/Redis_Associate_Cloud_Operator.png",
    pdfUrl: "",
  },
  {
    icon: "fa-solid fa-trophy",
    title: "Redis Certified Associate Developer",
    desc: "Earned the official Redis Certified Associate Developer credential, demonstrating mastery of in-memory data structures, caching architectures, and high-performance streaming pipelines.",
    issuer: "Redis",
    date: "March 2026",
    credentialId: "REDIS-ASSOC-2026",
    credentialUrl: "https://university.redis.com/certificates/",
    imageUrl: "/certificates/Redis_Associate_Developer.png",
    pdfUrl: "",
  },
  {
    icon: "fa-solid fa-award",
    title: "Oracle Cloud Infrastructure 2025 Certified Generative AI Professional",
    desc: "Earned the Oracle Certified Generative AI Professional credential, proving expertise in Large Language Models (LLMs), prompt engineering, RAG systems, and AI agent frameworks.",
    issuer: "Oracle",
    date: "August 2025",
    credentialId: "102118432OCI25GAIOCP",
    credentialUrl: "https://mylearn.oracle.com/",
    imageUrl: "/certificates/Oracle_Agentic_AI.jpg",
    pdfUrl: "/certificates/pdf/Oracle_Agentic_AI.pdf",
  },
  {
    icon: "fa-solid fa-certificate",
    title: "Oracle AI Foundation Associate",
    desc: "Earned the Oracle Certified AI Foundation Associate — a globally recognized certification in AI fundamentals, machine learning models, and deep learning workflows.",
    issuer: "Oracle",
    date: "July 31, 2025",
    credentialId: "102118432OCI25AICFA",
    credentialUrl: "https://mylearn.oracle.com/",
    imageUrl: "/certificates/Oracle_AI_Foundation.jpg",
    pdfUrl: "/certificates/pdf/Oracle_AI_Foundation.pdf",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "NPTEL Elite — Practical Cyber Security",
    desc: "Completed the 12-week NPTEL Online Certification on 'Practical Cyber Security for Cyber Security Practitioners' conducted by IIT Kanpur.",
    issuer: "NPTEL (IIT Kanpur)",
    date: "Jul-Oct 2025",
    credentialId: "NPTEL25CS120S670400929",
    credentialUrl: "https://nptel.ac.in/",
    imageUrl: "/certificates/Practical Cyber Security for Cyber Security Practitioners.jpg",
    pdfUrl: "/certificates/pdf/Practical Cyber Security for Cyber Security Practitioners (1).pdf",
  },
  {
    icon: "fa-solid fa-code",
    title: "NPTEL Elite — The Joy of Computing using Python",
    desc: "Earned Elite certification in 'The Joy of Computing using Python' by IIT Madras, demonstrating proficiency in algorithmic problem solving, data structures, and Python programming.",
    issuer: "NPTEL (IIT Madras)",
    date: "Jul-Oct 2024",
    credentialId: "NPTEL24CS79S352200441",
    credentialUrl: "https://nptel.ac.in/",
    imageUrl: "/certificates/The_Joy_of Computing_using Python.jpg",
    pdfUrl: "/certificates/pdf/The Joy of Computing using Python.pdf",
  },
  {
    icon: "fa-solid fa-lightbulb",
    title: "NPTEL — Understanding Incubation & Entrepreneurship",
    desc: "Completed the specialized NPTEL certification on Incubation and Entrepreneurship, mastering business model validation, startup incubation, IP strategies, and venture creation.",
    issuer: "NPTEL",
    date: "Jan-Apr 2025",
    credentialId: "NPTEL25GE15S652200192",
    credentialUrl: "https://nptel.ac.in/",
    imageUrl: "/certificates/Understanding Incubation and Entrepreneurship.jpg",
    pdfUrl: "/certificates/pdf/Understanding Incubation and Entrepreneurship.pdf",
  },
  {
    icon: "fa-solid fa-medal",
    title: "TCS CodeVita Season 13 Global Rank",
    desc: "Secured a global rank of 1491 in TCS CodeVita Season 13, showcasing top-tier competitive programming and algorithmic problem solving.",
    issuer: "Tata Consultancy Services",
    date: "2025",
    credentialId: "1491 (Global Rank)",
    credentialUrl: "https://www.tcs.com/",
    imageUrl: "/certificates/TCS_CodeVita_Season13.jpg",
    pdfUrl: "/certificates/pdf/TCS_CodeVita_Season13_pavithran030 (1).pdf",
  },
  {
    icon: "fa-solid fa-star",
    title: "Level 1 — TN Skills 2025",
    desc: "Participated and qualified in Level 1 - TN Skills Competition in Software Application Development conducted by Tamil Nadu Skill Development Corporation (TNSDC).",
    issuer: "TN-Skills",
    date: "2025",
    credentialId: "TN-SKILLS-2025-L1",
    credentialUrl: "https://www.tnskills.tn.gov.in/",
    imageUrl: "/certificates/TN_Skill_Level_1.jpg",
    pdfUrl: "/certificates/pdf/TN_Skill_Level_1.pdf",
  },
  {
    icon: "fa-solid fa-chart-line",
    title: "Level 2 — TN Skills 2025",
    desc: "Qualified for and completed Level 2 in TN Skills Competition 2025 in Software Application Development, proving advanced engineering and architectural skills.",
    issuer: "TN-Skills",
    date: "2025",
    credentialId: "TN-SKILLS-2025-L2",
    credentialUrl: "https://www.tnskills.tn.gov.in/",
    imageUrl: "/certificates/TN_Skills_Level-2.jpg",
    pdfUrl: "/certificates/pdf/TN_Skills_Level-2.pdf",
  },
];

const EXPERIENCE = [
  {
    date: "Jun 2026 – Present",
    role: "Software Developer (Freelance)",
    company: "Mecandria IT Service and Solutions LLP",
    bullets: [
      "Developing and deploying enterprise-level production applications for client customer operations, currently active and live in production",
      "Architecting end-to-end full-stack solutions, containerized deployment workflows, and performance optimization for mission-critical client systems",
    ],
    statusText: "CURRENT",
  },
  {
    date: "Feb 2026 – Apr 2026",
    role: "Software Development with AI & ML",
    company: "Mecandria IT Service and Solutions",
    bullets: [
      "Completed hands-on engineering in Artificial Intelligence, Machine Learning, and Full-Stack Development",
      "Gained practical experience in containerized application deployment on remote Linux servers with secure SSL hosting and firewall policies",
    ],
    statusText: "COMPLETED",
  },
  {
    date: "Aug 2025 – Sep 2025",
    role: "AI Engineer Intern",
    company: "ResDev Global Solution, Certainti.ai",
    bullets: [
      "Built and evaluated predictive machine learning models using Python, TensorFlow, and Scikit-learn",
      "Engineered automated feature extraction and data preprocessing pipelines on high-dimensional datasets",
    ],
    statusText: "COMPLETED",
  },
  {
    date: "Apr 2025 – Jun 2025",
    role: "AIML Virtual Intern",
    company: "Eduskill & Google for Developers",
    bullets: [
      "Architected an AI-assisted interview automation system for organizational candidate assessment",
      "Developed high-throughput FastAPI REST endpoints and interactive workflow orchestration",
    ],
    statusText: "COMPLETED",
  },
];

const EDUCATION = [
  {
    initial: "K",
    degree: "B.E. CSE(AI & ML)",
    institution: "K.S. Rangasamy College of Technology, Tiruchengode",
    year: "2023 — 2027",
    gpa: "CGPA: 8.95 (upto 6th sem)",
    status: "pursuing",
    tags: ["Machine Learning", "Deep Learning", "Computer Vision", "NLP"],
  },
  {
    initial: "S",
    degree: "HSC (Higher Secondary)",
    institution: "Sengunthar Matriculation Hr. Sec. School, Tharamangalam",
    year: "2021 — 2023",
    gpa: "90%",
    status: "completed",
    tags: ["Physics", "Chemistry", "Mathematics", "Computer Science"],
  },
  {
    initial: "S",
    degree: "SSLC (Secondary)",
    institution: "Sengunthar Matriculation Hr. Sec. School, Tharamangalam",
    year: "2021",
    gpa: "100%",
    status: "completed",
    tags: ["Science", "Mathematics", "English", "Tamil"],
  },
];

const SOCIAL_ICONS = [
  { icon: "fa-brands fa-github", url: "https://github.com/Pavithran030", tooltip: "GitHub" },
  { icon: "fa-brands fa-linkedin", url: "https://www.linkedin.com/in/pavithran030", tooltip: "LinkedIn" },
  { icon: "fa-solid fa-code", url: "https://codolio.com/profile/Pavithran030", tooltip: "Codolio" },
];

const NAVBAR_HEIGHT = 72;

type VantaEffectInstance = {
  destroy?: () => void;
  resize?: () => void;
  setOptions?: (options: Record<string, unknown>) => void;
};

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1400;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      setValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, target]);

  return (
    <div ref={ref}>
      {value}
      {suffix}
    </div>
  );
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return <motion.div className="scroll-progress-bar" style={{ scaleX, transformOrigin: "0%" }} />;
}

export default function Index() {
  const [loaded, setLoaded] = useState(false);
  const [diamondOpen, setDiamondOpen] = useState(false);
  const [revealGone, setRevealGone] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
  );

  // Horizontal Projects Pinned Scroll Engine (Normal mouse scroll moves projects horizontally on desktop until end)
  const projectsContainerRef = useRef<HTMLDivElement>(null);
  const projectsScrollRef = useRef<HTMLDivElement>(null);

  // Contact & feedback
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Popups
  const [popupProject, setPopupProject] = useState<(typeof PROJECTS)[0] | null>(null);
  const [popupCertificate, setPopupCertificate] = useState<(typeof ACHIEVEMENT_CARDS)[0] | null>(null);

  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  // Mobile-only flag: project cards slide in from alternating sides on small screens.
  // Desktop is untouched - it keeps the GSAP pinned horizontal scroll.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const loaderBarRef = useRef<HTMLDivElement>(null);
  const loaderTextRef = useRef<HTMLSpanElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const heroVantaHostRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<VantaEffectInstance | null>(null);

  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const scrollLockYRef = useRef(0);

  // Sync initial theme to cyber-emerald
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "cyber-emerald");
  }, []);

  // Copy Email Handler
  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText("techpavithran18@gmail.com");
    setCopiedEmail(true);
    toast.success("Email copied: techpavithran18@gmail.com");
    setTimeout(() => setCopiedEmail(false), 2500);
  }, []);

  // ===== HERO BACKGROUND — VANTA DOTS =====
  useEffect(() => {
    const host = heroVantaHostRef.current;
    if (!host) return;

    let cancelled = false;

    const initVanta = async () => {
      (window as unknown as { THREE?: unknown }).THREE = THREE;
      const mod = await import("vanta/src/vanta.dots.js");
      if (cancelled) return;

      const DOTS = mod.default as (opts: Record<string, unknown>) => VantaEffectInstance;
      vantaRef.current?.destroy?.();
      vantaRef.current = DOTS({
        el: host,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x10b981,
        backgroundColor: 0x080c14,
        size: 2.5,
        spacing: 24.0,
        showLines: false,
      });

      const dots = vantaRef.current as unknown as {
        camera?: {
          position?: { y: number; z: number };
          ty?: number;
          tz?: number;
          lookAt?: (x: number, y: number, z: number) => void;
        };
        resize?: () => void;
      };

      if (dots.camera?.position) {
        dots.camera.position.y = 340;
        dots.camera.position.z = 150;
        dots.camera.ty = 220;
        dots.camera.tz = 220;
        dots.camera.lookAt?.(0, 0, 0);
      }
      dots.resize?.();
    };

    void initVanta();

    return () => {
      cancelled = true;
      vantaRef.current?.destroy?.();
      vantaRef.current = null;
    };
  }, []);

  // ===== LOADER SEQUENCE =====
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin);

    const tl = gsap.timeline();
    tl.to({}, { duration: 0.5 })
      .to(loaderTextRef.current, { duration: 0.8, text: "INITIALIZING PORTFOLIO ENGINE...", ease: "none" }, 0.6)
      .call(
        () => {
          if (loaderBarRef.current) loaderBarRef.current.style.width = "100%";
        },
        [],
        1.4,
      )
      .to("#loader > *", { opacity: 0, duration: 0.3 }, 2.1)
      .call(
        () => {
          setLoaded(true);
          setTimeout(() => setDiamondOpen(true), 50);
          setTimeout(() => setRevealGone(true), 1200);
        },
        [],
        2.4,
      );
  }, []);

  // ===== LENIS SMOOTH SCROLL =====
  useEffect(() => {
    if (!loaded || !revealGone) return;
    // Lenis's lerp-based easing is built for desktop wheel input. Applied to
    // touch, it makes content "catch up" to the finger with a delay instead
    // of tracking it 1:1 — the OS's native inertial touch scroll is already
    // smoother than any JS approximation, so skip Lenis on mobile entirely
    // and let native scrolling (and the "scroll" event ScrollTrigger/nav
    // tracking already listen for) handle it.
    if (window.innerWidth <= 768) return;

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [loaded, revealGone]);

  // ===== APPLE-STYLE FLUID CURSOR FOLLOW & INTERACTIVE HOVER =====
  useEffect(() => {
    if (!loaded || !revealGone || window.innerWidth <= 768) return;

    const ring = cursorRingRef.current;
    const dot = cursorDotRef.current;
    if (!ring || !dot) return;

    let hasMoved = false;
    let isHovering = false;
    let isTextHover = false;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!hasMoved) {
        // Snap straight to the first real pointer position instead of
        // lerping in all the way from the (0,0) default.
        hasMoved = true;
        ringPos.current = { x: e.clientX, y: e.clientY };
        dotPos.current = { x: e.clientX, y: e.clientY };
        ring.classList.add("visible");
        dot.classList.add("visible");
      }
      if (cursorRingRef.current?.classList.contains("hidden")) {
        cursorRingRef.current.classList.remove("hidden");
        cursorDotRef.current?.classList.remove("hidden");
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactiveEl = target.closest(
        "a, button, [role='button'], input, textarea, select, .project-card, .project-visual, .achievement-card, .skill-card, .skill-card-item, .nav-link, .nav-btn, .timeline-card, .timeline-dot, .filter-chip, .badge, .project-links a, .project-links button, [data-interactive='true'], [onclick], .copy-btn, .btn, .social-pill, .back-to-top, .popup-close, .portfolio-modal-close, .mobile-menu-close, .hamburger"
      );

      const textEl = target.closest("input[type='text'], input[type='email'], textarea");

      if (textEl) {
        isTextHover = true;
        isHovering = false;
        ring.classList.add("text-hover");
        dot.classList.add("text-hover");
        ring.classList.remove("hovering");
        dot.classList.remove("hovering");
      } else if (interactiveEl) {
        isHovering = true;
        isTextHover = false;
        ring.classList.add("hovering");
        dot.classList.add("hovering");
        ring.classList.remove("text-hover");
        dot.classList.remove("text-hover");
      } else {
        if (isHovering || isTextHover) {
          isHovering = false;
          isTextHover = false;
          ring.classList.remove("hovering", "text-hover");
          dot.classList.remove("hovering", "text-hover");
        }
      }
    };

    const onMouseDown = () => {
      ring.classList.add("clicking");
      dot.classList.add("clicking");
    };
    const onMouseUp = () => {
      ring.classList.remove("clicking");
      dot.classList.remove("clicking");
    };

    // Fade out when the pointer leaves the viewport so the cursor doesn't
    // linger stuck at the last known edge position.
    const onDocMouseLeave = () => {
      ring.classList.remove("visible");
      dot.classList.remove("visible");
    };
    const onDocMouseEnter = () => {
      if (hasMoved) {
        ring.classList.add("visible");
        dot.classList.add("visible");
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onDocMouseLeave);
    document.addEventListener("mouseenter", onDocMouseEnter);

    let rafId: number;
    const tick = () => {
      // Dot: fast, tight follow.
      dotPos.current.x += (mousePos.current.x - dotPos.current.x) * 0.5;
      dotPos.current.y += (mousePos.current.y - dotPos.current.y) * 0.5;
      // Ring: slower trailing follow.
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;

      dot.style.left = `${dotPos.current.x}px`;
      dot.style.top = `${dotPos.current.y}px`;
      ring.style.left = `${ringPos.current.x}px`;
      ring.style.top = `${ringPos.current.y}px`;

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onDocMouseLeave);
      document.removeEventListener("mouseenter", onDocMouseEnter);
      document.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, [loaded, revealGone]);

  // ===== LOCK BACKGROUND SCROLL WHILE A POPUP / MENU IS OPEN =====
  useEffect(() => {
    const isOverlayOpen = mobileMenuOpen || !!popupProject || !!popupCertificate;
    if (isOverlayOpen) {
      const y = window.scrollY;
      scrollLockYRef.current = y;
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      lenisRef.current?.stop();
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollLockYRef.current);
      lenisRef.current?.start();
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
    };
  }, [mobileMenuOpen, popupProject, popupCertificate]);

  // ===== SCROLL LISTENER FOR NAVBAR & ACTIVE SECTION =====
  useEffect(() => {
    const bgLayer = document.querySelector(".bg-transition-layer") as HTMLElement | null;

    const onScroll = () => {
      const y = window.scrollY;
      setNavScrolled(y > 40);
      setShowBackTop(y > 360);

      // Section Background Color Mapping
      if (bgLayer) {
        for (let i = SECTION_BG_COLORS.length - 1; i >= 0; i--) {
          const item = SECTION_BG_COLORS[i];
          const el = document.querySelector(item.section) as HTMLElement | null;
          if (el) {
            const top = el.getBoundingClientRect().top + y;
            if (top <= y + window.innerHeight * 0.45) {
              bgLayer.style.backgroundColor = item.color;
              break;
            }
          }
        }
      }

      // Check if user has reached bottom of document (activates contact)
      const isBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 70;
      if (isBottom) {
        setActiveNav("contact");
        return;
      }

      // Check if user is at top of document (activates home)
      if (y < 100) {
        setActiveNav("home");
        return;
      }

      // Accurate active section detection using exact getBoundingClientRect offsets
      const scrollPos = y + NAVBAR_HEIGHT + 80;
      for (let i = NAV_LINKS.length - 1; i >= 0; i--) {
        const id = NAV_LINKS[i];
        const sec = document.getElementById(id);
        if (sec) {
          const top = sec.getBoundingClientRect().top + y;
          if (top <= scrollPos) {
            setActiveNav(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.2 });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToSection = useCallback((id: string, smooth = true) => {
    const section = document.getElementById(id);
    if (!section) return;
    setActiveNav(id);
    const offset = id === "home" ? 0 : NAVBAR_HEIGHT + 12;
    const top = Math.max(section.getBoundingClientRect().top + window.scrollY - offset, 0);
    window.history.replaceState(null, "", id === "home" ? window.location.pathname : `#${id}`);
    if (lenisRef.current && smooth) {
      lenisRef.current.scrollTo(top, { duration: 1.2 });
    } else {
      window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
    }
    setMobileMenuOpen(false);
  }, []);

  // Hash Navigation Handler on first load
  useEffect(() => {
    if (!loaded || !revealGone) return;
    const hash = window.location.hash.replace("#", "");
    if (hash && NAV_LINKS.includes(hash)) {
      setTimeout(() => {
        scrollToSection(hash, true);
      }, 200);
    }
  }, [loaded, revealGone, scrollToSection]);

  // ===== PROJECTS HORIZONTAL SCROLL (desktop only) =====
  useEffect(() => {
    if (!loaded || !revealGone) return;

    let ctx: gsap.Context | null = null;

    const setupProjectsScroll = () => {
      ctx?.revert();

      // ---- PROJECTS HORIZONTAL SCROLL (desktop only) ----
      const isMobile = window.innerWidth <= 768;
      const projectsTrack = document.querySelector(".projects-track") as HTMLElement | null;
      const projectsSection = document.getElementById("projects");
      if (projectsTrack && projectsSection && !isMobile) {
        const projectsWrapper = projectsSection.querySelector(".projects-pin-wrapper") as HTMLElement | null;
        if (projectsWrapper) {
          const wrapperStyles = window.getComputedStyle(projectsWrapper);
          const padLeft = parseFloat(wrapperStyles.paddingLeft) || 0;
          const padRight = parseFloat(wrapperStyles.paddingRight) || 0;
          const trackViewportWidth = projectsWrapper.clientWidth - padLeft - padRight;
          const cards = projectsTrack.querySelectorAll<HTMLElement>(".project-card");
          const lastCard = cards[cards.length - 1];
          const byTrackWidth = Math.max(projectsTrack.scrollWidth - trackViewportWidth, 0);
          const byLastCard = lastCard
            ? Math.max(lastCard.offsetLeft + lastCard.offsetWidth - trackViewportWidth, 0)
            : 0;
          const translateDistance = Math.max(byTrackWidth, byLastCard);

          if (translateDistance > 0) {
            ctx = gsap.context(() => {
              gsap.to(projectsTrack, {
                x: -translateDistance,
                ease: "none",
                scrollTrigger: {
                  trigger: projectsSection,
                  start: "top top",
                  end: () => `+=${translateDistance}`,
                  scrub: true,
                  pin: true,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                },
              });
            }, projectsSection);

            (ScrollTrigger as unknown as { refresh?: () => void }).refresh?.();
          }
        }
      } else if (projectsTrack) {
        gsap.set(projectsTrack, { clearProps: "all" });
      }

      ScrollTrigger.refresh();
    };

    const timer = setTimeout(setupProjectsScroll, 150);

    const onResize = () => {
      setupProjectsScroll();
    };

    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      ctx?.revert();
    };
  }, [loaded, revealGone]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to send the email.");
      }

      setFormSent(true);
      form.reset();
      toast.success("Message sent successfully! I will get back to you soon.");
      setTimeout(() => setFormSent(false), 5000);
    } catch (err: unknown) {
      console.error("Failed to send email:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to send message. Please try again.";
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Pavithran G | Backend Developer & AI Engineer Portfolio"
        description="Portfolio of Pavithran G, an AI & ML engineer specializing in Agentic RAG, computer vision, automation workflows, and full-stack AI development."
        path="/"
        keywords={[
          "Pavithran G",
          "AI ML developer portfolio",
          "machine learning engineer",
          "Agentic RAG",
          "computer vision developer",
          "automation workflows",
          "Python developer",
          "TensorFlow portfolio",
          "React TypeScript",
        ]}
        type="website"
      />

      {/* LOADER */}
      <div id="loader" className={loaded ? "hidden" : ""}>
        <div className="loader-scanline" />
        <svg className="loader-logo" viewBox="0 0 60 60">
          <polygon points="30,2 58,30 30,58 2,30" fill="none" stroke="hsl(var(--accent-ice))" strokeWidth="2" />
          <polygon
            points="30,12 48,30 30,48 12,30"
            fill="none"
            stroke="hsl(var(--accent-mint))"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </svg>
        <div className="loader-text">
          <span ref={loaderTextRef}></span>
        </div>
        <div className="loader-progress">
          <div className="loader-progress-bar" ref={loaderBarRef}></div>
        </div>
      </div>

      {/* DIAMOND REVEAL */}
      {!revealGone && (
        <div className={`diamond-overlay ${diamondOpen ? "open" : ""}`}>
          <div className="diamond-glow"></div>
        </div>
      )}

      {/* CURSORS */}
      {loaded && revealGone && (
        <>
          <div className="cursor-ring" ref={cursorRingRef}></div>
          <div className="cursor-dot" ref={cursorDotRef}></div>
        </>
      )}

      {/* BACKGROUND TRANSITION LAYER */}
      <div className="bg-transition-layer"></div>

      {/* FOG */}
      <div className="fog-overlay">
        <div className="fog-blob"></div>
        <div className="fog-blob"></div>
      </div>

      {/* NAVBAR */}
      <nav className={`navbar ${navScrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <ul className="nav-links-minimal">
            {NAV_LINKS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={activeNav === id ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(id);
                  }}
                >
                  {id}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-right-actions">
            <div
              className={`hamburger ${mobileMenuOpen ? "open" : ""}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              role="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setMobileMenuOpen(!mobileMenuOpen);
                }
              }}
            >
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </nav>

      {/* SCROLL PROGRESS */}
      {loaded && revealGone && navScrolled && <ScrollProgressBar />}

      {/* MOBILE MENU DRAWER */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)}>
        <div className="mobile-menu-inner" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="mobile-menu-close"
            aria-label="Close mobile menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span></span>
            <span></span>
          </button>

          <div className="mobile-menu-nav-list" role="menu" aria-label="Mobile navigation">
            {NAV_LINKS.map((id, i) => (
              <a
                key={id}
                href={`#${id}`}
                className={`mobile-menu-link ${activeNav === id ? "active" : ""}`}
                role="menuitem"
                style={{ transitionDelay: mobileMenuOpen ? `${i * 0.04 + 0.1}s` : "0s" }}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(id);
                }}
              >
                <span className="mobile-link-text">{id}</span>
                <span className="text-xs opacity-50 font-mono">0{i + 1}</span>
              </a>
            ))}
          </div>

          <div className="mobile-menu-footer">
            <div className="mobile-menu-socials">
              {SOCIAL_ICONS.map((s) => (
                <a
                  key={s.tooltip}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.tooltip}
                  className="mobile-social-icon"
                >
                  <i className={s.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PROJECT POPUP */}
      {popupProject && (
        <div className="project-popup-overlay" onClick={() => setPopupProject(null)}>
          <div className="project-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setPopupProject(null)} aria-label="Close modal">
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img src={popupProject.image} alt={popupProject.title} className="popup-image" />
            <div className="popup-body">
              <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 inline-block">
                {popupProject.category}
              </span>
              <h3 className="popup-title">{popupProject.title}</h3>
              <div className="popup-desc" style={{ whiteSpace: "pre-wrap" }}>
                {popupProject.longDesc}
              </div>
              <div className="popup-tech">
                {popupProject.tech.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="popup-links">
                {popupProject.demo ? (
                  <a href={popupProject.demo} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    <ExternalLink size={14} className="mr-1.5" /> LIVE DEMO
                  </a>
                ) : (
                  <span className="btn-primary disabled">
                    <ExternalLink size={14} className="mr-1.5" /> LIVE DEMO
                  </span>
                )}

                {popupProject.source ? (
                  <a href={popupProject.source} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                    <Github size={14} className="mr-1.5" /> SOURCE CODE
                  </a>
                ) : (
                  <span className="btn-secondary disabled">
                    <Github size={14} className="mr-1.5" /> SOURCE CODE
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE POPUP */}
      {popupCertificate && (
        <div className="project-popup-overlay" onClick={() => setPopupCertificate(null)}>
          <div className="project-popup certificate-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setPopupCertificate(null)} aria-label="Close modal">
              <i className="fa-solid fa-xmark"></i>
            </button>
            {popupCertificate.imageUrl && (
              <div className="p-4 bg-slate-950/80 rounded-t-3xl flex items-center justify-center">
                <img
                  src={popupCertificate.imageUrl}
                  alt={popupCertificate.title}
                  className="max-h-72 object-contain rounded-xl border border-slate-800 shadow-xl"
                />
              </div>
            )}
            <div className="popup-body">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {popupCertificate.issuer}
                </span>
                <span className="text-xs font-mono text-slate-400">• {popupCertificate.date}</span>
              </div>
              <h3 className="popup-title">{popupCertificate.title}</h3>
              <p className="popup-desc">{popupCertificate.desc}</p>

              <div className="popup-links">
                {popupCertificate.pdfUrl ? (
                  <a href={popupCertificate.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    <ExternalLink size={14} className="mr-1.5" /> VIEW PDF
                  </a>
                ) : popupCertificate.imageUrl ? (
                  <a href={popupCertificate.imageUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    <ExternalLink size={14} className="mr-1.5" /> VIEW FULL IMAGE
                  </a>
                ) : null}
                {popupCertificate.credentialUrl && (
                  <a href={popupCertificate.credentialUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                    <Award size={14} className="mr-1.5" /> VERIFY CREDENTIAL
                  </a>
                )}
                <button onClick={() => setPopupCertificate(null)} className="btn-secondary">
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="content-wrapper">
        {/* ===== HERO ===== */}
        <section id="home" className="hero-section">
          <div id="hero-vanta-bg" ref={heroVantaHostRef} className="hero-vanta-bg" aria-hidden="true"></div>
          <div className="hero-grid-pattern"></div>

          <div className="hero-text">
            <h1 className="hero-name">
              <span className="hero-name-first">PAVITHRAN</span>
              <span className="hero-name-last">
                {"\u00A0"}
                G
              </span>
            </h1>

            <div className="hero-role-tag">
              <span className="hero-role-line"></span>
              <h2 className="hero-role-label">Backend Developer & AI Engineer</h2>
              <span className="hero-role-line"></span>
            </div>

            <p className="hero-description">
              Crafting production-ready AI architectures, Agentic RAG engines, computer vision systems & automation workflows.
              Transforming complex intelligence into elegant, real-world impact.
            </p>

            <div className="hero-buttons">
              <a
                href="#projects"
                className="hero-btn hero-btn--primary"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("projects");
                }}
              >
                <span>Explore Projects</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>

              <a href="/Pavithran_G.pdf" className="hero-btn hero-btn--ghost" download>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>Download CV</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="hero-btn hero-btn--ghost"
                title="Copy Email"
              >
                {copiedEmail ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>{copiedEmail ? "Copied!" : "Copy Email"}</span>
              </button>
            </div>

            <div className="hero-social-row">
              <a
                href="https://github.com/Pavithran030"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hero-social-link"
              >
                <i className="fa-brands fa-github text-lg"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/pavithran030"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hero-social-link"
              >
                <i className="fa-brands fa-linkedin text-lg"></i>
              </a>
              <a
                href="mailto:techpavithran18@gmail.com"
                aria-label="Email"
                className="hero-social-link"
              >
                <i className="fa-solid fa-envelope text-lg"></i>
              </a>
              <a
                href="https://codolio.com/profile/Pavithran030"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Codolio"
                className="hero-social-link"
              >
                <i className="fa-solid fa-code text-lg"></i>
              </a>
            </div>

            <div className="hero-scroll-hint" aria-label="Scroll to explore">
              <span className="hero-scroll-hint-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14" />
                  <path d="m18 13-6 6-6-6" />
                </svg>
              </span>
              <span className="hero-scroll-hint-copy">Scroll to explore</span>
            </div>
          </div>
        </section>

        {/* ===== ABOUT ===== */}
        <MotionSection id="about" className="about-section">
          <span className="section-label">// 01. ABOUT</span>
          <h2 className="section-heading">
            About <span className="accent">Me</span>
          </h2>
          <div className="about-grid">
            <MotionItem className="about-profile-card" delay={0.1}>
              <div className="profile-card-inner">
                <div className="profile-photo-wrapper">
                  <img src={profilePhoto} alt="Pavithran G" className="profile-photo" loading="lazy" />
                  <div className="profile-photo-ring"></div>
                  <div className="profile-photo-dot"></div>
                </div>
                <div className="profile-name-tag">PAVITHRAN G</div>
                <span className="profile-role-badge">Backend Developer & AI Engineer</span>

                <div className="profile-meta-row">
                  <span className="profile-meta-item">
                    <i className="fa-solid fa-location-dot"></i> Tiruchengode, TN
                  </span>
                  <span className="profile-meta-item">
                    <i className="fa-solid fa-graduation-cap"></i> B.E. AI &amp; ML
                  </span>
                </div>

                <div className="profile-status-row">
                  <span className="profile-status-dot"></span>
                  Open for opportunities
                </div>

                <div className="profile-social-links">
                  <a
                    href="https://github.com/Pavithran030"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-social-btn"
                    aria-label="GitHub"
                  >
                    <i className="fa-brands fa-github"></i>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/pavithran030"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-social-btn"
                    aria-label="LinkedIn"
                  >
                    <i className="fa-brands fa-linkedin"></i>
                  </a>
                  <a
                    href="mailto:techpavithran18@gmail.com"
                    className="profile-social-btn"
                    aria-label="Email"
                  >
                    <i className="fa-solid fa-envelope"></i>
                  </a>
                  <a
                    href="https://codolio.com/profile/Pavithran030"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-social-btn"
                    aria-label="Codolio"
                  >
                    <i className="fa-solid fa-code"></i>
                  </a>
                </div>
              </div>
            </MotionItem>

            <MotionItem className="about-text" delay={0.2}>
              <p>
                Motivated AI and Machine Learning undergraduate with hands-on experience in building AI-driven
                applications, automation workflows, and computer vision systems. Skilled in Python, modern deep learning
                frameworks, and end-to-end full-stack AI development.
              </p>
              <p>
                I've interned at <strong>ResDev Global Solution (Certainti.ai)</strong> as an AI Engineer and completed an AIML
                virtual internship with <strong>Google for Developers</strong> through Eduskill. My engineering projects range from
                enterprise RPA pipelines with UiPath to Agentic Hybrid RAG engines and real-time biometric vision systems.
              </p>
              <p>
                Seeking an entry-level AI/ML or software engineering role to apply data-driven problem solving, rigorous
                architectural design, and continuous learning to high-impact challenges.
              </p>

              <div className="about-stats">
                {[
                  { val: 3, suffix: "+", label: "Internships" },
                  { val: 5, suffix: "+", label: "Projects" },
                  { val: 200, suffix: "+", label: "LeetCode" },
                  { val: 11, suffix: "", label: "Certifications" },
                ].map((s) => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-number">
                      <AnimatedCounter target={s.val} suffix={s.suffix} />
                    </div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </MotionItem>
          </div>
        </MotionSection>

        {/* ===== SKILLS ===== */}
        <MotionSection id="skills" className="skills-section">
          <span className="section-label">// 02. TECHNICAL MATRIX</span>
          <h2 className="section-heading">
            Technical <span className="accent">Skills</span>
          </h2>

          <div className="skills-category-showcase">
            {SKILLS_BY_CATEGORY.map((catGroup) => {
              const badgeSymbol = CATEGORY_BADGES[catGroup.category] || ">_";
              return (
                <div className="skills-category-group" key={catGroup.category}>
                  <div className="skills-category-header">
                    <div className="skills-category-title-wrap">
                      <span className="skills-category-badge">{badgeSymbol}</span>
                      <h3 className="skills-category-title">{catGroup.category}</h3>
                    </div>
                    <div className="skills-category-count-wrap">
                      <span className="skills-category-dot-ring">
                        <span className="skills-category-dot-core"></span>
                      </span>
                      <span className="skills-category-count">{catGroup.skills.length} skills</span>
                    </div>
                  </div>

                  <div className="skills-category-cards-grid">
                    {catGroup.skills.map((skill) => {
                      const logo = SKILL_LOGOS[skill.name];
                      return (
                        <div className="skill-card-item" key={skill.name}>
                          <div className="skill-card-icon-container">
                            {logo ? (
                              <img
                                src={logo.src}
                                alt={logo.alt}
                                className="skill-card-icon-img"
                                loading="lazy"
                              />
                            ) : (
                              <Cpu size={24} className="text-amber-400" />
                            )}
                          </div>
                          <span className="skill-card-name">{skill.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </MotionSection>

        {/* ===== PROJECTS ===== */}
        <section id="projects" ref={projectsContainerRef} className="projects-section-pinned">
          <div className="projects-inner-wrap projects-pin-wrapper">
            <div className="projects-header-top">
              <div>
                <span className="section-label">// 03. FEATURED WORK</span>
                <h2 className="section-heading">
                  Featured <span className="accent">Projects</span>
                </h2>
              </div>
              <div className="projects-header-meta">
                <span className="projects-count-badge">
                  <span className="projects-count-dot"></span>
                  {PROJECTS.length} PRODUCTION APPS
                </span>
              </div>
            </div>

            {/* Horizontal Scroll Track on desktop / Clean vertical cards on mobile */}
            <div className="projects-viewport-mask">
              <div
                ref={projectsScrollRef}
                className="projects-horizontal-track projects-track"
              >
                {PROJECTS.map((p, idx) => (
                  <motion.div
                    className="project-card project-card-horizontal"
                    key={p.id}
                    initial={
                      isMobile
                        ? { opacity: 0, x: idx % 2 === 0 ? -80 : 80, scale: 0.94 }
                        : { opacity: 0, y: 32, scale: 0.96 }
                    }
                    whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-40px", amount: 0.15 }}
                    transition={{
                      duration: 0.65,
                      delay: Math.min(idx * 0.08, 0.25),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileTap={{ scale: 0.985 }}
                  >
                    <div className="project-card-glow" />
                    <div className="project-visual" onClick={() => setPopupProject(p)}>
                      <img src={p.image} alt={p.title} className="project-image" loading="lazy" />
                      <div className="project-image-overlay">
                        <i className="fa-solid fa-expand"></i>
                      </div>
                      <div className="project-mission">MISSION-{p.id}</div>
                      <div className="project-cat-badge">{p.category}</div>
                    </div>
                    <div className="project-content">
                      <h3 className="project-title">{p.title}</h3>
                      <p className="project-desc">{p.desc}</p>
                      <div className="project-tech">
                        {p.tech.slice(0, 4).map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                        {p.tech.length > 4 && <span>+{p.tech.length - 4}</span>}
                      </div>
                      <div className="project-links">
                        {p.demo && (
                          <a href={p.demo} target="_blank" rel="noopener noreferrer" className="project-link-demo">
                            <ExternalLink size={13} /> LIVE DEMO
                          </a>
                        )}
                        {p.source ? (
                          <a href={p.source} target="_blank" rel="noopener noreferrer" className="project-link-code">
                            <Code2 size={13} /> SOURCE CODE
                          </a>
                        ) : (
                          <button type="button" onClick={() => setPopupProject(p)} className="project-link-code">
                            <ExternalLink size={13} /> DETAILS
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== EXPERIENCE ===== */}
        <MotionSection id="experience" className="experience-section">
          <span className="section-label">// 04. CAREER TIMELINE</span>
          <h2 className="section-heading">
            Work <span className="accent">Experience</span>
          </h2>
          <ScrollTimeline
            items={EXPERIENCE.map((exp) => ({
              initial: exp.role.charAt(0),
              title: exp.role,
              subtitle: exp.company,
              date: exp.date,
              bullets: exp.bullets,
              badge: exp.statusText,
              badgeVariant:
                exp.statusText === "CURRENT" ||
                  exp.statusText === "PRESENT" ||
                  exp.statusText === "IN PROGRESS"
                  ? ("pursuing" as const)
                  : ("completed" as const),
            }))}
          />
        </MotionSection>

        {/* ===== ACTIVITY ===== */}
        <MotionSection id="activity" className="activity-section">
          <span className="section-label">// CODE & OPEN SOURCE CONTRIBUTIONS</span>
          <h2 className="section-heading">
            <span className="accent">Activity</span>
          </h2>
          <ActivitySection />
        </MotionSection>

        {/* ===== ACHIEVEMENTS & CERTIFICATIONS ===== */}
        <MotionSection className="achievements-section">
          <span className="section-label">// 05. CREDENTIALS & HONORS</span>
          <h2 className="section-heading">
            Verified <span className="accent">Certifications</span>
          </h2>

          <div className="achievements-stats">
            {ACHIEVEMENTS_STATS.map((s, i) => (
              <MotionItem key={i} delay={i * 0.1}>
                <div className="achievement-stat">
                  <div className="achievement-stat-number">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="achievement-stat-label">{s.label}</div>
                </div>
              </MotionItem>
            ))}
          </div>

          <StaggerContainer className="achievement-cards">
            {ACHIEVEMENT_CARDS.map((a, i) => (
              <motion.div
                className="achievement-card"
                key={i}
                variants={staggerChildVariants}
                onClick={() => setPopupCertificate(a)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setPopupCertificate(a);
                  }
                }}
              >
                <i className={a.icon}></i>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {a.issuer}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{a.date}</span>
                  </div>
                  <div className="achievement-card-title">{a.title}</div>
                  <div className="achievement-card-desc">{a.desc}</div>
                </div>
              </motion.div>
            ))}
          </StaggerContainer>
        </MotionSection>

        {/* ===== EDUCATION ===== */}
        <MotionSection id="education" className="education-section">
          <span className="section-label">// 06. ACADEMIC FOUNDATION</span>
          <h2 className="section-heading">
            Education <span className="accent">History</span>
          </h2>
          <ScrollTimeline
            items={EDUCATION.map((edu) => ({
              initial: edu.initial,
              title: edu.degree,
              subtitle: edu.institution,
              date: edu.year,
              tags: edu.tags,
              meta: [{ label: "Score", value: edu.gpa }],
              badge: edu.status === "pursuing" ? "PURSUING" : "COMPLETED",
              badgeVariant: edu.status as "pursuing" | "completed",
            }))}
          />
        </MotionSection>

        {/* ===== CONTACT ===== */}
        <MotionSection id="contact" className="contact-section">
          <span className="section-label">// 07. CONNECT WITH ME</span>
          <h2 className="section-heading">
            Get in <span className="accent">Touch</span>
          </h2>
          <div className="contact-grid">
            <MotionItem className="contact-info" direction="left">
              <h3>Let's build something extraordinary</h3>
              <p className="contact-desc">
                I am actively seeking AI/ML engineering roles, software development opportunities, and exciting collaborative projects.
                Feel free to drop a message or reach out directly.
              </p>
              <div className="contact-links">
                {[
                  {
                    icon: "fa-solid fa-envelope",
                    label: "Email",
                    url: "techpavithran18@gmail.com",
                    href: "mailto:techpavithran18@gmail.com",
                  },
                  {
                    icon: "fa-brands fa-github",
                    label: "GitHub",
                    url: "github.com/Pavithran030",
                    href: "https://github.com/Pavithran030",
                  },
                  {
                    icon: "fa-brands fa-linkedin",
                    label: "LinkedIn",
                    url: "linkedin.com/in/pavithran030",
                    href: "https://www.linkedin.com/in/pavithran030",
                  },
                  { icon: "fa-solid fa-phone", label: "Phone", url: "+91 9363575964", href: "tel:+919363575964" },
                ].map((l, i) => (
                  <MotionItem key={i} className="contact-link-row-wrapper" delay={i * 0.08} direction="left">
                    <a className="contact-link-row" href={l.href} target="_blank" rel="noopener noreferrer">
                      <i className={l.icon}></i>
                      <div>
                        <span className="link-label">{l.label}</span>
                        <span className="link-url">{l.url}</span>
                      </div>
                    </a>
                  </MotionItem>
                ))}
              </div>
            </MotionItem>

            <MotionItem direction="right" delay={0.15}>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name">Name</label>
                  <input id="contact-name" type="text" name="name" required placeholder="Your Name" />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email</label>
                  <input id="contact-email" type="email" name="email" required placeholder="your.email@example.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-subject">Subject</label>
                  <input id="contact-subject" type="text" name="subject" required placeholder="AI/ML Opportunity / Project Collaboration" />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" name="message" required placeholder="Hi Pavithran, I'd like to talk about..." rows={4}></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className={`btn-submit ${formSent ? "sent" : ""}`}>
                  {isSubmitting ? "Sending Message..." : formSent ? "✓ Message Sent Successfully" : "Send Message"}
                </button>
                {submitError && (
                  <p className="form-error-msg">
                    <span>❌</span> {submitError}
                  </p>
                )}
              </form>
            </MotionItem>
          </div>
        </MotionSection>

        {/* ===== FOOTER ===== */}
        <footer className="footer">
          <div className="footer-inner">
            <span className="footer-copy">
              © {new Date().getFullYear()} Pavithran G. All rights reserved.
            </span>
            <span className="footer-bullet" aria-hidden="true">•</span>
            <span className="footer-note">
              AI & ML Engineer • Designed & Engineered with precision
            </span>
          </div>
        </footer>
      </div>

      {/* PROJECT DETAILS POPUP MODAL */}
      {popupProject && (
        <div className="portfolio-modal-backdrop" onClick={() => setPopupProject(null)}>
          <div className="portfolio-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="portfolio-modal-close"
              onClick={() => setPopupProject(null)}
              aria-label="Close project modal"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="portfolio-modal-image-wrap">
              <img src={popupProject.image} alt={popupProject.title} className="portfolio-modal-image" />
              <div className="project-mission">MISSION-{popupProject.id}</div>
              <div className="project-cat-badge">{popupProject.category}</div>
            </div>
            <div className="portfolio-modal-content">
              <h3 className="portfolio-modal-title">{popupProject.title}</h3>
              <p className="portfolio-modal-desc">{popupProject.desc}</p>
              <div className="portfolio-modal-tech">
                {popupProject.tech.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="project-links">
                {popupProject.demo && (
                  <a href={popupProject.demo} target="_blank" rel="noopener noreferrer" className="project-link-demo">
                    <ExternalLink size={14} /> LIVE DEMO
                  </a>
                )}
                {popupProject.source && (
                  <a href={popupProject.source} target="_blank" rel="noopener noreferrer" className="project-link-code">
                    <Github size={14} /> SOURCE CODE
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE DETAILS POPUP MODAL */}
      {popupCertificate && (
        <div className="portfolio-modal-backdrop" onClick={() => setPopupCertificate(null)}>
          <div className="portfolio-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="portfolio-modal-close"
              onClick={() => setPopupCertificate(null)}
              aria-label="Close certificate modal"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="portfolio-modal-content" style={{ paddingTop: "32px" }}>
              <div className="flex items-center gap-3 mb-3">
                <i className={`${popupCertificate.icon} text-2xl text-emerald-400`}></i>
                <div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                    {popupCertificate.issuer}
                  </span>
                  <span className="text-xs font-mono text-slate-400 ml-2">{popupCertificate.date}</span>
                </div>
              </div>
              <h3 className="portfolio-modal-title">{popupCertificate.title}</h3>
              <p className="portfolio-modal-desc">{popupCertificate.desc}</p>
              {popupCertificate.skills && (
                <div className="portfolio-modal-tech mt-4">
                  {popupCertificate.skills.map((s: string) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BACK TO TOP */}
      <button className={`back-to-top ${showBackTop ? "visible" : ""}`} onClick={scrollToTop} aria-label="Back to top">
        <i className="fa-solid fa-arrow-up"></i>
      </button>
    </>
  );
}
