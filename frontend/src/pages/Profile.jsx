import React from 'react';
import { motion } from 'framer-motion';

export default function Profile() {
    const userName = localStorage.getItem('userName') || 'Demo User';

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0b1220] rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

                <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4 relative z-10">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-lg">👤</span>
                    User Profile
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-700">
                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userName}&backgroundColor=transparent`} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{userName}</h3>
                                <p className="text-slate-400">Pro Member</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Email Address</label>
                                <p className="text-slate-300 font-medium mt-1">{userName.toLowerCase().replace(' ', '')}@finova.demo</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Account Created</label>
                                <p className="text-slate-300 font-medium mt-1">October 12, 2025</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
                        <h3 className="text-lg font-bold text-white mb-4">Portfolio Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                                <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Total Portfolios</span>
                                <p className="text-2xl font-black text-emerald-400 mt-1">4</p>
                            </div>
                            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                                <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Total Assets</span>
                                <p className="text-2xl font-black text-blue-400 mt-1">12</p>
                            </div>
                            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 col-span-2 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Account Status</span>
                                    <p className="text-lg font-bold text-slate-300 mt-1">Verified & Active</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <span className="text-emerald-400">✓</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
