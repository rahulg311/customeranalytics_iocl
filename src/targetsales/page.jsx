"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { TrendingUp, Target, BarChart3, Calendar, ChevronDown, LogOut, Layers, X, Mail, Upload, FileSpreadsheet, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from "xlsx"
import { RingLoader } from "react-spinners";

import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ic_logo from '../assets/images/ic_logo.gif';
import SectorReportTable from "./SectorReportTable";
import ZonePivotTable from "./ZonePivotTable";
import withSessionContext from '../HOC/withSessionContext';
import Header from '../components/header';
import Footer from '../components/footer';
import OverallSectorReportTable from './OverallSectorReportTable'
// Import all necessary types


// Import all custom components


function Targetsales(props) {

    
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedExcelData, setUploadedExcelData] = useState([]);
    const [excelHeaders, setExcelHeaders] = useState([]);
    const [uploadFileName, setUploadFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const [duplicateGrades, setDuplicateGrades] = useState(new Set());
    const [invalidValueRows, setInvalidValueRows] = useState(new Set());

    const availableMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]; 
    const today = new Date();
    const currentMonthName = availableMonths[today.getMonth()];
    const currentYear = today.getFullYear();

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [TargetSalesMonthYear, setTargetSalesMonthYear] = useState({})
    const [ZonewiseTotal, setZonewiseTotal] = useState("")
    const [ZonewisehartData, setZonewisechartData] = useState()
    const [chartData, setChartData] = useState([]);
    const [getmonthyear, setmonthyear] = useState("");
    const [sectorData, setSectorData] = useState([]);
    console.log("getmonthyear", getmonthyear)

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
        if (
            year == cuurentYear &&
            monthIndex == currentMonth
        ) {
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
        if (
            requestedYear < now.getFullYear()) {
            return 1;
        }

        // Future month → 0
        if (
            requestedMonthIndex === now.getMonth()) {
            return 0;
        }
    };


    let zonedata = props.sessionContext?.logininPlantData?.zone_code ?? []

    console.log("zonedata", zonedata)


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
        sectorGroups: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSending, setIsSending] = useState(false); // State for email button
    useEffect(() => {
     
        setmonthyear(`${selectedMonth}-${selectedYear}`)
        TargetSalesMonthYearWise(activeTab, getmonthyear);
        TotalTargetSalesMonthYearWiseZone(activeTab, getmonthyear);
        SectorReport(getmonthyear)
        

    }, []);




    // Validate Excel Data
    const validateExcelData = (data, headers) => {
        const gradeIndex = 0; // first column is "Grades"
        const gradeCount = {};
        const duplicates = new Set();
        const invalidRows = new Set();

        data.forEach((row, rowIdx) => {
            const grade = row[gradeIndex];

            // Check for duplicate grades
            if (grade !== undefined && grade !== '') {
                if (gradeCount[grade] !== undefined) {
                    duplicates.add(gradeCount[grade]); // first occurrence
                    duplicates.add(rowIdx); // current occurrence
                } else {
                    gradeCount[grade] = rowIdx;
                }
            }

            // Check for non-numeric values 
            for (let colIdx = 1; colIdx < headers.length; colIdx++) {
                const value = row[colIdx];
                if (value !== undefined && value !== '' && value !== null) {
                    // Check if value is not a valid number
                    if (typeof value !== 'number' && isNaN(Number(value))) {
                        invalidRows.add(rowIdx);
                        break;
                    }
                }
            }
        });

        setDuplicateGrades(duplicates);
        setInvalidValueRows(invalidRows);
    };
   
    // Excel Upload Handlers
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                console.log(jsonData,"jsonData")

                if (jsonData.length > 0) {
                    const headers = jsonData[0];
                    const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

                    setExcelHeaders(headers);
                    setUploadedExcelData(rows);
                    setUploadFileName(file.name);
                    setActiveTab('uploadExcel');

                    // Validate the data
                    validateExcelData(rows, headers);

                    toast.success(`Loaded ${rows.length} rows from ${file.name}`);
                } else {
                    toast.error('No data found in the Excel file');
                }
            } catch (error) {
                console.error('Error parsing Excel:', error);
                toast.error('Error parsing Excel file');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleClearUpload = () => {
        setUploadedExcelData([]);
        setExcelHeaders([]);
        setUploadFileName('');
        setDuplicateGrades(new Set());
        setInvalidValueRows(new Set());
        setActiveTab('overview');
    };
// no use api
    const handleSubmitExcelData = async () => {
        if (uploadedExcelData.length === 0) {
            toast.error('No data to submit');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Submitting data to API...');

        try {
            const formattedData = uploadedExcelData.map(row => {
                const obj = {};
                excelHeaders.forEach((header, index) => {
                    obj[header] = row[index] ?? null;
                });
                return obj;
            });

            console.log("formattedData",formattedData)


            const response = await fetch('http://10.14.84.54/Customeranalytics_API/api/TargetSales/UploadDispatchTarget', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData),
            });

            if (!response.ok) throw new Error('Failed to submit data');

            toast.update(toastId, {
                render: 'Data submitted successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });

            handleClearUpload();
        } catch (error) {
            console.error('Submit error:', error);
            toast.update(toastId, {
                render: `Failed to submit: ${error.message}`,
                type: 'error',
                isLoading: false,
                autoClose: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };



    // Check if form is valid for submission
    const isFormValid = useMemo(() => {
        return uploadedExcelData.length > 0 &&
            duplicateGrades.size === 0 &&
            invalidValueRows.size === 0;
    }, [uploadedExcelData, duplicateGrades, invalidValueRows]);



    const loadSalesData = async () => {
      
        setmonthyear(`${selectedMonth}-${selectedYear}`)
        TargetSalesMonthYearWise(activeTab, getmonthyear);
        TotalTargetSalesMonthYearWiseZone(activeTab, getmonthyear);
        SectorReport(getmonthyear)
    };


    const handleTabChange = (tab) => {
        setActiveTab(tab);
        TargetSalesMonthYearWise(tab, getmonthyear);
        TotalTargetSalesMonthYearWiseZone(tab, getmonthyear);
    };





    const TargetSalesMonthYearWise = async (activeTab, getmonthyearss) => {
  

        try {
                setLoading(false)
            let URL = "http://10.14.84.54/Customeranalytics_API/api/TargetSales/";

            // console.log("URLactiveTab",activeTab)

            if (activeTab == "pp") {
                URL = URL + "TargetSalesMonthYearWisePP";
               
            }
            else if (activeTab == "pe") {
                URL = URL + "TargetSalesMonthYearWisePE";
         
            }
            else {
                URL = URL + "TargetSalesMonthYearWise";
              
           
            }
            let today = new Date();
        
            // current month ka ek din pehle
            let currentMonthLastDay = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() - 1
            );

            // previous month ka last day
            let previousMonthLastDay = new Date(
                today.getFullYear(),
                today.getMonth(),
                0
            );
            function formatDate(date) {
                return date.toISOString().split("T")[0];
            }

            let Calculatecurrectdaymonthyear = calculateYearMonth(0, selectedYear, selectedMonth)

            if (Calculatecurrectdaymonthyear === 0) {
                setlastday(getLastDayOfMonth(selectedYear, selectedMonth));
                console.log("LastDay", getLastDayOfMonth(selectedYear, selectedMonth))

            }
            else {
                 console.log("LastDay", getLastDayOfMonth2(selectedYear, selectedMonth))
            }



            // let res = JSON.stringify({
            //     monthYear: `${selectedMonth}-${selectedYear}`,
            //     firstDay: `${selectedYear}-${selectedMonth}-01`,
            //     lastDay: Calculatecurrectdaymonthyear === 0
            //         ? getLastDayOfMonth(selectedYear, selectedMonth)
            //         : getLastDayOfMonth2(selectedYear, selectedMonth),
            //       });

            // console.log("currentMonthLastDayddd", res,selectedYear, selectedMonth);



            // console.log("FirstDay", getFirstDayOfMonth(selectedYear, selectedMonth))


            //  let lstdate = getLastDayOfMonth(selectedYear,selectedMonth);
            //  let currentdatetime = String(date.getDate()).padStart(2, "0");





            //console.log("LastDay", currentdatetime)



            const response = await fetch(


                URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        monthYear: (selectedMonth + "-" + selectedYear),
                        firstDay: `${selectedYear}-${selectedMonth}-01`,

                        lastDay: Calculatecurrectdaymonthyear === 0
                            ? getLastDayOfMonth(selectedYear, selectedMonth)
                            : getLastDayOfMonth2(selectedYear, selectedMonth),

                        zone_code: `${zonedata}`
                    }),
                }
            );
            setLoading(true)
            console.log("currentMonthLastDayddd", selectedYear, selectedMonth);
            // setSelectedMonth("")
            // setSelectedYear("")
            // setmonthyear("")
            if (!response.ok) {
                throw new Error("API request failed");
            }
            const result = await response.json();
            // console.log("result", result)
              console.log("currentMonthLastDayddd 1", result);
            console.log("TargetSalesMonthYearWise sddd", result.totalsales, result.totaltarget,);
            setTargetSalesMonthYear(result);
            console.log("TargetSalesMonthYearWise result", result);
        }
        catch (err) {
            // setError(err.message || "Something went wrong");
        } finally {
            //  setLoading(false);
        }
    }


    const TotalTargetSalesMonthYearWiseZone = async (activeTab) => {
        try {


            console.log("getmonthyear1", getmonthyear);
            let URL = "http://10.14.84.54/Customeranalytics_API/api/TargetSales/";

            if (activeTab == "pp") {
                URL = URL + "ZonewiseTotalTargetSalesMonthYearWisePP";
                console.log("URL 1", URL)
            }
            else if (activeTab == "pe") {
                URL = URL + "ZonewiseTotalTargetSalesMonthYearWisePE";
                console.log("URL 2", URL)
            }
            else {
                URL = URL + "ZonewiseTotalTargetSalesMonthYearWise";
                console.log("URL 3", URL)
            }

            let Calculatecurrectdaymonthyear = calculateYearMonth(0, selectedYear, selectedMonth)

            if (Calculatecurrectdaymonthyear === 0) {
                console.log("LastDay", getLastDayOfMonth(selectedYear, selectedMonth))

            }
            else {

                console.log("LastDay", getLastDayOfMonth2(selectedYear, selectedMonth))
            }


            // let res = JSON.stringify({
            //     monthYear: (selectedMonth + "-" + selectedYear),
            //     firstDay: `${selectedYear}-${selectedMonth}-01`,
            //     lastDay: Calculatecurrectdaymonthyear === 0
            //         ? getLastDayOfMonth(selectedYear, selectedMonth)
            //         : getLastDayOfMonth2(selectedYear, selectedMonth),


            // })
    

            // console.log("requestparam", res);
  console.log("result SDDD 1" ,selectedMonth,selectedYear)
            const response = await fetch(
                URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        monthYear: (selectedMonth + "-" + selectedYear),
                        firstDay: `${selectedYear}-${selectedMonth}-01`,
                        lastDay: Calculatecurrectdaymonthyear === 0
                            ? getLastDayOfMonth(selectedYear, selectedMonth)
                            : getLastDayOfMonth2(selectedYear, selectedMonth),

                        zone_code: `${zonedata}`
                    }),


                }
            );
            if (!response.ok) {
                throw new Error("API request failed");
            }
            const result = await response.json();
            console.log("result SDDD" ,selectedMonth,selectedYear, result)
            console.log("TotalTargetSalesMonthYearWiseZone", result);

            //setZonewiseTotal(result);

            const zoneList = Array.isArray(result.lstZonewiseTotaltargetSalesRes)
                ? result.lstZonewiseTotaltargetSalesRes
                : [];

            // Prepare chart data
            const chartData = zoneList.map((zone) => ({
                zone: zone.zone || "Unknown",
                achievement: Number(zone.totalAchievement) || 0,
            }));

            let data = result?.lstZonewiseTotaltargetSalesRes?.map((i, key) => ({
                zone: i.zone,
                proratedTarget: i.totalProratedtarget,
                actualSales: i.totalsales,
            }));

            // Update state
            setZonewiseTotal(result);       // For any table or display
            setZonewisechartData(chartData); // For the chart
            setChartData(data);




        }
        catch (err) {
            // setError(err.message || "Something went wrong");
        } finally {
            //  setLoading(false);
        }
    }




    const SectorReport = async (getmonthyear) => {

        try {


            let Calculatecurrectdaymonthyear = calculateYearMonth(0, selectedYear, selectedMonth)

            if (Calculatecurrectdaymonthyear === 0) {
                console.log("LastDay", getLastDayOfMonth(selectedYear, selectedMonth))

            }
            else {

                console.log("LastDay", getLastDayOfMonth2(selectedYear, selectedMonth))
            }


            let res = JSON.stringify({
                monthYear: (selectedMonth + "-" + selectedYear),
                firstDay: `${selectedYear}-${selectedMonth}-01`,
                lastDay: Calculatecurrectdaymonthyear === 0
                    ? getLastDayOfMonth(selectedYear, selectedMonth)
                    : getLastDayOfMonth2(selectedYear, selectedMonth),
                zone_code: `${zonedata}`
            })

            console.log("SectorReport", res);


            let URL = "http://10.14.84.54/Customeranalytics_API/api/TargetSales/ZoneSegmentTargetVsSales";
            const response = await fetch(
                URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        monthYear: (selectedMonth + "-" + selectedYear),
                        firstDay: `${selectedYear}-${selectedMonth}-01`,
                        lastDay: Calculatecurrectdaymonthyear === 0
                            ? getLastDayOfMonth(selectedYear, selectedMonth)
                            : getLastDayOfMonth2(selectedYear, selectedMonth),
                        zone_code: `${zonedata}`
                    }),
                }
            );
            if (!response.ok) {
                throw new Error("API request failed");
            }
            const result = await response.json();
            console.log("SectorReport", result)
            setSectorData(result)

        }
        catch (err) {
            // setError(err.message || "Something went wrong");
        } finally {
            //  setLoading(false);
        }
    }



    const TabButton = ({ isActive, onClick, children, icon }) => (
        <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {icon} {children}
        </button>
    );


    const colorPalettes = {
        overview: { prorated: '#3b82f6', actual: '#10b981', achievement: '#f59e0b' },
        pp: { prorated: '#8b5cf6', actual: '#4f46e5', achievement: '#a855f7' },
        pe: { prorated: '#2dd4bf', actual: '#06b6d4', achievement: '#14b8a6' },
        sectors: { prorated: '#f97316', actual: '#ec4899', achievement: '#84cc16' },
         overallSectors: { prorated: '#f97316', actual: '#ec4899', achievement: '#84cc16' },
        uploadExcel: { prorated: '#3b82f6', actual: '#10b981', achievement: '#f59e0b' },
    };

    const currentPalette = colorPalettes[activeTab]|| colorPalettes.overview;

    const getCurrentDataForCharts = () => {
        switch (activeTab) {
            case 'pp': return salesData.pp;
            case 'pe': return salesData.pe;
            default: return salesData.combined;
        }
    };

    // const chartData = [];




    const currentDataForTotals = [];


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
            <Header />
            {loading? 
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
                {/* Header */}


                {/* Month and Year Selectors */}
                
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="flex items-center gap-2 pb-2"><Calendar className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">Select Period</h3></div>
                        <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1">Month</label><div className="relative"><select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]">{availableMonths.map(m => <option key={m} value={m}>{m}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }} /></div></div>
                        <div className="relative"><label className="block text-sm font-medium text-gray-700 mb-1">Year</label><div className="relative"><select value={selectedYear} onChange={(e) => setSelectedYear((e.target.value))} className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]">{availableYears.map(y => <option key={y} value={y}>{y}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }} /></div></div>
                        <button onClick={loadSalesData} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Refresh Data</button>
                        {/* <button onClick={handleSendReport} disabled={loading || isSending} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-md"><Mail className="w-4 h-4" />{isSending ? 'Sending...' : 'Send Report'}</button> */}
                    </div>
                </div>



                <div className="flex flex-wrap gap-4">
                    <TabButton isActive={activeTab === 'overview'} onClick={() => handleTabChange('overview')} icon={<BarChart3 className="w-5 h-5" />}>PP + PE Combined</TabButton>
                    <TabButton isActive={activeTab === 'pp'} onClick={() => handleTabChange('pp')} icon={<TrendingUp className="w-5 h-5" />}>PP Sales</TabButton>
                    <TabButton isActive={activeTab === 'pe'} onClick={() => handleTabChange('pe')} icon={<Target className="w-5 h-5" />}>PE Sales</TabButton>
                    


                   {/* new update comment sector && overallSectors && excl uplode */}

                    {/* <TabButton isActive={activeTab === 'sectors'} onClick={() => handleTabChange('sectors')} icon={<Layers className="w-5 h-5" />}>Sector Report</TabButton>
                    <TabButton isActive={activeTab === 'overallSectors'} onClick={() => handleTabChange('overallSectors')} icon={<Layers className="w-5 h-5" />}>Overall Sector Report</TabButton>
                   <input
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
                {activeTab !== 'sectors' && activeTab !== 'overallSectors' && activeTab !== 'uploadExcel' ? (
                    <div className="space-y-8">
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between mb-4"><Target className="w-8 h-8 text-blue-600" /><span className="text-sm font-medium text-gray-500">TOTAL TARGET</span></div><p className="text-3xl font-bold text-gray-900">{TargetSalesMonthYear?.totaltarget}</p></div>
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between mb-4"><TrendingUp className="w-8 h-8 text-purple-600" /><span className="text-sm font-medium text-gray-500">PRORATED TARGET</span></div><p className="text-3xl font-bold text-gray-900">{TargetSalesMonthYear?.totalproratedtarget
                            }</p></div>
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between mb-4"><BarChart3 className="w-8 h-8 text-green-600" /><span className="text-sm font-medium text-gray-500">ACTUAL SALES</span></div><p className="text-3xl font-bold text-gray-900">{Math.round(TargetSalesMonthYear?.totalsales)}</p></div>
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"><div className="flex items-center justify-between mb-4"><Target className="w-8 h-8 text-orange-600" /><span className="text-sm font-medium text-gray-500">ACHIEVEMENT</span></div><p className="text-3xl font-bold">
                                {TargetSalesMonthYear?.totalachivement}%
                            </p></div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />Sales Comparison by Zone</h3>
                                <div style={{ width: "100%", height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={(chartData)}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                                            <XAxis
                                                dataKey="zone"
                                                tick={{ fontSize: 12 }}
                                                stroke="#6b7280"
                                                interval={0}
                                            />

                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                stroke="#6b7280"
                                                tickFormatter={(value) =>
                                                    `${(value / 1000).toFixed(0)}K`
                                                }
                                            />

                                            <Tooltip formatter={(value) => Math.round(value)} />
                                            <Legend />

                                            <Bar
                                                dataKey="proratedTarget"
                                                name="Prorated Target"
                                                fill="#6366f1"
                                                radius={[4, 4, 0, 0]}
                                            />

                                            <Bar
                                                dataKey="actualSales"
                                                name="Actual Sales"
                                                fill="#22c55e"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>


                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-green-600" />Achievement % by Zone</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={ZonewisehartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                                        <XAxis dataKey="zone" tick={{ fontSize: 12 }} stroke="#6b7280" interval={0} />

                                        <YAxis
                                            domain={[0, 100]}
                                            tickFormatter={(v) => `${v.toFixed(0)}%`}
                                            tick={{ fontSize: 12 }}
                                            stroke="#6b7280"
                                        />

                                        <Tooltip
                                            formatter={(value) => [`${value?.toFixed(0)}%`, "Achieved Percentage"]}
                                            // formatter={(value) => [`${value != null ? value.toFixed(0) : 0}%`, 'Achieved Percentage']} // only show percentage
                                            labelFormatter={(label) => `Zone: ${label}`} // show zone name
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="achievement"
                                            stroke={currentPalette.achievement}
                                            strokeWidth={3}
                                            dot={{ fill: currentPalette.achievement }}
                                        />

                                        {/* 100% reference line */}
                                        {/* <Line
                                            type="monotone"
                                            dataKey={() => 100}
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={false}
                                        /> */}

                                        <ReferenceLine
                                            y={100}
                                            stroke="#ef4444"
                                            strokeDasharray="5 5"
                                            label={{ value: "100%", position: "right", fill: "#ef4444" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* New Pivot Table Section */}
                        <ZonePivotTable
                            ZonewiseTotal={ZonewiseTotal}
                            activeTab={activeTab}
                        // data={getPivotTableProps().data}
                        // title={getPivotTableProps().title}
                        // month={selectedMonth}
                        // year={selectedYear}
                        />
                    </div>
                ) :
                 {/* new update comment sector && overallSectors && excl uplode */}
                // : activeTab === 'sectors' ? (
                //     (
                //         <SectorReportTable
                //             data={sectorData}
                //         // sectorGroups={salesData.sectorGroups}
                //         // month={selectedMonth} 
                //         // year={selectedYear} 
                //         />
                //     )
                // ) : activeTab === 'overallSectors' ? (<OverallSectorReportTable

                //     data={sectorData}

                // />): activeTab === 'uploadExcel' ? (
                //     <div className="bg-white rounded-xl p-6 shadow-xl border" style={{ marginBottom: "80px" }}>
                //         <div className="flex justify-between items-center mb-6">
                //             <div className="flex items-center gap-3">
                //                 <FileSpreadsheet className="w-7 h-7 text-green-600" />
                //                 <div>
                //                     <h2 className="text-xl font-bold text-gray-500">{uploadFileName}</h2>
                //                     {/* <p className="text-sm text-gray-500">{uploadFileName}</p> */}
                //                 </div>
                //             </div>
                //             <div className="flex gap-3">
                //                 <button
                //                     onClick={handleClearUpload}
                //                     className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                //                 >
                //                     <X className="w-4 h-4" /> Cancel
                //                 </button>

                //                 <button
                //                     onClick={handleSubmitExcelData}
                //                     disabled={isSubmitting || !isFormValid}
                //                     className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${isFormValid
                //                         ? 'bg-green-600 text-white hover:bg-green-700'
                //                         : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                //                         }`}
                //                     title={!isFormValid ? 'Please fix all validation errors before submitting' : ''}
                //                 >
                //                     <Send className="w-5 h-5" />
                //                     {isSubmitting ? 'Submitting...' : 'Submit'}
                //                 </button>
                //             </div>
                //         </div>

                //         <div className="mb-4 flex items-center gap-4">
                //             <p className="text-sm text-gray-600">
                //                 <strong>{uploadedExcelData.length}</strong> rows loaded from Excel file
                //             </p>
                //             {/* Validation Error Summary */}
                //             {(duplicateGrades.size > 0 || invalidValueRows.size > 0) && (
                //                 <div className="flex items-center gap-3">
                //                     {duplicateGrades.size > 0 && (
                //                         <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                //                             Duplicate Grades: {duplicateGrades.size}
                //                         </span>
                //                     )}
                //                     {invalidValueRows.size > 0 && (
                //                         <span className="text-orange-600 text-xs font-medium bg-orange-50 px-2 py-1 rounded">
                //                             Invalid Values: {invalidValueRows.size}
                //                         </span>
                //                     )}
                //                 </div>
                //             )}
                //         </div>

                //         {/* Data Table */}
                //         <div className="overflow-x-auto">
                //             <table className="border-collapse w-full text-sm">
                //                 <thead>
                //                     <tr className="bg-slate-700 text-white">
                //                         {excelHeaders.map((header, idx) => (
                //                             <th key={idx} className="p-3 border border-slate-400 text-center font-semibold">
                //                                 {header}
                //                             </th>
                //                         ))}
                //                     </tr>
                //                 </thead>
                //                 <tbody>
                //                     {uploadedExcelData.map((row, rowIdx) => {
                //                         const isDuplicate = duplicateGrades.has(rowIdx);
                //                         const hasInvalidValue = invalidValueRows.has(rowIdx);
                //                         const rowBgColor = isDuplicate || hasInvalidValue
                //                             ? 'bg-red-100'
                //                             : rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                //                         return (
                //                             <tr key={rowIdx} className={rowBgColor}>
                //                                 {excelHeaders.map((_, colIdx) => {
                //                                     const cellValue = row[colIdx];
                //                                     // Check if this specific cell has invalid value (non-numeric in zone columns)
                //                                     const isCellInvalid = colIdx > 0 &&
                //                                         cellValue !== undefined &&
                //                                         cellValue !== '' &&
                //                                         cellValue !== null &&
                //                                         typeof cellValue !== 'number' &&
                //                                         isNaN(Number(cellValue));

                //                                     return (
                //                                         <td
                //                                             key={colIdx}
                //                                             className={`p-2 border border-slate-300 text-center ${isCellInvalid ? 'bg-orange-200 font-semibold text-orange-800' : ''
                //                                                 } ${isDuplicate && colIdx === 0 ? 'font-semibold text-red-700' : ''}`}
                //                                         >
                //                                             {cellValue !== undefined ? cellValue : '-'}
                //                                         </td>
                //                                     );
                //                                 })}
                //                             </tr>
                //                         );
                //                     })}
                //                 </tbody>
                //             </table>
                //         </div>
                //     </div>
                // ) 
                  }

                

                {/* Footer */}

            </div>
             :<div style={styles.container}>
              <div style={styles.loaderBox}>
                <RingLoader size={100} color="#3498db" loading={!loading} />
                <p style={styles.text}>Loading Data...</p>
              </div>
            </div>}
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
export default withSessionContext(Targetsales)