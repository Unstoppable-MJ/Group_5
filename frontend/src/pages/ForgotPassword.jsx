import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function ForgotPassword() {
    const botLink = "https://t.me/unstop_mj_bot";
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(botLink)}`;
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: password
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const resp = await API.post("users/request-otp/", { phone_number: phoneNumber });
            setMessage(resp.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to request OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        if (otp.length === 6) {
            setStep(3);
        } else {
            setError("Please enter a valid 6-digit OTP");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const resp = await API.post("users/reset-password-otp/", {
                phone_number: phoneNumber,
                otp: otp,
                new_password: newPassword
            });
            setMessage(resp.data.message);
            setTimeout(() => navigate("/"), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 bg-slate-900/50 backdrop-blur-xl p-10 rounded-3xl w-[400px] border border-slate-700/50 shadow-2xl"
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                        <span className="text-3xl">🛡️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
                    <p className="text-slate-400 mt-2 text-sm text-center">
                        {step === 1 && "Enter your linked phone number to receive an OTP via Telegram"}
                        {step === 2 && "Enter the 6-digit OTP sent to your Telegram"}
                        {step === 3 && "Set your new secure password"}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-500 text-sm text-center">
                        {error}
                    </div>
                )}

                {message && step === 2 && (
                    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 text-sm text-center">
                        {message}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleRequestOTP} className="space-y-4">
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Phone Number (e.g. 9876543210)"
                            className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            required
                        />
                        <button
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold p-4 rounded-xl transition-all disabled:opacity-50"
                        >
                            {loading ? "Sending OTP..." : "Get OTP on Telegram"}
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <a
                                href={botLink}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full text-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold p-3 rounded-xl transition-all"
                            >
                                Go to Bot
                            </a>
                            <button
                                type="button"
                                onClick={() => setShowQr((prev) => !prev)}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold p-3 rounded-xl transition-all"
                            >
                                {showQr ? "Hide QR" : "Scan QR for Mobile"}
                            </button>
                        </div>

                        {showQr && (
                            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-5 text-center space-y-4">
                                <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-lg shadow-cyan-500/10">
                                    <img
                                        src={qrCodeUrl}
                                        alt="QR code for Telegram bot"
                                        className="w-44 h-44 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-white">Scan to open the Telegram bot on mobile</p>
                                    <p className="text-xs text-slate-400 break-all">{botLink}</p>
                                </div>
                            </div>
                        )}
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            required
                        />
                        <button
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-4 rounded-xl transition-all"
                        >
                            Verify OTP
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-slate-500 text-sm hover:text-slate-300"
                        >
                            Back to change phone number
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            required
                        />
                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold p-4 rounded-xl transition-all disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/" className="text-slate-500 hover:text-emerald-400 text-sm transition-colors">
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
