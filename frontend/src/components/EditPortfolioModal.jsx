import { useState, useEffect } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function EditPortfolioModal({ isOpen, onClose, portfolio, onPortfolioUpdated }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (portfolio) {
            setName(portfolio.name || "");
            setDescription(portfolio.description || "");
        }
    }, [portfolio, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError(null);

        API.patch("portfolios/", {
            id: portfolio.id,
            name,
            description
        })
            .then((res) => {
                setLoading(false);
                onPortfolioUpdated({ ...portfolio, name, description });
                onClose();
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to update portfolio. Please try again.");
                setLoading(false);
            });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-[2rem] p-8 w-full max-w-md overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span>✏️</span> Edit Portfolio
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">
                            Portfolio Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. IT Sector, Automobile"
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Short description..."
                            rows={3}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : "Save Changes"}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
