"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import { motion } from "framer-motion";
import CareerPathMotion from "@/components/CareerPathMotion";
import "./homepage.css";

const allTags = ["React", "FastAPI", "Python", "SQL", "Auth", "Deployment", "CI/CD", "Testing"];

const SyllabusPreview = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const skillNodes = [
    { id: "react", label: "React", x: -100, y: -80 },
    { id: "python", label: "Python", x: 120, y: -60 },
    { id: "sql", label: "SQL", x: -90, y: 90 },
    { id: "fastapi", label: "FastAPI", x: 130, y: 80 },
    { id: "cloud", label: "Cloud", x: 0, y: -130 },
    { id: "ai", label: "AI/ML", x: 0, y: 130 },
  ];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      className="relative h-[550px] md:h-[650px] w-full rounded-3xl border border-white/10 overflow-hidden group bg-black/40 backdrop-blur-sm shadow-2xl"
    >
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

      <div className="neural-container h-full w-full">
        {/* Central Pulsing Core */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="core-glow"
        />
        <div className="relative z-20 w-8 h-8 bg-blue-500 rounded-full shadow-[0_0_30px_#3b82f6] animate-pulse" />

        {/* Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {skillNodes.map((node) => (
            <motion.line
              key={`line-${node.id}`}
              x1="50%"
              y1="50%"
              x2={`${50 + (node.x + mousePos.x * 0.1) / 4}%`}
              y2={`${50 + (node.y + mousePos.y * 0.1) / 4}%`}
              className="connection-line"
              style={{
                stroke: hoveredNode === node.id ? "rgba(59, 130, 246, 0.6)" : "rgba(59, 130, 246, 0.15)",
                strokeWidth: hoveredNode === node.id ? 2 : 1
              }}
            />
          ))}
        </svg>

        {/* Floating Skill Nodes */}
        {skillNodes.map((node) => (
          <motion.div
            key={node.id}
            className="skill-node-wrapper"
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            animate={{
              x: node.x + mousePos.x * 0.05,
              y: node.y + mousePos.y * 0.05,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className="skill-node-content">
              {node.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="scan-line !opacity-20" />
    </div>
  );
};

const TechPrism = () => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const nodes = [
    { icon: "🎓", label: "Learn" },
    { icon: "⚡", label: "Skill" },
    { icon: "🚀", label: "Grow" },
    { icon: "💼", label: "Job" },
    { icon: "📈", label: "Rise" },
    { icon: "🎯", label: "Goal" },
    { icon: "🧠", label: "AI" },
    { icon: "🌐", label: "Net" },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotation({ x: y / 20, y: -x / 20 });
  };

  return (
    <div
      className="prism-container perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotation({ x: 0, y: 0 })}
    >
      <motion.div
        className="prism-surface"
        animate={{ rotateX: rotation.x, rotateY: rotation.y }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Revolving Rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="prism-ring"
            style={{
              width: `${180 + i * 50}px`,
              height: `${180 + i * 50}px`
            }}
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 360],
              rotateZ: [0, 360]
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop"
            }}
          />
        ))}

        {/* Central Core: The "Bridge" */}
        <div className="prism-core-sphere flex flex-col items-center justify-center text-center z-10 bg-black/50 backdrop-blur-sm border border-blue-500/30">
          <div className="text-2xl mb-1">🌉</div>
          <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Bridge</div>
        </div>

        {/* Orbiting Career Nodes */}
        {nodes.map((node, i) => (
          <motion.div
            key={i}
            className="absolute flex items-center justify-center"
            style={{
              width: '40px',
              height: '40px',
              top: '50%',
              left: '50%',
              marginLeft: '-20px',
              marginTop: '-20px',
            }}
            animate={{
              x: Math.cos(i * (Math.PI / 4)) * 140,
              y: Math.sin(i * (Math.PI / 4)) * 140,
              rotateZ: -rotation.y * 2 // Counter-rotate to keep upright if desired, or let it spin
            }}
            transition={{
              duration: 0, // Direct control via animate prop for position
            }}
          >
            <motion.div
              className="w-full h-full bg-black/80 border border-blue-500/50 rounded-full flex items-center justify-center text-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer hover:scale-125 hover:border-blue-400 transition-all font-bold"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              onMouseEnter={() => setHoveredNode(i)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {hoveredNode === i ? (
                <span className="text-[10px] font-mono text-white">{node.label}</span>
              ) : (
                <span>{node.icon}</span>
              )}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default function Home() {

  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1] as const,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-container min-h-screen selection:bg-blue-500/30 bg-black text-white relative">
      {/* Background Elements */}

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="glow-blob top-[-10%] left-[-5%] opacity-30" />
        <div className="glow-blob bottom-[10%] right-[-5%] opacity-20" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-12 py-8 backdrop-blur-xl border-b border-white/5 bg-black/40">
        <div className="flex-1 flex items-center">
          <div className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
            SkillBridge <span className="text-blue-500">AI</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-12">
          <Link href="#features" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-all">Features</Link>
          <Link href="#how-it-works" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-all">How it Works</Link>
          <Link href="#faq" className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-all">FAQ</Link>
        </div>

        <div className="flex-1 flex justify-end items-center">
          <Link
            href="/login"
            className="px-8 py-2.5 bg-white text-black rounded-full font-black hover:bg-zinc-200 transition-all text-xs uppercase tracking-wider shadow-lg shadow-white/5"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <motion.div
          className="static-bg"
          initial={{ filter: "blur(20px)" }}
          animate={{ filter: "blur(0px)" }}
          transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
        />

        <motion.video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
          initial={{ filter: "blur(20px)" }}
          animate={{ filter: "blur(0px)" }}
          transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </motion.video>

        <div className="absolute inset-0 bg-black/40 z-0" />

        <motion.div
          className="relative z-10 pt-24 md:pt-32"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md"
          >
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">v2.0 is now live</span>
          </motion.div>

          <motion.h1
            variants={containerVariants}
            className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight"
            initial={{ filter: "blur(10px)", opacity: 0 }}
            animate={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="flex flex-wrap justify-center overflow-hidden">
              {"Bridge the Gap.".split(" ").map((word, i) => (
                <motion.span key={i} variants={itemVariants} className="inline-block mr-[0.2em]">{word}</motion.span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center overflow-hidden">
              <span className="text-gradient">
                {"Build Your Future.".split(" ").map((word, i) => (
                  <motion.span key={i} variants={itemVariants} className="inline-block mr-[0.2em]">{word}</motion.span>
                ))}
              </span>
            </div>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            AI-powered career roadmaps that turn your college syllabus into a professional edge.
            Stop guessing, start mastering.
          </motion.p>

          <motion.div variants={itemVariants} className="flex justify-center gap-6">
            <Link
              href="/login"
              className="px-12 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-400 text-white rounded-full text-xl font-bold hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all shadow-2xl border border-white/10 relative overflow-hidden group"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-2 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Content Sections */}
      <motion.main
        className="max-w-7xl mx-auto px-8 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        {/* Career Path in Motion */}
        <div className="py-20">
          <CareerPathMotion />
        </div>

        {/* Why most students feel lost */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="text-center max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-16 leading-tight">
              Why most students feel <span className="text-blue-500">lost</span> after lectures
            </h2>
            <div className="space-y-12">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-2xl md:text-3xl text-zinc-500 font-light"
              >
                "Your syllabus tells you what to study, <br /><span className="text-zinc-300">not why it matters.</span>"
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-2xl md:text-3xl text-zinc-500 font-light"
              >
                "Career advice online ignores <br /><span className="text-zinc-300">what you’re already learning.</span>"
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="pt-8"
              >
                <p className="text-2xl md:text-3xl text-white font-medium bg-blue-500/10 p-8 rounded-3xl border border-blue-500/20 inline-block">
                  "Students don’t fail because they lack talent — <br />they fail due to <span className="text-blue-400">lack of direction.</span>"
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Neural Engine + What is NOT Combined Section */}
        <section className="py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Interactive Element */}
            <div className="scroll-mt-32 order-2 lg:order-1">
              <SyllabusPreview />
            </div>

            {/* Right Column: What SkillBridge is NOT */}
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold mb-10 leading-tight">
                What SkillBridge AI is <br />
                <span className="text-gradient">NOT</span> ❌
              </h2>

              <div className="space-y-6">
                {[
                  {
                    title: "Not another generic roadmap",
                    desc: "We don't give you a template. We build around YOUR college curriculum.",
                    icon: "🚫"
                  },
                  {
                    title: "Not random YouTube learning",
                    desc: "No endlessly scrolling tutorials. You get targeted resources for specific gaps.",
                    icon: "📺"
                  },
                  {
                    title: "Not replacing your education",
                    desc: "We don't compete with your degree. We make it actually useful for getting hired.",
                    icon: "🎓"
                  }
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 10 }}
                    className="glass-card p-6 rounded-2xl border-l-4 border-l-red-500/20 hover:border-l-red-500/50 transition-all flex items-start gap-4 group"
                  >
                    <div className="text-3xl opacity-80 group-hover:scale-110 transition-transform">{f.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">{f.title}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10">
                <p className="text-xl font-medium text-white leading-relaxed">
                  We align your syllabus with real career paths — <span className="text-blue-500">nothing more, nothing less.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem -> Solution (Now Features) */}
        <section id="features" className="py-32 scroll-mt-32">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Powerful <br />
                <span className="text-gradient">Platform Features.</span>
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Unlock your full potential with a suite of AI-driven tools designed to bridge the gap between education and employment.
              </p>
              <div className="space-y-6">
                {[
                  { t: "Smart Analysis", d: "Instantly extract skills from any syllabus or resume." },
                  { t: "Dynamic Roadmap", d: "Personalized learning paths adapted to your goals." },
                  { t: "Gap Bridging", d: "Identify missing skills and get resources to learn them." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-xs">✓</div>
                    <div>
                      <h4 className="font-bold text-white">{item.t}</h4>
                      <p className="text-zinc-500 text-sm">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square flex items-center justify-center group"
            >
              <TechPrism />
            </motion.div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-32 scroll-mt-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-zinc-400 text-lg">Your journey to career excellence in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-white/5 -z-10" />
            {[
              { step: "01", title: "Tell Us Your Goals", desc: "Define your interests, target roles, and weekly time commitment." },
              { step: "02", title: "Upload Syllabus", desc: "Our AI scans your curriculum to identify existing knowledge and gaps." },
              { step: "03", title: "Execute Roadmap", desc: "Get your personalized learning path and start building your future." }
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`glass-card p-10 rounded-3xl transition-all duration-500 relative overflow-hidden ${activeStep === i
                  ? "border-blue-400 shadow-[0_0_40px_rgba(96,165,250,0.5)] bg-blue-500/10 scale-105"
                  : "border-white/10"
                  }`}
              >
                {activeStep === i && (
                  <div className="absolute inset-0 bg-blue-500/5 z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-4xl font-black text-blue-500/20 mb-6">{s.step}</div>
                  <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32 scroll-mt-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked <span className="text-blue-500">Questions</span></h2>
            <p className="text-zinc-400 text-lg">Everything you need to know about SkillBridge AI.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "How accurate is the AI syllabus scanning?", a: "Our AI is trained on thousands of academic documents and industry job descriptions, ensuring a high level of accuracy in extracting core skills and mapping them to professional requirements." },
              { q: "Is SkillBridge AI free for students?", a: "Yes, our core features including syllabus scanning and roadmap generation are completely free for individual students." },
              { q: "What formats can I upload my syllabus in?", a: "Currently, we support PDF files as they are the most common format for academic syllabi." },
              { q: "Can I export my roadmap to other platforms?", a: "Absolutely! You can export your roadmap to Google Sheets, with more integrations like Notion and Trello coming soon." }
            ].map((item, i) => (
              <details key={i} className="glass-card rounded-2xl group">
                <summary className="p-6 cursor-pointer list-none flex justify-between items-center">
                  <span className="font-bold text-lg">{item.q}</span>
                  <span className="text-blue-500 group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <div className="px-6 pb-6 text-zinc-400 leading-relaxed border-t border-white/5 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </motion.main>

      {/* Final CTA */}
      {/* Final CTA Removed */}

      {/* Enhanced Footer */}
      <footer className="py-20 px-12 border-t border-white/5 bg-black/50 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="text-2xl font-black text-white tracking-tighter mb-6">
              SkillBridge <span className="text-blue-500">AI</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Empowering students to bridge the gap between academic theory and industry reality with AI-driven career roadmaps.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'GitHub', 'LinkedIn'].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="sr-only">{s}</span>
                  <div className="w-4 h-4 bg-zinc-600 rounded-sm" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Platform</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link href="#features" className="hover:text-blue-500 transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-blue-500 transition-colors">How it Works</Link></li>
              <li><Link href="/login" className="hover:text-blue-500 transition-colors">Login / Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link href="#" className="hover:text-blue-500 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Legal</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 mt-20 pt-8 flex flex-col md:row justify-between items-center gap-4">
          <p className="text-zinc-600 text-sm">© 2026 SkillBridge AI. Built for the future of education.</p>
          <div className="flex gap-8 text-zinc-600 text-sm">
            <span>Server Status: <span className="text-green-500 font-mono">Operational</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

