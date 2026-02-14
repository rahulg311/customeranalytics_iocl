"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Target, BarChart3, Calendar, ChevronDown, LogOut, Layers, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ic_logo from '../assets/images/ic_logo.gif';
import SectorReportTable from "./SectorReportTable";
import ZonePivotTable from "./ZonePivotTable";
// Import all necessary types


// Import all custom components


function Targetsales() {
  const router = useNavigate();
  const availableMonths = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
  
//const availableYears = [2023, 2024, 2025,2026];

  const availableYears = useMemo(() => {
  const year = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => year - i);
}, []);

  const today = new Date();
  const currentMonthName = availableMonths[today.getMonth()];
  const currentYear = today.getFullYear();
  const [gettotalSales, settotalSales] = useState("");

  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [TargetSalesMonthYear,setTargetSalesMonthYear]= useState({})
    const [ZonewiseTotal,setZonewiseTotal]= useState("")
  
  const [salesData, setSalesData] = useState({
    pp: [],
    pe: [],
    combined: [],
    sectorsDetail: null,
    sectorGroups: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false); // State for email button
useEffect(() => {
  setmonthyear(`${selectedMonth}-${selectedYear}`)
  fetchTargetSales();
  // TargetSalesMonthYearWise()
 // console.log("Selected Month:", selectedMonth);
  //console.log("Selected Year:", selectedYear);
 // console.log("Month-Year:", `${selectedMonth}-${selectedYear}`);
}, [selectedMonth, selectedYear]);

useEffect(()=>{
   setmonthyear(`${selectedMonth}-${selectedYear}`)
  TargetSalesMonthYearWise()
   TotalTargetSalesMonthYearWiseZone()
},[selectedMonth, selectedYear])


const [getmonthyear, setmonthyear] = useState("");
  //   const currentPalette = colorPalettes[activeTab];

  console.log("getmonthyear",getmonthyear)

  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetch(selectedMonth, selectedYear);
      setSalesData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };








  const fetchTargetSales = async () => {
    try {
      const response = await fetch(
        "http://10.14.84.54/customeranalytics_api/api/TargetSales/TargetSalesMonthYearWise",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monthYear: getmonthyear,
            firstDay: `${selectedYear}-${selectedMonth}-01`,
            lastDay: `${selectedYear}-${selectedMonth}-31`,
          }),
        }
      );
 console.log("data", response);
      if (!response.ok) {
        throw new Error("API request failed");
      }
      const result = await response.json();
      //console.log("result", result)

      const totalSales = result.reduce(
        (sum, item) => sum + Number(item.sales || 0),
        0
      );
      console.log("Total Sales:", totalSales);
      settotalSales(totalSales);
    }
    catch (err) {
      // setError(err.message || "Something went wrong");
    } finally {
      //  setLoading(false);
    }
  }

  const TargetSalesMonthYearWise = async () => {
    try {
      const response = await fetch(
        "http://10.14.84.54/Customeranalytics_API/api/TargetSales/TargetSalesMonthYearWise",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monthYear: getmonthyear,
            firstDay: `${selectedYear}-${selectedMonth}-01`,
            lastDay: `${selectedYear}-${selectedMonth}-31`,
          }),
        }
      );
      // const result = await response.json();
      // console.log("TargetSalesMonthYearWise", result);
      if (!response.ok) {
        throw new Error("API request failed");
      }
      const result = await response.json();
      //console.log("result", result)
   console.log("TargetSalesMonthYearWise", result);
      
      setTargetSalesMonthYear(result);
    }
    catch (err) {
      // setError(err.message || "Something went wrong");
    } finally {
      //  setLoading(false);
    }
  }

    const TotalTargetSalesMonthYearWiseZone = async () => {
    try {
      const response = await fetch(
        "http://10.14.84.54/Customeranalytics_API/api/TargetSales/ZonewiseTotalTargetSalesMonthYearWise",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monthYear: getmonthyear,
            firstDay: `${selectedYear}-${selectedMonth}-01`,
            lastDay: `${selectedYear}-${selectedMonth}-31`,
          }),
        }
      );
      // const result = await response.json();
      // console.log("TargetSalesMonthYearWise", result);
      if (!response.ok) {
        throw new Error("API request failed");
      }
      const result = await response.json();
      //console.log("result", result)
   console.log("TotalTargetSalesMonthYearWiseZone", result.lstZonewiseTotaltargetSalesRes);
      
      setZonewiseTotal(result);
    }
    catch (err) {
      // setError(err.message || "Something went wrong");
    } finally {
      //  setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchTargetSales();
  }, []);




  //   useEffect(() => {
  //     loadSalesData();
  //   }, [selectedMonth, selectedYear]);

  //   // Guard clauses at the top
  // //   if (loading) { return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>; }
  // //   if (error) { return <div className="flex items-center justify-center min-h-screen"><ErrorMessage message={error} onRetry={loadSalesData} /></div>; }
  // //   if (!salesData) { return null; }

  // //   const formatNumber = (num: number): string => {
  // //     if (isNaN(num)) return '0';
  // //     return new Intl.NumberFormat('en-IN').format(num);
  // //   };

  // //   const getAchievementColor = (achievement: number): string => {
  // //     if (achievement >= 100) return 'text-green-600 bg-green-50';
  // //     if (achievement >= 70) return 'text-amber-600 bg-amber-50';
  // //     return 'text-red-600 bg-red-50';
  // //   };

  //   const CustomTooltip = ({ active, payload, label }) => {
  //     if (active && payload && payload.length) {
  //       return (
  //         <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
  //           <p className="font-semibold text-gray-800 mb-2">{`Zone: ${label}`}</p>
  //           {payload.map((entry, index) => (
  //             <p key={index} className="text-sm" style={{ color: entry.color }}>
  //               {`${entry.name}: ${formatNumber(entry.value)}`}
  //             </p>
  //           ))}
  //         </div>
  //       );
  //     }
  //     return null;
  //   };

  const TabButton = ({ isActive, onClick, children, icon }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
      {icon} {children}
    </button>
  );

  const getCurrentDataForCharts = () => {
    // switch (activeTab) {
    //   case 'pp': return salesData.pp;
    //   case 'pe': return salesData.pe;
    //   default: return salesData.combined;
    // }
  };

  const getPivotTableProps = () => {
    switch (activeTab) {
      case 'pp': return { data: salesData, title: 'PP Sales Performance' };
      case 'pe': return { data: salesData, title: 'PE Sales Performance' };
      default: return { data: salesData.combined, title: 'Combined (PP+PE) Performance' };
    }
  };

  const currentDataForTotals = [];
  const totalTarget = currentDataForTotals.reduce((sum, item) => (activeTab === 'overview' ? sum + (item).zonalTarget : sum + (item).target), 0);
  const totalProrated = currentDataForTotals.reduce((sum, item) => sum + item.proratedTarget, 0);
  const totalActual = currentDataForTotals.reduce((sum, item) => sum + item.actualSales, 0);
  const overallAchievement = totalProrated > 0 ? Math.round((totalActual / totalProrated) * 100) : 0;

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    router.push('/');
  };

  const handleSendReport = async () => {
    setIsSending(true);
    const toastId = toast.loading('Sending email report...');

    try {
      const response = await fetch('/customeranalytics/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // MODIFIED: Removed 'recipientEmail' from the body
        body: JSON.stringify({
          // combinedData: salesData!.combined,
          // ppData: salesData!.pp,
          // peData: salesData!.pe,
          // month: selectedMonth,
          // year: selectedYear,
          // sectorsDetail: salesData!.sectorsDetail, // Add detailed sector data
          // sectorGroups: salesData!.sectorGroups, 
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }
      //   toast.success('Report sent successfully!', { id: toastId });
    } catch (error) {
      //  toast.error((error as Error).message || 'Failed to send report.', { id: toastId });
    } finally {
      setIsSending(false);
    }
  };
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* <Toaster richColors position="top-right" /> */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-xl px-4 md:p-6 bg-gradient-to-r from-blue-300 to-indigo-300 shadow-md">
          <Link href="/home" className="flex-shrink-0"> <img src={ic_logo} alt="IOCL Logo" width={56} height={56} className="h-12 w-auto md:h-14" /></Link>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">Sales Performance Dashboard</h1>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white rounded-lg shadow-md bg-red-500 hover:bg-red-600"><LogOut className="h-5 w-5" /><span>Logout</span></button>
        </header>

        {/* Month and Year Selectors */}
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex items-center gap-2 pb-2"><Calendar className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">Select Period</h3></div>
            <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1">Month</label><div className="relative"><select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]">{availableMonths.map(m => <option key={m} value={m}>{m}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }} /></div></div>
            <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1">Year</label><div className="relative"><select value={selectedYear} onChange={(e) => setSelectedYear((e.target.value))} className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]">{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }} /></div></div>
            <button onClick={loadSalesData} disabled={loading || isSending} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? 'Loading...' : 'Refresh Data'}</button>
            <button onClick={handleSendReport} disabled={loading || isSending} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-md"><Mail className="w-4 h-4" />{isSending ? 'Sending...' : 'Send Report'}</button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4">
          <TabButton isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 className="w-5 h-5" />}>PP + PE Combined</TabButton>
          <TabButton isActive={activeTab === 'pp'} onClick={() => setActiveTab('pp')} icon={<TrendingUp className="w-5 h-5" />}>PP Sales</TabButton>
          <TabButton isActive={activeTab === 'pe'} onClick={() => setActiveTab('pe')} icon={<Target className="w-5 h-5" />}>PE Sales</TabButton>
          <TabButton isActive={activeTab === 'sectors'} onClick={() => setActiveTab('sectors')} icon={<Layers className="w-5 h-5" />}>Sector Report</TabButton>
        </div>

        {/* Conditional Content Area */}
        {activeTab !== 'sectors' ? (
          <div className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between mb-4"><Target className="w-8 h-8 text-blue-600" /><span className="text-sm font-medium text-gray-500">TOTAL TARGET</span></div><p className="text-3xl font-bold text-gray-900">{TargetSalesMonthYear?.totaltarget}</p></div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between mb-4"><TrendingUp className="w-8 h-8 text-purple-600" /><span className="text-sm font-medium text-gray-500">PRORATED TARGET</span></div><p className="text-3xl font-bold text-gray-900">{TargetSalesMonthYear?.totalproratedtarget
             }</p></div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between mb-4"><BarChart3 className="w-8 h-8 text-green-600" /><span className="text-sm font-medium text-gray-500">ACTUAL SALES</span></div><p className="text-3xl font-bold text-gray-900">{TargetSalesMonthYear?.totalsales}</p></div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between mb-4"><Target className="w-8 h-8 text-orange-600" /><span className="text-sm font-medium text-gray-500">ACHIEVEMENT</span></div><p className="text-3xl font-bold">
                {TargetSalesMonthYear?.overallAchievement}%
              </p></div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />Sales Comparison by Zone</h3>
                <ResponsiveContainer width="100%" height={400}>
                  {/* <BarChart data={getCurrentDataForCharts()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="zone" tick={{ fontSize: 12 }} stroke="#6b7280" interval={0} />
                        <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                        <Tooltip content={<CustomTooltip />} /><Legend /><Bar dataKey="proratedTarget" fill={currentPalette.prorated} name="Prorated Target" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="actualSales" fill={currentPalette.actual} name="Actual Sales" radius={[2, 2, 0, 0]} />
                      </BarChart> */}
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />Achievement % by Zone</h3>
                <ResponsiveContainer width="100%" height={400}><LineChart data={getCurrentDataForCharts()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="zone" tick={{ fontSize: 12 }} stroke="#6b7280" interval={0} />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" domain={[0, 'dataMax + 20']} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    // formatter={(value: number, name: string, props: any) => {
                    //   // 'name' will be "achievement" for the first line and "100" for the second line
                    //   // 'props.dataKey' will tell you which line it is
                    //   if (props.dataKey === "achievement") {
                    //     return [`${value}%`, "Achieved Percentage"];
                    //   }

                    // }}
                    // You might also want to customize the label if "zone" is not descriptive enough
                    labelFormatter={(label) => `Zone: ${label}`}
                  />
                  {/* <Line type="monotone" dataKey="achievement" stroke={currentPalette.achievement} strokeWidth={3} dot={{ fill: currentPalette.achievement }} /> */}
                  <Line type="monotone" dataKey={() => "100"} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* New Pivot Table Section */}
            <ZonePivotTable
            ZonewiseTotal={ZonewiseTotal}
            // data={getPivotTableProps().data}
            // title={getPivotTableProps().title}
            // month={selectedMonth}
            // year={selectedYear}
            />
          </div>
        ) : (
          (
            <SectorReportTable
            // data={salesData.sectorsDetail} 
            // sectorGroups={salesData.sectorGroups}
            // month={selectedMonth} 
            // year={selectedYear} 
            />
          )
        )}

        {/* Footer */}
        <footer className="fixed bottom-0 mt-5 left-0 w-full bg-gradient-to-r from-gray-800 via-gray-900 to-black shadow-inner z-50">
          <div className="mx-auto px-4 py-4 text-center text-sm text-gray-200">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-white">
                Developed by P&BD-IS
              </span>
              . All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
export default Targetsales