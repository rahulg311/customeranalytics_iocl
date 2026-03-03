import React, { useState, useTransition } from 'react';
import axios from "axios";
import { Eye, EyeOff, Lock, User, AlertTriangle } from 'lucide-react';
import Propel from '../assets/images/propel.jpg';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import withSessionContext from '../HOC/withSessionContext';
import { ToastContainer, toast } from "react-toastify";
import { url } from "../utils/url";

function Login(props) {

  console.log("url",url)

const containerVariants= {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const itemVariants= {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};


 const [loading, setLoading] = useState(false);


 const [isPending, startTransition] = useTransition();
  const [error, setError] = useState();
    const [showPassword, setShowPassword] = useState(false);
    const [result, setResult] = useState("");

    const [username,setUsername] =useState("")
 const [password, setPassword] = useState("");

const usenavigate = useNavigate();
 const handleInputChange = (e) => {
    const name = e.target.value;
    setUsername(name);
    console.log(name)
  };
   const handleinputpassword = (e) => {
    const name = e.target.value;
    setPassword(name);
    console.log(name)
  };

  const togglePasswordVisibility = () => { 
    setShowPassword(!showPassword);
  console.log(showPassword)
  }
    // https://bdintranet.indianoil.in/LoginAPI/api/loginauth2

  //  " /customeranalytics/api/login"

const handleSubmit = async () => {
  try {
const res = await fetch(
  "https://bdintranet.indianoil.in/LoginAPI/api/loginauth2",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
   
    }),
  }
); 
if (!res.ok) {
  throw new Error("Login API failed");
}
const data = await res.json();   // 🔥 IMPORTANT
// console.log("login response data", data)

    if (data[0].auth_status == true) {
          toast.success("Login Successful")
        
      console.log("loginauth1",data);
    const response =  await props.sessionContext.post({ 
      url:url.adminLogin,
       data:  {
         personalNo: username,
      },
    }
    );
       console.log("loginauth2",response);
    if (response.status == true) { 
         props.sessionContext._setState((state) => ({
        ...state,
        logininPlantData: response,
      }));  
    
        setTimeout(()=>{
 usenavigate("/dashboard", {
           // state: propData,
        });
          },1000)
       

        // login success ke baad
sessionStorage.setItem("token", response.token);
// ya
localStorage.setItem("token", response.token);

    }
        else {
          
          toast.error(response.strmessage)
          return
        }    
      } else{
         toast.error("Incorrect username or password")
      }
  } catch (error) {

    console.error("Error:", error);
  }
};


  return (
     <div className="min-h-screen w-full bg-slate-900 text-white relative">
        <ToastContainer/>
      {/* Background Image - Using modern Next.js Image props */}
      {/* <img
        src={Propel} // Make sure this image is in your /public folder
        alt="Petrochemical facility background"
        fill
        className="object-cover opacity-10 z-0" // Slightly more visible background
      /> */}
      {/* UPDATED GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/80 to-indigo-900/70 z-10" />

      <div className="relative z-20 min-h-screen grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-black/10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <img
                    src={Propel}
                    alt="Propel Logo"
                    width={300}
                    height={200}
                    className="mx-auto mb-6"
                />
                <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tighter text-white">
                   Petrochemical 
                    <br />
                    Sales Analytics
                </h1>
                <p className="mt-4 text-lg text-slate-300">
                    Unlock insights. Drive growth.
                </p>
            </motion.div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex items-center justify-center p-6 sm:p-8">
          <motion.div
            className="w-full max-w-md space-y-8 bg-slate-800/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-400/20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="text-center" variants={itemVariants}>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-slate-400 mt-2">Sign in to access</p>
            </motion.div>

            <div className="space-y-6">
              <motion.div className="space-y-2" variants={itemVariants}>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300">
                  Employee Number
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    id="username" name="username" type="text" required
                    value={username}
                    onChange={handleInputChange}
                    placeholder="Enter your EMP NO"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800/50 border border-slate-600 focus:ring-2 focus:ring-orange-500 focus:bg-slate-700/50 focus:border-orange-500 transition-all duration-300 outline-none"
                  />
                </div>
              </motion.div>

              <motion.div className="space-y-2" variants={itemVariants}>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password" name="password" required
                    type={showPassword ? 'text' : 'password'}
                   value={password}
        onChange={handleinputpassword} disabled={isPending}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 rounded-lg bg-slate-800/50 border border-slate-600 focus:ring-2 focus:ring-orange-500 focus:bg-slate-700/50 focus:border-orange-500 transition-all duration-300 outline-none"
                  />
                  <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showPassword ? <EyeOff className="h-5 w-5 text-slate-400 hover:text-white" /> : <Eye className="h-5 w-5 text-slate-400 hover:text-white" />}
                  </button>
                </div>
              </motion.div>

              {/* {error && <FormError message={error} />} */}

              <motion.div className="flex items-center justify-between" variants={itemVariants}>
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" disabled={isPending}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-orange-500 focus:ring-orange-500" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors">
                  Forgot Password?
                </a>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button type="submit" onClick={handleSubmit}
                  className="w-full flex justify-center py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform
                             bg-gradient-to-r from-amber-500 to-orange-600
                             hover:from-amber-600 hover:to-orange-700
                             hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                  Sign In
                </button>
              </motion.div>
            </div>
            
          </motion.div>
        </div>
      </div>
    
    </div>
  )
  
}

export default withSessionContext(Login)