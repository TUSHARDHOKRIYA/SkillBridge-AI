"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, MotionValue } from "framer-motion";

interface Node {
    id: string;
    label: string;
    description?: string;
    x: number;
    y: number;
    type: "skill" | "career";
}

const SKILLS: Node[] = [
    { id: "python", label: "Python", description: "The core language for AI, data science, and modern backend logic.", x: 250, y: 155, type: "skill" },
    { id: "js", label: "JavaScript (ES6+)", description: "The foundation of interactive web experiences and frontend design.", x: 270, y: 225, type: "skill" },
    { id: "sql", label: "SQL & Database Design", description: "Mastering the storage and architecting of relational data.", x: 320, y: 295, type: "skill" },
    { id: "git", label: "Git & GitHub", description: "Essential tools for version control and collaborative development.", x: 290, y: 365, type: "skill" },
    { id: "apis", label: "APIs (REST / GraphQL)", description: "Building robust communication layers for data exchange.", x: 330, y: 435, type: "skill" },
    { id: "ml", label: "Machine Learning Fundamentals", description: "The fundamental algorithms and logic powering modern AI.", x: 350, y: 505, type: "skill" },
];

const CAREERS: Node[] = [
    { id: "swe", label: "Software Engineer", description: "Designing and building robust, scalable software systems.", x: 1350, y: 130, type: "career" },
    { id: "fullstack", label: "Full-Stack Developer", description: "Mastering both frontend and backend for end-to-end web apps.", x: 1380, y: 210, type: "career" },
    { id: "data_sci", label: "Data Scientist", description: "Extracting deep insights from large-scale complex datasets.", x: 1400, y: 290, type: "career" },
    { id: "ml_eng", label: "Machine Learning Engineer", description: "Building and deploying advanced predictive AI models.", x: 1410, y: 370, type: "career" },
    { id: "ai_eng", label: "AI Engineer", description: "Architecting intelligent systems with neural networks and LLMs.", x: 1400, y: 450, type: "career" },
    { id: "devops", label: "DevOps Engineer", description: "Streamlining development pipelines with automation and CI/CD.", x: 1340, y: 530, type: "career" },
];

const CareerPathMotion = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const drawProgress = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
    const glowOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0.2, 0.6]);

    // Centered Brain
    const brainX = 850;
    const brainY = 350;

    return (
        <section ref={containerRef} className="relative h-[80vh] w-full flex flex-col items-center justify-center overflow-hidden bg-black py-10 border-b border-white/5">
            {/* Background Grain/Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="absolute top-10 text-center z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold mb-2 text-white tracking-tight"
                >
                    Your Path, Visualized
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.5 }}
                    className="text-blue-400 text-[10px] font-mono tracking-[0.5em] uppercase"
                >
                    Career Mapping
                </motion.p>
            </div>

            <svg viewBox="0 0 1700 800" className="w-full h-full max-w-7xl select-none">
                <defs>
                    <filter id="brain-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="15" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="line-glow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <radialGradient id="brain-grad">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Left Side: Neural Skills */}
                {SKILLS.map((skill) => (
                    <NeuralPath
                        key={skill.id}
                        start={skill}
                        end={{ x: brainX - 80, y: brainY }}
                        isHovered={hoveredId === skill.id}
                        onHover={() => setHoveredId(skill.id)}
                        onLeave={() => setHoveredId(null)}
                    />
                ))}

                {/* Right Side: Wavy Careers */}
                {CAREERS.map((career) => (
                    <WavyPath
                        key={career.id}
                        start={{ x: brainX + 80, y: brainY }}
                        end={career}
                        isHovered={hoveredId === career.id}
                        onHover={() => setHoveredId(career.id)}
                        onLeave={() => setHoveredId(null)}
                    />
                ))}

                {/* Central Brain Image */}
                <motion.g
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    {/* Pulsing Aura */}
                    <motion.circle
                        cx={brainX} cy={brainY} r="180"
                        fill="url(#brain-grad)"
                        animate={{
                            opacity: [0.3, 0.5, 0.3],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Brain Image */}
                    <foreignObject x={brainX - 120} y={brainY - 120} width="240" height="240">
                        <motion.div
                            className="w-full h-full flex items-center justify-center p-4 select-none pointer-events-none"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <img
                                src="/neon-brain.png"
                                alt="Neural Brain"
                                className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(96,165,250,0.5)]"
                                style={{ borderRadius: '50%' }}
                            />
                        </motion.div>
                    </foreignObject>

                    {/* Decorative Glowing Core behind image */}
                    <circle cx={brainX} cy={brainY} r="80" fill="#60a5fa" className="opacity-10 blur-3xl pointer-events-none" />
                </motion.g>
            </svg>

            {/* Floating Info Panel (follows mouse with smart positioning) */}
            {hoveredId && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        position: "fixed",
                        left: mousePos.x > window.innerWidth / 2 ? mousePos.x - 240 : mousePos.x + 20,
                        top: mousePos.y > window.innerHeight - 200 ? mousePos.y - 140 : mousePos.y + 20,
                        pointerEvents: "none"
                    }}
                    className="z-50 p-4 rounded-xl border border-blue-500/30 shadow-2xl backdrop-blur-xl bg-black/80 max-w-xs"
                >
                    <h4 className="text-blue-400 font-bold mb-1">
                        {SKILLS.find(s => s.id === hoveredId)?.label || CAREERS.find(c => c.id === hoveredId)?.label}
                    </h4>
                    <p className="text-zinc-400 text-sm leading-relaxed lowercase italic opacity-80">
                        {SKILLS.find(s => s.id === hoveredId)?.description || CAREERS.find(c => c.id === hoveredId)?.description}
                    </p>
                </motion.div>
            )}
        </section>
    );
};

const NeuralPath = ({ start, end, isHovered, onHover, onLeave }: any) => {
    // Entangled neural paths that "bundle" with multiple intersections starting early
    const seed = start.id.length;
    const dx = end.x - start.x;

    // Toggle direction and intensity to force variety in the bundle
    const dir = seed % 2 === 0 ? 1 : -1;
    const vOffset = 18 + (seed % 3) * 6;

    // Using two Bézier segments to force an early intersection near dx*0.15
    const cp1y = start.y + vOffset * dir;
    const cp2y = start.y - vOffset * dir;

    const midX = start.x + dx * 0.45; // Shifted slightly left to bunch up intersections early
    const midY = start.y + (end.y - start.y) * 0.45;

    // First segment (M to Mid) creates the initial knot/mesh
    // Second segment (Mid to End) "braids" towards the brain node
    const pathD = `M ${start.x} ${start.y} 
                   C ${start.x + dx * 0.15} ${cp1y}, ${start.x + dx * 0.3} ${cp2y}, ${midX} ${midY}
                   S ${end.x - dx * 0.2} ${end.y + vOffset * dir}, ${end.x} ${end.y}`;

    return (
        <g onMouseEnter={onHover} onMouseLeave={onLeave} className="cursor-pointer">
            {/* Background ghost path */}
            <path d={pathD} fill="none" stroke="#1e3a8a" strokeWidth="1" opacity="0.2" />

            {/* Animated path */}
            <motion.path
                d={pathD}
                fill="none"
                stroke={isHovered ? "#93c5fd" : "#3b82f6"}
                strokeWidth={isHovered ? 4 : 2}
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: isHovered ? 1 : 0.4 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                filter={isHovered ? "url(#line-glow)" : ""}
            />

            <motion.text
                x={start.x - 10} y={start.y + 5}
                textAnchor="end"
                fill={isHovered ? "#fff" : "#60a5fa"}
                className="text-[14px] font-black tracking-widest italic"
                animate={{ opacity: isHovered ? 1 : 0.6 }}
            >
                {start.label}
            </motion.text>

            <motion.circle
                cx={start.x} cy={start.y} r="4"
                fill={isHovered ? "#fff" : "#3b82f6"}
                filter="url(#line-glow)"
                whileHover={{ scale: 1.5 }}
            />
        </g>
    );
};

const WavyPath = ({ start, end, isHovered, onHover, onLeave }: any) => {
    const seed = end.id.length;
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const cp1x = start.x + dx * 0.25;
    const cp1y = start.y + dy * 0.1 + (seed % 2 === 0 ? 40 : -40);
    const cp2x = start.x + dx * 0.75;
    const cp2y = start.y + dy * 0.9 + (seed % 2 === 0 ? -40 : 40);

    return (
        <g onMouseEnter={onHover} onMouseLeave={onLeave} className="cursor-pointer">
            <motion.path
                d={`M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`}
                fill="none"
                stroke={isHovered ? "#fff" : "#60a5fa"}
                strokeWidth={isHovered ? 4 : 2.5}
                strokeOpacity={isHovered ? 1 : 0.8}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                transition={{ duration: 1.8, delay: 0.3 }}
                filter={isHovered ? "url(#line-glow)" : ""}
            />

            {/* Widened Boxed Labels */}
            <g transform={`translate(${end.x}, ${end.y - 15})`}>
                <rect
                    x="10" y="0"
                    width="200" height="30"
                    fill="rgba(0,0,0,0.8)"
                    stroke={isHovered ? "#fff" : "#3b82f6"}
                    strokeWidth="1.5"
                    rx="4"
                />
                <text
                    x="20" y="20"
                    fill={isHovered ? "#fff" : "#93c5fd"}
                    className="text-[11px] font-bold tracking-[0.05em] uppercase"
                >
                    {end.label}
                </text>
            </g>
        </g>
    );
};

export default CareerPathMotion;
