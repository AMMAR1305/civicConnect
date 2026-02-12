import { useState } from "react";
import axios from "axios";
import { useNavigate , Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import login from "../assets/login.jpeg"
import login1 from "../assets/login1.jpeg"

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  // Register states
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [role, setRole] = useState("Citizen");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setType("");

    console.log("Attempting login with:", { email, hasPassword: !!password });

    try {
      const res = await axios.post(
        "http://localhost:4000/auth/login",
        {
          Email: email,
          Password: password
        }
      );

      console.log("Login response:", res.data);
      const token = res.data.token;

      // Decode JWT to get role
      const decoded = jwtDecode(token);

      console.log("JWT TOKEN:", token);
      console.log("DECODED TOKEN:", decoded);
      console.log("USER ROLE:", decoded.Role);

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", decoded.Role);

      setType("success");
      setMessage("Login successful. Redirecting...");

      setTimeout(() => {
        if (decoded.Role === "Admin") {
          navigate("/admin");
        } else if (decoded.Role === "Officer") {
          navigate("/officer");
        } else {
          navigate("/citizen");
        }
      }, 1200);

    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      setType("error");

      if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message || "Invalid credentials";
        setMessage(errorMsg);
      } else if (err.response?.status === 500) {
        setMessage("Server error. Please try again later.");
      } else if (!err.response) {
        setMessage("Cannot connect to server. Is the backend running?");
      } else {
        setMessage("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 px-4 py-6 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating City Icons */}
        <div className="absolute top-20 left-10 animate-float-slow opacity-30">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-700">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        
        <div className="absolute top-40 right-20 animate-float opacity-25">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-orange-600">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <div className="absolute bottom-32 left-1/4 animate-float-slow opacity-30">
          <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-800">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <div className="absolute top-1/3 right-10 animate-float opacity-20">
          <svg width="55" height="55" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-orange-700">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <div className="absolute bottom-20 right-1/3 animate-float-slow opacity-25">
          <svg width="65" height="65" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-900">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>

        {/* Animated Circles */}
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-36 h-36 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border-t-4 border-orange-500 relative z-10">
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(5deg); }
          }
          @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-float-slow {
            animation: float-slow 8s ease-in-out infinite;
          }
          .animate-blob {
            animation: blob 10s ease-in-out infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>

        {/* LEFT — FORM */}
        <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">
            Welcome Back
          </h1>

          <p className="text-sm sm:text-base text-gray-700 mt-2">
            Integrated Municipal Service Portal
          </p>

          {message && (
            <div
              className={`mt-4 sm:mt-5 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm
              ${type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"}`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">

            {/* EMAIL */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-blue-900 mb-1">
                Registered Email
              </label>
              <input
                type="email"
                required
                placeholder="citizen@gov.in"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-blue-900 mb-1">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 pr-10 sm:pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 rounded-lg bg-gradient-to-r from-orange-300 to-orange-400 text-white font-bold hover:from-orange-400 hover:to-orange-500 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-base sm:text-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          {/* DIVIDER */}
          {/* REGISTER LINK */}
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-700">
             Not registered yet?{" "}
          <Link
            to="/register"
            className="text-orange-600 font-semibold cursor-pointer hover:underline"
          >
            Create an account
          </Link>
        </p>


          <div className="mt-6 sm:mt-10 text-[10px] sm:text-xs text-gray-500 font-medium">
            © Municipal Digital Services Platform  
            <br />
            Authorized Users Only
          </div>
        </div>

        {/* RIGHT — ILLUSTRATION WITH BACKGROUND IMAGE */}
        <div 
          className="hidden md:flex items-center justify-center relative bg-cover bg-center min-h-[300px]"
          style={{
            backgroundImage: `url(${login})`,
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/65 to-blue-700/50"></div>

          <div className="relative z-10 text-white text-center px-6 lg:px-10 max-w-md">
            <h2 className="text-2xl lg:text-3xl font-bold drop-shadow-lg">
              Smart Digital Governance
            </h2>

            <p className="mt-3 lg:mt-4 text-sm lg:text-base text-white/90 leading-relaxed drop-shadow">
              A secure digital platform for registered citizens to submit
              complaints, track service progress, and engage with municipal
              authorities in real time.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
