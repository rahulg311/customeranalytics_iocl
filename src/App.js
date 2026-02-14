import logo from './logo.svg';
import {react, useEffect} from 'react';
import './App.css';
import { Routes, Route } from "react-router-dom";
import Login from "./Backend/Login.jsx";
import Dashboard from "./Dashbord/dashboard.jsx";
import SessionProvider from "./context/sessionContext";
import { BrowserRouter } from "react-router-dom";
import Targetsales from './targetsales/page.jsx';
import Footer from './components/footer.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import SectorReport from './targetsales/SectorReport.jsx';
import UplodeTargetSale from './targetsales/UplodeTargetSale.jsx';
import AppPerformance from './targetsales/AppPerformance.jsx';

import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import { ExcelExportModule } from "ag-grid-enterprise";
import "ag-grid-enterprise";

ModuleRegistry.registerModules([ExcelExportModule]);


ModuleRegistry.registerModules([AllCommunityModule]);
function App() {
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.clear(); // clear session on browser/tab close
    };

    // window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);
  return (
    <SessionProvider>
      <BrowserRouter>
      <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/targetsales/page" element={<ProtectedRoute><Targetsales/></ProtectedRoute>}/>
      <Route path="/SectorReport" element={<ProtectedRoute><SectorReport /></ProtectedRoute>} />
      <Route path="/UplodeTargetSales" element={<ProtectedRoute><UplodeTargetSale /></ProtectedRoute>} />
       <Route path="/AppPerformance" element={<ProtectedRoute><AppPerformance /></ProtectedRoute>} />

        
    </Routes>
    </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
