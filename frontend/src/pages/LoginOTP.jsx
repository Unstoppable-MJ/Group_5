import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function LoginOTP() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: phone, 2: otp
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
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

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const resp = await API.post("users/verify-otp-login/", {
                phone_number: phoneNumber,
                otp: otp
            });
            if (resp.data.token) {
                localStorage.setItem("token", resp.data.token);
                localStorage.setItem("user_id", resp.data.user_id);
                localStorage.setItem("username", resp.data.username);
                navigate("/welcome");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Invalid or expired OTP.");
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
                        <span className="text-3xl">📱</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Login via OTP</h2>
                    <p className="text-slate-400 mt-2 text-sm text-center">
                        {step === 1 && "Enter your linked phone number to receive a secure OTP on Telegram"}
                        {step === 2 && "Enter the 6-digit OTP sent to your Telegram"}
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
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold p-4 rounded-xl transition-all disabled:opacity-50 font-bold"
                        >
                            {loading ? "Sending OTP..." : "Get OTP on Telegram"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                            required
                        />
                        <button
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-4 rounded-xl transition-all disabled:opacity-50 font-bold shadow-lg shadow-emerald-500/20"
                        >
                            {loading ? "Verifying..." : "Secure Login"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-slate-500 text-sm hover:text-slate-300 transition-colors"
                        >
                            Back to change phone number
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center pt-4 border-t border-slate-800">
                    <Link to="/" className="text-slate-500 hover:text-emerald-400 text-sm transition-colors">
                        Login with Password instead
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
