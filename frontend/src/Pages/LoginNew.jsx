import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import login from "../assets/login.jpeg"
import login1 from "../assets/login1.jpeg"

const LoginNew = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

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

    try {
      const res = await axios.post(
        "http://localhost:4000/auth/login",
        {
          Email: email,
          Password: password
        }
      );

      const token = res.data.token;
      const decoded = jwtDecode(token);

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
      setType("error");
      if (err.response?.status === 400) {
        setMessage("Invalid credentials. Please check email or password.");
      } else {
        setMessage("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setType("");

    try {
      await axios.post("http://localhost:4000/auth/register", {
        name,
        email: regEmail,
        password: regPassword,
        Role: role
      });

      setType("success");
      setMessage("Registration successful! Switching to login...");

      setTimeout(() => {
        setIsLogin(true);
        setMessage("");
        setType("");
        setName("");
        setRegEmail("");
        setRegPassword("");
        setRole("Citizen");
      }, 1500);
    } catch (error) {
      setType("error");
      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl" style={{ perspective: '2000px' }}>
        <div 
          className={`relative w-full bg-white rounded-2xl shadow-2xl border-4 border-orange-500 transition-transform duration-700 ease-in-out`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isLogin ? 'rotateY(0deg)' : 'rotateY(180deg)'
          }}
        >
          {/* FRONT SIDE - LOGIN */}
          <div 
            className="absolute w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* LEFT — FORM */}
              <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">
                  Welcome Back
                </h1>

                <p className="text-sm sm:text-base text-gray-700 mt-2">
                  Integrated Municipal Service Portal
                </p>

                {message && type && isLogin && (
                  <div
                    className={`mt-4 sm:mt-5 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm
                    ${type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
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
                   <div className="relative mt-6 sm:mt-8">
                     <div className="absolute inset-0 flex items-center">
                       <div className="w-full border-t border-gray-300"></div>
                     </div>
                     <div className="relative flex justify-center text-sm">
                       <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                     </div>
                   </div>

                   {/* GOOGLE SIGN IN */}
                   <button
                     type="button"
                     onClick={() => {
                       setMessage("Google Sign-In will be implemented soon");
                       setType("success");
                       setTimeout(() => {
                         setMessage("");
                         setType("");
                       }, 3000);
                     }}
                     className="w-full mt-4 sm:mt-6 py-3 sm:py-3.5 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center gap-3 text-sm sm:text-base"
                   >
                     <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                       <path
                         fill="#4285F4"
                         d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                       />
                       <path
                         fill="#34A853"
                         d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                       />
                       <path
                         fill="#FBBC05"
                         d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                       />
                       <path
                         fill="#EA4335"
                         d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                       />
                     </svg>
                     Continue with Google
                   </button>

                   <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-700">
                     Not registered yet?{" "}
                     <span
                       onClick={() => setIsLogin(false)}
                       className="text-orange-600 font-semibold cursor-pointer hover:underline"
                     >
                       Create an account
                     </span>
                   </p>

                   <div className="mt-6 sm:mt-10 text-[10px] sm:text-xs text-gray-500 font-medium">
                     © Municipal Digital Services Platform
                     <br />
                     Authorized Users Only
                   </div>
               </div>

               {/* RIGHT — ILLUSTRATION */}
               <div
                 className="hidden md:flex items-center justify-center relative bg-cover bg-center min-h-[500px] rounded-r-2xl"
                 style={{
                   backgroundImage: `url(${login})`
                 }}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-800/15 rounded-r-2xl"></div>

                 <div className="relative z-10 text-white text-center px-6 lg:px-10 max-w-md">
                   <h2 className="text-2xl lg:text-3xl font-bold drop-shadow-lg">
                     Smart Digital Governance
                   </h2>

                   <p className="mt-3 lg:mt-4 text-sm lg:text-base text-white/95 leading-relaxed drop-shadow">
                     A secure digital platform for registered citizens to submit complaints, track service progress, and engage with municipal authorities in real time.
                   </p>
                 </div>
               </div>
             </div>
           </div>

           {/* BACK SIDE - REGISTER */}
           <div 
             className="absolute w-full h-full"
             style={{
               backfaceVisibility: 'hidden',
               WebkitBackfaceVisibility: 'hidden',
               transform: 'rotateY(180deg)'
             }}
           >
             <div className="grid grid-cols-1 md:grid-cols-2">
               {/* LEFT — ILLUSTRATION */}
               <div
                 className="hidden md:flex items-center justify-center relative bg-cover bg-center min-h-[500px] rounded-l-2xl"
                 style={{
                   backgroundImage: `url(${login1})`
                 }}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-800/15 rounded-l-2xl"></div>

                 <div className="relative z-10 text-white text-center px-6 lg:px-10 max-w-md">
                   <h2 className="text-2xl lg:text-3xl font-bold drop-shadow-lg">
                     Join Digital Governance
                   </h2>

                   <p className="mt-3 lg:mt-4 text-sm lg:text-base text-white/95 leading-relaxed drop-shadow">
                     Register now to access municipal services, submit complaints, track progress, and participate in civic engagement initiatives.
                   </p>
                 </div>
               </div>

               {/* RIGHT — FORM */}
               <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
                 <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">
                   Create Account
                 </h1>

                 <p className="text-sm sm:text-base text-gray-700 mt-2">
                   Register to access Municipal Services
                 </p>

                 {message && type && !isLogin && (
                   <div
                     className={`mt-4 sm:mt-5 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm
                     ${type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                   >
                     {message}
                   </div>
                 )}

                 <form onSubmit={handleRegister} className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3">
                     <div>
                       <label className="block text-xs sm:text-sm font-semibold text-blue-900 mb-1">
                         Full Name
                       </label>
                       <input
                         type="text"
                         required
                         placeholder="Enter your full name"
                         className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                       />
                     </div>

                     <div>
                       <label className="block text-xs sm:text-sm font-semibold text-blue-900 mb-1">
                         Email Address
                       </label>
                       <input
                         type="email"
                         required
                         placeholder="citizen@gov.in"
                         className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                         value={regEmail}
                         onChange={(e) => setRegEmail(e.target.value)}
                       />
                     </div>

                     <div>
                       <label className="block text-xs sm:text-sm font-semibold text-blue-900 mb-1">
                         Password
                       </label>
                       <div className="relative">
                         <input
                           type={showRegPassword ? "text" : "password"}
                           required
                           placeholder="Create a strong password"
                           className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 pr-10 sm:pr-12"
                           value={regPassword}
                           onChange={(e) => setRegPassword(e.target.value)}
                         />
                         <button
                           type="button"
                           className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700"
                           onClick={() => setShowRegPassword(!showRegPassword)}
                         >
                           {showRegPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                         </button>
                       </div>
                     </div>

                     <div>
                       <label className="block text-xs sm:text-sm font-semibold text-blue-900 mb-1">
                         Register As
                       </label>
                       <select
                         value={role}
                         onChange={(e) => setRole(e.target.value)}
                         className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                       >
                         <option value="Citizen">Citizen</option>
                         <option value="Officer">Municipal Officer</option>
                       </select>
                     </div>

                     <button
                       type="submit"
                       disabled={loading}
                       className="w-full py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-orange-300 to-orange-400 text-white font-bold hover:from-orange-400 hover:to-orange-500 transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-base sm:text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                       {loading ? (
                         <>
                           <Loader2 className="animate-spin" size={18} />
                           Creating Account...
                         </>
                       ) : (
                         <>
                           <UserPlus size={18} />
                           Register
                         </>
                       )}
                     </button>
                   </form>

                   <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-gray-700 text-center">
                     Already have an account?{" "}
                     <span
                       onClick={() => setIsLogin(true)}
                       className="text-orange-600 font-semibold cursor-pointer hover:underline"
                     >
                       Login here
                     </span>
                   </p>

                   <div className="mt-2.5 sm:mt-3 text-[10px] sm:text-xs text-gray-500 font-medium text-center">
                     © Municipal Digital Services Platform
                     <br />
                     Authorized Users Only
                   </div>
               </div>
             </div>
           </div>

         </div>
       </div>
     </div>
   );
 };

 export default LoginNew;
