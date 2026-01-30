// src/pages/Auth.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Send, User, Mail, Lock, Eye, EyeOff, Sprout, Briefcase } from "lucide-react";
import bgVideo from "../assets/background.mp4";

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
            email: form.email, // Optional, for admin check
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
      // Trigger custom event to update auth state in App.jsx
      window.dispatchEvent(new Event("auth-change"));
      toast.success(
        isSignup ? "🎉 Signup successful!" : "✅ Login successful!"
      );
      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Auth error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-y-auto">
 
      {/* subtle tint + blur overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-600/20 via-teal-500/12 to-white/10 -z-10" />

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-1 gap-3 items-center relative z-10">
        {/* Illustration / Brand */}
        <div className="hidden md:flex flex-row items-center gap-4 justify-center rounded-2xl p-3 bg-white/40 border border-cyan-100 shadow-xl backdrop-blur-sm h-20 ">
          <div className="w-12 h-12 p-3 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-2xl my-auto">
            <Send size={40} />
          </div>

          <h1 className="text-2xl font-extrabold text-teal-700 mb-2">
            TravelSync
          </h1>
        </div>

        {/* Auth Form */}
        <div className="bg-white/95 rounded-2xl p-6 md:p-8 shadow-2xl border border-cyan-100 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-teal-700">
                {isSignup ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {isSignup
                  ? "Sign up to create groups and share live locations."
                  : "Sign in to continue to TravelSync."}
              </p>
            </div>

            <div className="text-xs text-slate-400">
              Secure · Fast · Private
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <label className="block">
                <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                  <User size={14} className="mr-2 text-cyan-600" /> Full name
                </div>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  placeholder="Your full name"
                />
              </label>
            )}

            <label className="block">
              <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                <Mail size={14} className="mr-2 text-cyan-600" /> Mobile Number
              </div>
              <input
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                placeholder="10-digit mobile number"
              />
            </label>

            {/* Admin Email (Hidden/Optional) - shown only if specific sequence or just let them upgrade later? 
                Actually, the requirements say "make jadhavatharv215@gmail.com as a admin email".
                So we should add an Email field too, but optional?
                Let's double check requirement: "by usiing mobile number the login and signin shuold happen". 
                "admin email ... as admin email". 
                So maybe I should keep Email field for signup, but Login is Mobile?
                Or just add Email as optional field in Signup.
             */}
            {isSignup && (
              <label className="block">
                <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                  <Mail size={14} className="mr-2 text-cyan-600" /> Email (Optional)
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  placeholder="For admin access"
                />
              </label>
            )}

            {isSignup && (
              <>
                 <label className="block">
                  <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                    <User size={14} className="mr-2 text-cyan-600" /> State
                  </div>
                  <input
                    name="state"
                    value={form.state || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                    placeholder="e.g. Maharashtra"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                      District
                    </div>
                    <input
                      name="district"
                      value={form.district || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                      placeholder="e.g. Pune"
                    />
                  </label>
                   <label className="block">
                    <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                      Land Size (Acres)
                    </div>
                    <input
                      name="landSize"
                      type="number"
                      value={form.landSize || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                      placeholder="e.g. 2.5"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                      Crop Type
                    </div>
                    <input
                      name="cropType"
                      value={form.cropType || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                      placeholder="e.g. Rice"
                    />
                  </label>
                   <label className="block">
                    <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                      Category
                    </div>
                    <select
                      name="category"
                      value={form.category || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
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
              // Signup: Password fields side by side
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                    <Lock size={14} className="mr-2 text-cyan-600" /> Password
                  </div>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                      placeholder="Create password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                    <Lock size={14} className="mr-2 text-cyan-600" /> Confirm
                  </div>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                        form.confirmPassword &&
                        form.password !== form.confirmPassword
                          ? "border-red-300 focus:ring-red-200"
                          : "border-cyan-100 focus:ring-cyan-200"
                      }`}
                      placeholder="Confirm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </label>
              </div>
            ) : (
              // Login: Single password field
              <label className="block">
                <div className="flex items-center text-sm text-teal-700 font-medium mb-2">
                  <Lock size={14} className="mr-2 text-cyan-600" /> Password
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-cyan-100 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}

            {isSignup && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  onClick={() => setForm({ ...form, role: "farmer" })}
                  className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center transition ${
                    form.role === "farmer"
                      ? "bg-teal-50 border-teal-500 ring-1 ring-teal-500"
                      : "bg-white border-cyan-100 hover:bg-slate-50"
                  }`}
                >
                  <Sprout size={24} className={form.role === "farmer" ? "text-teal-600" : "text-slate-400"} />
                  <span className={`text-sm font-medium mt-2 ${form.role === "farmer" ? "text-teal-700" : "text-slate-500"}`}>
                    Farmer
                  </span>
                </div>
                <div
                  onClick={() => setForm({ ...form, role: "expert" })}
                  className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center transition ${
                    form.role === "expert"
                      ? "bg-teal-50 border-teal-500 ring-1 ring-teal-500"
                      : "bg-white border-cyan-100 hover:bg-slate-50"
                  }`}
                >
                  <Briefcase size={24} className={form.role === "expert" ? "text-teal-600" : "text-slate-400"} />
                  <span className={`text-sm font-medium mt-2 ${form.role === "expert" ? "text-teal-700" : "text-slate-500"}`}>
                    Expert
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-full text-white font-semibold shadow-md transition ${
                loading
                  ? "opacity-70 cursor-not-allowed bg-gradient-to-r from-cyan-300 to-teal-300"
                  : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-105"
              }`}
            >
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create account"
                : "Sign in"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-cyan-600 hover:underline"
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
              className="text-slate-500 hover:text-slate-700"
            >
              Quick demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
