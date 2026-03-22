import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        username: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const response = await API.post("register/", {
                username: formData.username,
                phone_number: formData.phoneNumber,
                password: formData.password,
                email: formData.email,
                first_name: formData.fullName,
            });

            if (response.status === 201) {
                if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("user_id", response.data.user_id);
                    localStorage.setItem("username", response.data.username);
                }

                setSuccess(true);
                setTimeout(() => {
                    navigate("/welcome");
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl w-full max-w-[450px] mx-4 border border-slate-700/50 shadow-2xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                        <span className="text-3xl">✨</span>
                    </div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Create Account
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm text-center">Join Finova and start managing your portfolio</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl text-emerald-400 text-sm text-center font-medium"
                    >
                        Account created successfully. Welcome to Finova. Redirecting...
                    </motion.div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        />
                    </div>

                    <div>
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="Phone Number (e.g. +91...)"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading || success}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-semibold p-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-sm">
                        Already have an account?{" "}
                        <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
