import {React, useState, useEffect} from 'react'
import ic_logo from '../assets/images/ic_logo.gif';
import { useNavigate } from "react-router-dom";
import withSessionContext from '../HOC/withSessionContext';
import { LogOut, ChevronDown, User } from "lucide-react";
function Header(props) {
    
 let zonedata = props.sessionContext?.logininPlantData?.zone_code ?? []

 let UserNamelogin = props.sessionContext?.logininPlantData?.userName ?? []




   const [open, setOpen] = useState(false);

   const [loginTime, setLoginTime] = useState("");

useEffect(() => {
  const now = new Date();

  const formattedDateTime = now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  setLoginTime(formattedDateTime);
}, []);

useEffect(() => {
  const handleClickOutside = () => setOpen(false);
  if (open) document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, [open]);


  console.log("zonedata",zonedata)

    const signout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/";
  };
const usenavigate = useNavigate();

//   const logout = async () => {
//     await props.sessionContext.signout();
//     usenavigate("/");
//   };
   const logout = async () => {
    if (props.sessionContext?.signout) {
      await props.sessionContext.signout();
    }
    sessionStorage.clear(); // clear session
    usenavigate("/", { replace: true }); // redirect login
  };
  return (
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-xl px-4 md:p-6 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 dark:from-blue-900 dark:via-indigo-800 dark:to-purple-900 shadow-md">
          <a href="/home" className="flex-shrink-0">
            <img src={ic_logo} alt="IOCL Logo" width={56} height={56} className="h-12 w-auto md:h-14" />
          </a>
          <div className="text-center">
             <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-blue-700 via-cyan-700 to-green-900 bg-clip-text text-transparent">
                  Petrochemical Sales Analytics
                </span>
            </h1>
          </div>
          {/* Profile / Logout Dropdown */}
    <div className="relative flex items-center gap-3">
   <div className="flex flex-col items-start gap-1">
  
  <p className="font-medium whitespace-nowrap">
    Welcome :
    <span className="font-semibold"> {UserNamelogin}</span>
  </p>

  <p className="font-medium whitespace-nowrap">
    Zone :
    <span className="font-semibold"> {zonedata}</span>
  </p>
 <p className="text-sm text-gray-700 whitespace-nowrap">
  Login Time :
  <span className="font-semibold"> {loginTime}</span>
</p>

</div>
    
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // 🔥 IMPORTANT
          setOpen(!open);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
      >
      <User className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 
                   bg-white rounded-lg shadow-lg z-50">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
        </header>

  )
}

export default withSessionContext(Header)