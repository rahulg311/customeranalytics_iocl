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

function UplodeTargetSale(props) {
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

  const [activeTab, setActiveTab] = useState("overview");
  

  // Validate Excel Data
  const validateExcelData = (data, headers) => {
    const gradeIndex = 0; // first column is "Grades"
    const gradeCount = {};
    const duplicates = new Set();
    const invalidRows = new Set();

    data.forEach((row, rowIdx) => {
      const grade = row[gradeIndex];

      // Check for duplicate grades
      if (grade !== undefined && grade !== "") {
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
        if (value !== undefined && value !== "" && value !== null) {
          // Check if value is not a valid number
          if (typeof value !== "number" && isNaN(Number(value))) {
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
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(jsonData, "jsonData");

        if (jsonData.length > 0) {
          const headers = jsonData[0];
          const rows = jsonData
            .slice(1)
            .filter((row) =>
              row.some((cell) => cell !== undefined && cell !== ""),
            );

          setExcelHeaders(headers);
          setUploadedExcelData(rows);
          setUploadFileName(file.name);
          setActiveTab("uploadExcel");

          // Validate the data
          validateExcelData(rows, headers);

          toast.success(`Loaded ${rows.length} rows from ${file.name}`);
        } else {
          toast.error("No data found in the Excel file");
        }
      } catch (error) {
        console.error("Error parsing Excel:", error);
        toast.error("Error parsing Excel file");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleClearUpload = () => {
    setUploadedExcelData([]);
    setExcelHeaders([]);
    setUploadFileName("");
    setDuplicateGrades(new Set());
    setInvalidValueRows(new Set());
    setActiveTab("overview");
  };

  const handleSubmitExcelData = async () => {
    if (uploadedExcelData.length === 0) {
      toast.error("No data to submit");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting data to API...");

    try {
      const formattedData = uploadedExcelData.map((row) => {
        const obj = {};
        excelHeaders.forEach((header, index) => {
          obj[header] = row[index] ?? null;
        });
        return obj;
      });

      console.log("formattedData", formattedData);

      const response = await fetch(
        "http://10.14.84.54/Customeranalytics_API/api/TargetSales/UploadDispatchTarget",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        },
      );

      if (!response.ok) throw new Error("Failed to submit data");

      toast.update(toastId, {
        render: "Data submitted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      handleClearUpload();
    } catch (error) {
      console.error("Submit error:", error);
      toast.update(toastId, {
        render: `Failed to submit: ${error.message}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = useMemo(() => {
    return (
      uploadedExcelData.length > 0 &&
      duplicateGrades.size === 0 &&
      invalidValueRows.size === 0
    );
  }, [uploadedExcelData, duplicateGrades, invalidValueRows]);

  // const chartData = [];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* <Toaster richColors position="top-right" /> */}
      <Header />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Header */}

        {/* Month and Year Selectors */}
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-wrap gap-4">
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
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-all ${activeTab === "uploadExcel" ? "bg-blue-600 text-white shadow-lg" : "bg-green-600 text-white hover:bg-green-700"}`}
              >
                <Upload className="w-5 h-5" />
                {isUploading ? "Uploading..." : "Upload Target Sales"}
              </label>
            </div>
          </div>
        </div>

        {/* Conditional Content Area */}
        {activeTab === "uploadExcel" ? (
          <div
            className="bg-white rounded-xl p-6 shadow-xl border"
            style={{ marginBottom: "80px" }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-7 h-7 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-500">
                    {uploadFileName}
                  </h2>
                  {/* <p className="text-sm text-gray-500">{uploadFileName}</p> */}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClearUpload}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>

                <button
                  onClick={handleSubmitExcelData}
                  disabled={isSubmitting || !isFormValid}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                    isFormValid
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                  title={
                    !isFormValid
                      ? "Please fix all validation errors before submitting"
                      : ""
                  }
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-4">
              <p className="text-sm text-gray-600">
                <strong>{uploadedExcelData.length}</strong> rows loaded from
                Excel file
              </p>
              {/* Validation Error Summary */}
              {(duplicateGrades.size > 0 || invalidValueRows.size > 0) && (
                <div className="flex items-center gap-3">
                  {duplicateGrades.size > 0 && (
                    <span className="text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                      Duplicate Grades: {duplicateGrades.size}
                    </span>
                  )}
                  {invalidValueRows.size > 0 && (
                    <span className="text-orange-600 text-xs font-medium bg-orange-50 px-2 py-1 rounded">
                      Invalid Values: {invalidValueRows.size}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="border-collapse w-full text-sm">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    {excelHeaders.map((header, idx) => (
                      <th
                        key={idx}
                        className="p-3 border border-slate-400 text-center font-semibold"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadedExcelData.map((row, rowIdx) => {
                    const isDuplicate = duplicateGrades.has(rowIdx);
                    const hasInvalidValue = invalidValueRows.has(rowIdx);
                    const rowBgColor =
                      isDuplicate || hasInvalidValue
                        ? "bg-red-100"
                        : rowIdx % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50";

                    return (
                      <tr key={rowIdx} className={rowBgColor}>
                        {excelHeaders.map((_, colIdx) => {
                          const cellValue = row[colIdx];
                          // Check if this specific cell has invalid value (non-numeric in zone columns)
                          const isCellInvalid =
                            colIdx > 0 &&
                            cellValue !== undefined &&
                            cellValue !== "" &&
                            cellValue !== null &&
                            typeof cellValue !== "number" &&
                            isNaN(Number(cellValue));

                          return (
                            <td
                              key={colIdx}
                              className={`p-2 border border-slate-300 text-center ${
                                isCellInvalid
                                  ? "bg-orange-200 font-semibold text-orange-800"
                                  : ""
                              } ${isDuplicate && colIdx === 0 ? "font-semibold text-red-700" : ""}`}
                            >
                              {cellValue !== undefined ? cellValue : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Footer */}
      </div>
      <Footer />
    </div>
  );
}
export default withSessionContext(UplodeTargetSale);
