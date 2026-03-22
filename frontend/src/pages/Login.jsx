import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isDemoHovered, setIsDemoHovered] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear previous session on load
  useEffect(() => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
  }, []);

  const handleDemoLogin = () => {
    // For Demo logic without real auth, we could potentially log them into a dummy backend user
    // Assumes backend has a 'dummy' user, or create one on the fly. We'll simulate standard login.
    setUsername("dummy");
    setPassword("1234");
    // Trigger submit manually by calling handleLogin logic
    executeLogin("dummy", "1234");
  };

  const executeLogin = async (usr, pwd) => {
    setError("");
    setLoading(true);
    try {
      const response = await API.post("login/", {
        username: usr,
        password: pwd
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user_id", response.data.user_id);
        localStorage.setItem("username", response.data.username);
        navigate("/welcome");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid username or password");
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    executeLogin(username, password);
  };

  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 bg-slate-900/50 backdrop-blur-xl p-10 rounded-3xl w-[400px] border border-slate-700/50 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-3xl">📈</span>
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Welcome Back
          </h2>
          <p className="text-slate-400 mt-2 text-sm">Sign in to your portfolio</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-500 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
              placeholder={usernameFocused ? "Username" : "Enter username (Demo: dummy)"}
              className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder={passwordFocused ? "Password" : "Enter password (Demo: 1234)"}
              className="w-full p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-semibold p-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Access Dashboard"}
          </motion.button>
        </form>

        <div className="flex flex-col space-y-4 mt-4">
          <div className="relative flex justify-center mt-2">
            <motion.button
              type="button"
              onMouseEnter={() => setIsDemoHovered(true)}
              onMouseLeave={() => setIsDemoHovered(false)}
              onClick={handleDemoLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold p-4 rounded-xl shadow-lg shadow-slate-900/50 transition-all duration-300 border border-slate-700"
            >
              Demo Login
            </motion.button>

            <AnimatePresence>
              {isDemoHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full mb-3 w-64 p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl z-50 pointer-events-none"
                >
                  <p className="text-slate-200 text-sm font-medium mb-2">For demo access use:</p>
                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 space-y-1">
                    <p className="text-slate-400 text-sm"><span className="text-emerald-400 font-mono">Username:</span> dummy</p>
                    <p className="text-slate-400 text-sm"><span className="text-emerald-400 font-mono">Password:</span> 1234</p>
                  </div>
                  <p className="text-slate-500 text-xs mt-3 text-center">
                    This is a sample account for exploring the platform.
                  </p>
                  {/* Tooltip Arrow */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-800 border-b border-r border-slate-700 rotate-45"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center mt-4 border-t border-slate-800 pt-4 space-y-3">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Create Account
              </Link>
            </p>
            <div className="flex justify-between items-center text-xs">
              <Link to="/forgot-password" title="Forgot Password" icon="lock" className="text-slate-500 hover:text-emerald-400 transition-colors">
                Forgot password?
              </Link>
              <Link to="/login-otp" className="text-slate-500 hover:text-blue-400 transition-colors font-medium">
                Login via OTP 📱
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-600 text-xs">
            This demo account is for testing and exploring the platform features only.
          </p>
        </div>
      </motion.div>
    </div>
  );
}