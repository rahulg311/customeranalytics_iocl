"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  Target,
  BarChart3,
  Calendar,
  ChevronDown,
  LogOut,
  Layers,
  X,
  Mail,
  Upload,
  FileSpreadsheet,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { RingLoader } from "react-spinners";

import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ic_logo from "../assets/images/ic_logo.gif";
import SectorReportTable from "./SectorReportTable";
import ZonePivotTable from "./ZonePivotTable";
import withSessionContext from "../HOC/withSessionContext";
import Header from "../components/header";
import Footer from "../components/footer";
import OverallSectorReportTable from "./OverallSectorReportTable";
// Import all necessary types

// Import all custom components

function SectorReport(props) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedExcelData, setUploadedExcelData] = useState([]);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [uploadFileName, setUploadFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [duplicateGrades, setDuplicateGrades] = useState(new Set());
  const [invalidValueRows, setInvalidValueRows] = useState(new Set());

  const availableMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const today = new Date();
  const currentMonthName = availableMonths[today.getMonth()];
  const currentYear = today.getFullYear();

  const [activeTab, setActiveTab] = useState("sectors");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [TargetSalesMonthYear, setTargetSalesMonthYear] = useState({});
  const [ZonewiseTotal, setZonewiseTotal] = useState("");
  const [ZonewisehartData, setZonewisechartData] = useState();
  const [chartData, setChartData] = useState([]);
  const [getmonthyear, setmonthyear] = useState("");
  const [sectorData, setSectorData] = useState([]);
  console.log("getmonthyear", getmonthyear);

  const [getlastday, setlastday] = useState("");

  const getMonthIndex = (monthName) =>
    new Date(Date.parse(monthName + ", 2012")).getMonth();

  const getMMYYYYFormat = (monthName, year) => {
    const month = String(getMonthIndex(monthName) + 1).padStart(2, "0");
    return `${month}-${year}`;
  };

  const getFirstDayOfMonth = (year, monthName) => {
    const monthIndex = getMonthIndex(monthName);
    const date = new Date(year, monthIndex, 1);

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  const getLastDayOfMonth2 = (year, monthName) => {
    const monthIndex = getMonthIndex(monthName);
    const date = new Date(year, monthIndex + 1, 0);

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  const getLastDayOfMonth = (year, monthName) => {
    const monthIndex = getMonthIndex(monthName);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const cuurentYear = today.getFullYear();
    console.log("todaygetmont", currentMonth);
    console.log("getFullYear", cuurentYear);
    // If current month & year → today - 1
    if (year == cuurentYear && monthIndex == currentMonth) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const y = yesterday.getFullYear();
      const m = String(yesterday.getMonth() + 1).padStart(2, "0");
      const d = String(yesterday.getDate()).padStart(2, "0");

      return `${y}-${m}-${d}`;
    }

    // Otherwise → last day of selected month
    const date = new Date(year, monthIndex + 1, 0);

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  const getYesterdayFormatted = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
    console.log("Yesterday", getYesterdayFormatted());
  };

  const calculateYearMonth = (target, year, monthName) => {
    // debugger;
    const now = new Date();
    const requestedMonthIndex = getMonthIndex(monthName);
    const requestedYear = year;
    now.setHours(0, 0, 0, 0);

    // Past month → full target
    if (requestedYear < now.getFullYear()) {
      return 1;
    }

    // Future month → 0
    if (requestedMonthIndex === now.getMonth()) {
      return 0;
    }
  };

  let zonedata = props.sessionContext?.logininPlantData?.zone_code ?? [];

  console.log("zonedata", zonedata);

  const router = useNavigate();

  //const availableYears = [2023, 2024, 2025,2026];

  const availableYears = useMemo(() => {
    const year = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => year - i);
  }, []);

  const [salesData, setSalesData] = useState({
    pp: [],
    pe: [],
    combined: [],
    sectorsDetail: null,
    sectorGroups: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false); // State for email button
  useEffect(() => {
    setmonthyear(`${selectedMonth}-${selectedYear}`);
    TargetSalesMonthYearWise(activeTab, getmonthyear);
    // TotalTargetSalesMonthYearWiseZone(activeTab, getmonthyear);
    SectorReport(getmonthyear);
  }, []);

  const loadSalesData = async () => {
    setmonthyear(`${selectedMonth}-${selectedYear}`);
    TargetSalesMonthYearWise(activeTab, getmonthyear);
    // TotalTargetSalesMonthYearWiseZone(activeTab, getmonthyear);
    SectorReport(getmonthyear);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    TargetSalesMonthYearWise(tab, getmonthyear);
    // TotalTargetSalesMonthYearWiseZone(tab, getmonthyear);
  };

  const TargetSalesMonthYearWise = async (activeTab, getmonthyearss) => {
    try {
      setLoading(false);
      let URL = "http://10.14.84.54/Customeranalytics_API/api/TargetSales/";

      // console.log("URLactiveTab",activeTab)

      if (activeTab == "pp") {
        URL = URL + "TargetSalesMonthYearWisePP";
        console.log("URL 1", URL);
      } else if (activeTab == "pe") {
        URL = URL + "TargetSalesMonthYearWisePE";
        console.log("URL 2", URL);
      } else {
        URL = URL + "TargetSalesMonthYearWise";
        console.log("URL 3", URL);
      }
      let today = new Date();

      // current month ka ek din pehle
      let currentMonthLastDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 1,
      );

      // previous month ka last day
      let previousMonthLastDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        0,
      );
      function formatDate(date) {
        return date.toISOString().split("T")[0];
      }

      let Calculatecurrectdaymonthyear = calculateYearMonth(
        0,
        selectedYear,
        selectedMonth,
      );

      if (Calculatecurrectdaymonthyear === 0) {
        setlastday(getLastDayOfMonth(selectedYear, selectedMonth));
        console.log("LastDay", getLastDayOfMonth(selectedYear, selectedMonth));
      } else {
        console.log("LastDay", getLastDayOfMonth2(selectedYear, selectedMonth));
      }

      let res = JSON.stringify({
        monthYear: `${selectedMonth}-${selectedYear}`,
        firstDay: `${selectedYear}-${selectedMonth}-01`,
        lastDay:
          Calculatecurrectdaymonthyear === 0
            ? getLastDayOfMonth(selectedYear, selectedMonth)
            : getLastDayOfMonth2(selectedYear, selectedMonth),
      });

      console.log("currentMonthLastDay", res);

      console.log("FirstDay", getFirstDayOfMonth(selectedYear, selectedMonth));

      //  let lstdate = getLastDayOfMonth(selectedYear,selectedMonth);
      //  let currentdatetime = String(date.getDate()).padStart(2, "0");

      //console.log("LastDay", currentdatetime)

      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthYear: selectedMonth + "-" + selectedYear,
          firstDay: `${selectedYear}-${selectedMonth}-01`,

          lastDay:
            Calculatecurrectdaymonthyear === 0
              ? getLastDayOfMonth(selectedYear, selectedMonth)
              : getLastDayOfMonth2(selectedYear, selectedMonth),

          zone_code: `${zonedata}`,
        }),
      });
      setLoading(true);
      if (!response.ok) {
        throw new Error("API request failed");
      }
      const result = await response.json();
      // console.log("result", result)
      console.log(
        "TargetSalesMonthYearWise sddd",
        result.totalsales,
        result.totaltarget,
      );
      setTargetSalesMonthYear(result);
      console.log("TargetSalesMonthYearWise result", result);
    } catch (err) {
      // setError(err.message || "Something went wrong");
    } finally {
      //  setLoading(false);
    }
  };

  // const TotalTargetSalesMonthYearWiseZone = async (activeTab) => {
  //   try {
  //     console.log("getmonthyear1", getmonthyear);
  //     let URL = "http://10.14.84.54/Customeranalytics_API/api/TargetSales/";

  //     if (activeTab == "pp") {
  //       URL = URL + "ZonewiseTotalTargetSalesMonthYearWisePP";
  //       console.log("URL 1", URL);
  //     } else if (activeTab == "pe") {
  //       URL = URL + "ZonewiseTotalTargetSalesMonthYearWisePE";
  //       console.log("URL 2", URL);
  //     } else {
  //       URL = URL + "ZonewiseTotalTargetSalesMonthYearWise";
  //       console.log("URL 3", URL);
  //     }

  //     let Calculatecurrectdaymonthyear = calculateYearMonth(
  //       0,
  //       selectedYear,
  //       selectedMonth,
  //     );

  //     if (Calculatecurrectdaymonthyear === 0) {
  //       console.log("LastDay", getLastDayOfMonth(selectedYear, selectedMonth));
  //     } else {
  //       console.log("LastDay", getLastDayOfMonth2(selectedYear, selectedMonth));
  //     }

  //     let res = JSON.stringify({
  //       monthYear: selectedMonth + "-" + selectedYear,
  //       firstDay: `${selectedYear}-${selectedMonth}-01`,
  //       lastDay:
  //         Calculatecurrectdaymonthyear === 0
  //           ? getLastDayOfMonth(selectedYear, selectedMonth)
  //           : getLastDayOfMonth2(selectedYear, selectedMonth),
  //     });

  //     console.log("requestparam", res);

  //     const response = await fetch(URL, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         monthYear: selectedMonth + "-" + selectedYear,
  //         firstDay: `${selectedYear}-${selectedMonth}-01`,
  //         lastDay:
  //           Calculatecurrectdaymonthyear === 0
  //             ? getLastDayOfMonth(selectedYear, selectedMonth)
  //             : getLastDayOfMonth2(selectedYear, selectedMonth),

  //         zone_code: `${zonedata}`,
  //       }),
  //     });
  //     if (!response.ok) {
  //       throw new Error("API request failed");
  //     }
  //     const result = await response.json();
  //     //  console.log("resultddd" , selectedMonth,selectedYear, result);
  //     // console.log("result" + activeTab, result);
  //     // console.log("TotalTargetSalesMonthYearWiseZone", result);

  //     //setZonewiseTotal(result);

  //     const zoneList = Array.isArray(result.lstZonewiseTotaltargetSalesRes)
  //       ? result.lstZonewiseTotaltargetSalesRes
  //       : [];

  //     // Prepare chart data
  //     const chartData = zoneList.map((zone) => ({
  //       zone: zone.zone || "Unknown",
  //       achievement: Number(zone.totalAchievement) || 0,
  //     }));

  //     let data = result?.lstZonewiseTotaltargetSalesRes?.map((i, key) => ({
  //       zone: i.zone,
  //       proratedTarget: i.totalProratedtarget,
  //       actualSales: i.totalsales,
  //     }));
  //     console.log("resultresult",result)
  //     // Update state
  //     setZonewiseTotal(result); // For any table or display
  //     setZonewisechartData(chartData); // For the chart
  //     setChartData(data);
  //   } catch (err) {
  //     // setError(err.message || "Something went wrong");
  //   } finally {
  //     //  setLoading(false);
  //   }
  // };

  const SectorReport = async (getmonthyear) => {
    try {
      let Calculatecurrectdaymonthyear = calculateYearMonth(
        0,
        selectedYear,
        selectedMonth,
      );

      if (Calculatecurrectdaymonthyear === 0) {
        console.log("LastDay", getLastDayOfMonth(selectedYear, selectedMonth));
      } else {
        console.log("LastDay", getLastDayOfMonth2(selectedYear, selectedMonth));
      }

      let res = JSON.stringify({
        monthYear: selectedMonth + "-" + selectedYear,
        firstDay: `${selectedYear}-${selectedMonth}-01`,
        lastDay:
          Calculatecurrectdaymonthyear === 0
            ? getLastDayOfMonth(selectedYear, selectedMonth)
            : getLastDayOfMonth2(selectedYear, selectedMonth),
        zone_code: `${zonedata}`,
      });

      console.log("SectorReport", res);

      let URL =
        "http://10.14.84.54/Customeranalytics_API/api/TargetSales/ZoneSegmentTargetVsSales";
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthYear: selectedMonth + "-" + selectedYear,
          firstDay: `${selectedYear}-${selectedMonth}-01`,
          lastDay:
            Calculatecurrectdaymonthyear === 0
              ? getLastDayOfMonth(selectedYear, selectedMonth)
              : getLastDayOfMonth2(selectedYear, selectedMonth),
          zone_code: `${zonedata}`,
        }),
      });
      if (!response.ok) {
        throw new Error("API request failed");
      }
      const result = await response.json();
      console.log("SectorReport", result);
      setSectorData(result);
    } catch (err) {
      // setError(err.message || "Something went wrong");
    } finally {
      //  setLoading(false);
    }
  };



  
  const TabButton = ({ isActive, onClick, children, icon }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isActive ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
    >
      {icon} {children}
    </button>
  );

  const colorPalettes = {
    overview: {
      prorated: "#3b82f6",
      actual: "#10b981",
      achievement: "#f59e0b",
    },
    pp: { prorated: "#8b5cf6", actual: "#4f46e5", achievement: "#a855f7" },
    pe: { prorated: "#2dd4bf", actual: "#06b6d4", achievement: "#14b8a6" },
    sectors: { prorated: "#f97316", actual: "#ec4899", achievement: "#84cc16" },
    overallSectors: {
      prorated: "#f97316",
      actual: "#ec4899",
      achievement: "#84cc16",
    },
    uploadExcel: {
      prorated: "#3b82f6",
      actual: "#10b981",
      achievement: "#f59e0b",
    },
  };

  const currentPalette = colorPalettes[activeTab] || colorPalettes.overview;

  const getCurrentDataForCharts = () => {
    switch (activeTab) {
      case "pp":
        return salesData.pp;
      case "pe":
        return salesData.pe;
      default:
        return salesData.combined;
    }
  };

  // const chartData = [];

  const currentDataForTotals = [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    router.push("/");
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* <Toaster richColors position="top-right" /> */}
      <Header />
      {loading ? (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
          {/* Header */}

          {/* Month and Year Selectors */}
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex items-center gap-2 pb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                  Select Period
                </h3>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                  >
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              </div>
              <button
                onClick={loadSalesData}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Refresh Data
              </button>
              {/* <button onClick={handleSendReport} disabled={loading || isSending} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-md"><Mail className="w-4 h-4" />{isSending ? 'Sending...' : 'Send Report'}</button> */}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* <TabButton isActive={activeTab === 'overview'} onClick={() => handleTabChange('overview')} icon={<BarChart3 className="w-5 h-5" />}>PP + PE Combined</TabButton>
                    <TabButton isActive={activeTab === 'pp'} onClick={() => handleTabChange('pp')} icon={<TrendingUp className="w-5 h-5" />}>PP Sales</TabButton>
                    <TabButton isActive={activeTab === 'pe'} onClick={() => handleTabChange('pe')} icon={<Target className="w-5 h-5" />}>PE Sales</TabButton> */}
            <TabButton
              isActive={activeTab === "sectors"}
              onClick={() => handleTabChange("sectors")}
              icon={<Layers className="w-5 h-5" />}
            >
              Sector Report
            </TabButton>
            <TabButton
              isActive={activeTab === "overallSectors"}
              onClick={() => handleTabChange("overallSectors")}
              icon={<Layers className="w-5 h-5" />}
            >
              Overall Sector Report
            </TabButton>
            {/* <input
                        type="file"
                        ref={fileInputRef}
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="excel-upload-direct"
                    />
                    <label
                        htmlFor="excel-upload-direct"
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-all ${activeTab === 'uploadExcel' ? 'bg-blue-600 text-white shadow-lg' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                        <Upload className="w-5 h-5" />
                        {isUploading ? 'Uploading...' : 'Upload Target Sales'}
                    </label> */}
          </div>

          {/* Conditional Content Area */}
          {activeTab === "sectors" ? (
            <SectorReportTable
              data={sectorData}
              // sectorGroups={salesData.sectorGroups}
              // month={selectedMonth}
              // year={selectedYear}
            />
          ) : activeTab === "overallSectors" ? (
            <OverallSectorReportTable data={sectorData} />
          ) : null}

          {/* Footer */}
        </div>
      ) : (
        <div style={styles.container}>
          <div style={styles.loaderBox}>
            <RingLoader size={100} color="#3498db" loading={!loading} />
            <p style={styles.text}>Loading Data...</p>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
const styles = {
  container: {
    // position: "fixed",
    // top: 0,
    // left: 0,
    width: "100%",
    height: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(255,255,255,0.7)", // optional
    // zIndex: 9999,
  },
  loaderBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  text: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
  },
};
export default withSessionContext(SectorReport);
