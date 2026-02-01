// src/pages/Auth.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Send, User, Mail, Lock, Eye, EyeOff, Sprout, Briefcase, Sparkles } from "lucide-react";
import landing from "../assets/login.png";
import gsap from "gsap";

export default function Auth() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(true);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "farmer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const authRef = useRef(null);
  const formRef = useRef(null);

  // GSAP Animations - Only run once on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(".auth-brand", { opacity: 0, y: -30 });
      gsap.set(".auth-form", { opacity: 0, y: 30 });
      gsap.set(".form-field", { opacity: 0, x: -20 });

      // Animate in
      gsap.to(".auth-brand", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
      });
      
      gsap.to(".auth-form", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out"
      });

      gsap.to(".form-field", {
        x: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.6,
        delay: 0.4,
        ease: "power2.out"
      });
    }, authRef);

    return () => ctx.revert();
  }, []); // Only run once on mount

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match for signup
    if (isSignup && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Validate password length
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignup
        ? "http://localhost:4000/api/auth/register"
        : "http://localhost:4000/api/auth/login";

      const payload = isSignup
        ? {
            name: form.name,
            mobile: form.mobile,
            email: form.email,
            password: form.password,
            role: form.role,
            state: form.state,
            district: form.district,
            cropType: form.cropType,
            landSize: form.landSize,
            category: form.category,
          }
        : { mobile: form.mobile, password: form.password };

      const res = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/json" },
      });

      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("auth-change"));
      toast.success(
        isSignup ? "🎉 Signup successful!" : "✅ Login successful!"
      );
      
      // Small delay to ensure token is saved and auth state updates
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
    } catch (err) {
      console.error("Auth error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={authRef} className="relative h-screen flex items-center justify-center px-4 py-4 overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 -z-10">
        <img
          src={landing}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover "
        />
        {/* <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/40 via-green-500/30 to-emerald-700/40" /> */}
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className={`w-full ${isSignup ? 'max-w-5xl' : 'max-w-md'} relative z-10`}>
        {/* Brand Header - Compact */}
        <div
          className="auth-brand flex flex-col md:flex-row items-center justify-center gap-3 mb-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-xl">
            <Sprout size={24} className="fill-current" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-2xl">
              Agri<span className="text-emerald-300">Mitra</span>
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm mt-0.5">
              AI-powered agriculture ecosystem
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <div
          ref={formRef}
          className={`auth-form bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/50 opacity-100 ${
            isSignup ? 'p-5 md:p-6' : 'p-6 md:p-8'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`${isSignup ? 'text-2xl' : 'text-2xl md:text-3xl'} font-bold text-gray-800`}>
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-xs text-emerald-600 mt-0.5">
                {isSignup
                  ? "Join AgriMitra to access AI-powered farming tools and connect with experts."
                  : "Sign in to continue to AgriMitra."}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <Sparkles size={10} />
              <span>Secure · Fast · Private</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={isSignup ? "space-y-2.5" : "space-y-4"}>
            {isSignup ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <label className="form-field block">
                  <div className="flex items-center text-xs text-emerald-700 font-semibold mb-1.5">
                    <User size={14} className="mr-1.5 text-emerald-600" /> Full name
                  </div>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-emerald-100 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="Your full name"
                  />
                </label>

                <label className="form-field block">
                  <div className="flex items-center text-xs text-emerald-700 font-semibold mb-1.5">
                    <Mail size={14} className="mr-1.5 text-emerald-600" /> Mobile Number
                  </div>
                  <input
                    name="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-emerald-100 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="10-digit mobile number"
                  />
                </label>

                <label className="form-field block">
                  <div className="flex items-center text-xs text-emerald-700 font-semibold mb-1.5">
                    <Mail size={14} className="mr-1.5 text-emerald-600" /> Email (Optional)
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border-2 border-emerald-100 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="For admin access"
                  />
                </label>
              </div>
            ) : (
              <>
                <label className="form-field block">
                  <div className="flex items-center text-sm text-emerald-700 font-semibold mb-2">
                    <Mail size={16} className="mr-2 text-emerald-600" /> Mobile Number
                  </div>
                  <input
                    name="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-3 rounded-xl border-2 border-emerald-100 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="10-digit mobile number"
                  />
                </label>
              </>
            )}

            {isSignup && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label className="form-field block">
                    <div className="flex items-center text-xs text-emerald-700 font-semibold mb-1.5">
                      <User size={14} className="mr-1.5 text-emerald-600" /> State
                    </div>
                    <input
                      name="state"
                      value={form.state || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-emerald-100 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="e.g. Maharashtra"
                    />
                  </label>
                  <label className="form-field block">
                    <div className="flex items-center text-xs text-emerald-700 font-semibold mb-1.5">
                      District
                    </div>
                    <input
                      name="district"
                      value={form.district || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-emerald-100 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="e.g. Pune"
                    />
                  </label>
                  <label className="form-field block">
                    <div className="flex items-center text-xs text-emerald-700 font-semibold mb-1.5">
                      Land Size (Acres)
                    </div>
                    <input
                      name="landSize"
                      type="number"
                      value={form.landSize || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-emerald-100 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="e.g. 2.5"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label className="form-field block">
                    <div className="flex items-center text-xs text-emerald-700 font-semibold mb-1.5">
                      Crop Type
                    </div>
                    <input
                      name="cropType"
                      value={form.cropType || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-emerald-100 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="e.g. Rice"
                    />
                  </label>
                  <label className="form-field block">
                    <div className="flex items-center text-xs text-emerald-700 font-semibold mb-1.5">
                      Category
                    </div>
                    <select
                      name="category"
                      value={form.category || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border-2 border-emerald-100 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    >
                      <option value="">Select Category</option>
                      <option value="Small">Small Farmer</option>
                      <option value="Marginal">Marginal Farmer</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OBC">OBC</option>
                      <option value="General">General</option>
                    </select>
                  </label>
                </div>
              </>
            )}

            {isSignup ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="form-field block">
                  <div className="flex items-center text-xs text-emerald-700 font-semibold mb-1.5">
                    <Lock size={14} className="mr-1.5 text-emerald-600" /> Password
                  </div>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 pr-10 text-sm rounded-lg border-2 border-emerald-100 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      placeholder="Create password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <label className="form-field block">
                  <div className="flex items-center text-xs text-emerald-700 font-semibold mb-1.5">
                    <Lock size={14} className="mr-1.5 text-emerald-600" /> Confirm
                  </div>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 pr-10 text-sm rounded-lg border-2 bg-white focus:outline-none focus:ring-2 transition ${
                        form.confirmPassword &&
                        form.password !== form.confirmPassword
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500"
                      }`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </label>
              </div>
            ) : (
              <label className="form-field block">
                <div className="flex items-center text-sm text-emerald-700 font-semibold mb-2">
                  <Lock size={16} className="mr-2 text-emerald-600" /> Password
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-emerald-100 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}

            {isSignup && (
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  onClick={() => setForm({ ...form, role: "farmer" })}
                  className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all hover:scale-105 ${
                    form.role === "farmer"
                      ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-500 ring-2 ring-emerald-200 shadow-md"
                      : "bg-white border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <Sprout size={20} className={form.role === "farmer" ? "text-emerald-600" : "text-emerald-400"} />
                  <span className={`text-xs font-semibold mt-1 ${form.role === "farmer" ? "text-emerald-700" : "text-gray-600"}`}>
                    Farmer
                  </span>
                </div>
                <div
                  onClick={() => setForm({ ...form, role: "expert" })}
                  className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all hover:scale-105 ${
                    form.role === "expert"
                      ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-500 ring-2 ring-emerald-200 shadow-md"
                      : "bg-white border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  <Briefcase size={20} className={form.role === "expert" ? "text-emerald-600" : "text-emerald-400"} />
                  <span className={`text-xs font-semibold mt-1 ${form.role === "expert" ? "text-emerald-700" : "text-gray-600"}`}>
                    Expert
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${isSignup ? 'py-3' : 'py-3.5'} rounded-xl text-white font-bold shadow-lg transition-all hover:scale-105 ${
                loading
                  ? "opacity-70 cursor-not-allowed bg-gradient-to-r from-emerald-300 to-green-300"
                  : "bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-xl"
              }`}
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create account"
                : "Sign in"}
            </button>
          </form>

          <div className={`${isSignup ? 'mt-4' : 'mt-5'} flex flex-col sm:flex-row items-center justify-between gap-3 ${isSignup ? 'text-xs' : 'text-sm'}`}>
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition"
            >
              {isSignup
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>

            <button
              onClick={() => {
                setForm({
                  ...form,
                  email: "abc123@gmail.com",
                  password: "password",
                  confirmPassword: isSignup ? "password" : "",
                });
                toast("Demo credentials filled", { icon: "⚡️" });
              }}
              className="text-emerald-500 hover:text-emerald-600 font-medium transition"
            >
              Quick demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
