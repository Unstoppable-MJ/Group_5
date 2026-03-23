import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Welcome() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "Investor";
    const [displayText, setDisplayText] = useState("");
    const fullText = `Welcome, ${username} 👋`;

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayText(fullText.slice(0, i));
            i++;
            if (i > fullText.length) clearInterval(timer);
        }, 100);
        return () => clearInterval(timer);
    }, [fullText]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans select-none">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -left-1/4 w-full h-full bg-blue-600/20 rounded-full blur-[150px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-emerald-500/10 rounded-full blur-[150px]"
                />
            </div>

            {/* Central Glassmorphism Card */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-2xl px-6"
            >
                <div className="bg-slate-900/40 backdrop-blur-2xl p-12 rounded-[2.5rem] border border-slate-800/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
                    {/* Subtle Internal Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                    <motion.div variants={itemVariants} className="mb-8 flex justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-4xl">📈</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-6xl font-black mb-6 tracking-tight"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                            {displayText}
                        </span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-1.5 h-12 bg-blue-500 ml-2 align-middle"
                        />
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-6"
                    >
                        Your AI-powered financial journey starts here.
                    </motion.p>

                    <motion.div variants={itemVariants} className="space-y-4 max-w-md mx-auto">
                        <p className="text-slate-400 leading-relaxed text-lg">
                            Track your portfolio in real-time, get deep AI-driven sentiment analysis on every stock, and make decisions backed by smart data.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="mt-12 flex flex-col items-center gap-6"
                    >
                        <motion.button
                            onClick={() => navigate("/portfolios")}
                            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-blue-600 to-emerald-500 px-10 py-5 rounded-2xl text-white font-bold text-xl shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 group"
                        >
                            Go to Portfolio
                            <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                🚀
                            </motion.span>
                        </motion.button>

                        <p className="text-slate-500 text-sm font-medium">
                            Powered by AI • Built for Smart Investors
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Floating Decorative Symbols */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: 0
                        }}
                        animate={{
                            y: [null, Math.random() * -100, null],
                            opacity: [0, 0.3, 0],
                            rotate: [0, 360]
                        }}
                        transition={{
                            duration: 10 + Math.random() * 20,
                            repeat: Infinity,
                            delay: i * 2
                        }}
                        className="text-4xl absolute hidden md:block"
                    >
                        {["₹", "💎", "💹", "📊", "🤖", "📈"][i]}
                    </motion.div>
                ))}
            </div>

            {/* Footer Tagline */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-10 text-slate-600 text-xs tracking-widest uppercase font-semibold"
            >
                &copy; 2026 ChatSense Intelligence. All rights reserved.
            </motion.div>
        </div>
    );
}
