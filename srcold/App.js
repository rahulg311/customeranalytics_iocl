import logo from './logo.svg';
import './App.css';
import { Routes, Route } from "react-router-dom";
import Login from "./Backend/Login.jsx";
import Dashboard from "./Dashbord/dashboard.jsx";
import SessionProvider from "./context/sessionContext";
import { BrowserRouter } from "react-router-dom";
import Targetsales from './targetsales/page.jsx';
function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
   <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/targetsales/page" element={<Targetsales/>}/>
    </Routes>
    </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
