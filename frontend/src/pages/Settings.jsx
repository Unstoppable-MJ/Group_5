import React from 'react';
import { motion } from 'framer-motion';

export default function Settings() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0b1220] rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

                <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4 relative z-10">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-lg">⚙️</span>
                    Account Settings
                </h2>

                <div className="space-y-6 relative z-10">
                    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div>
                            <h3 className="text-lg font-bold text-white">Change Password</h3>
                            <p className="text-slate-400 text-sm mt-1">Ensure your account is using a long, random password to stay secure.</p>
                        </div>
                        <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors shrink-0">
                            Update Password
                        </button>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div>
                            <h3 className="text-lg font-bold text-white">Update Email Address</h3>
                            <p className="text-slate-400 text-sm mt-1">Update the primary email address associated with your ChatSense account.</p>
                        </div>
                        <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors shrink-0">
                            Change Email
                        </button>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div>
                            <h3 className="text-lg font-bold text-white">Notification Preferences</h3>
                            <p className="text-slate-400 text-sm mt-1">Manage which alerts and AI portfolio updates you receive via email.</p>
                        </div>
                        <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors shrink-0">
                            Configure Alerts
                        </button>
                    </div>

                    <div className="bg-blue-600/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div className="flex gap-4 items-start">
                            <span className="text-3xl">✈️</span>
                            <div>
                                <h3 className="text-lg font-bold text-white">Connect Telegram Bot</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Link your Telegram account to receive secure OTPs for login and password reset.
                                </p>
                                <div className="mt-2 text-xs text-blue-400 font-mono bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
                                    1. Open @ChatSenseOTP_Bot on Telegram<br />
                                    2. Press START & share your contact
                                </div>
                            </div>
                        </div>
                        <a
                            href="https://t.me/ChatSenseOTP_Bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shrink-0 shadow-lg shadow-blue-600/20"
                        >
                            Connect Now
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
