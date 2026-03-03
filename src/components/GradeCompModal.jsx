import React from "react";
import { X } from "lucide-react";
import KPIComponent from "./KPIComponent";
import { Target, TrendingUp, BarChart3 } from "lucide-react";
import { RingLoader } from "react-spinners";

const GradeCompModal = ({ isOpen, onClose, gradeData = {}, Loader = true }) => {
  if (!isOpen) return;

  console.log("LoaderLoader", Loader);

  const getAchievementColor = (value) => {
    if (value === 0) return "bg-gray-300";
    if (value < 75) return "bg-red-500";
    if (value < 100) return "bg-yellow-500";
    return "bg-green-600";
  };

  const getTextColor = (value) => {
    if (value === 0) return "text-red-500";
    if (value < 75) return "text-red-500";
    if (value < 100) return "text-yellow-600";
    return "text-green-600";
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {!Loader ? (
        <div className="bg-white w-[90%] max-w-5xl rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full border border-gray-300 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Grade Performance Details</h2>
          <p className="text-sm text-gray-600 mb-6">
            {/* For Customer:{" "}
                    <span className="font-semibold text-blue-600">
                        {gradeData?.sold_to}
                    </span>{" "} */}
            (Sold To Party:{" "}
            <span className="font-semibold text-blue-600">
              {gradeData?.sold_to}
            </span>
            ) <span className="mr-4" />
            APP Type:{" "}
            <span className="px-2 py-1 text-xs bg-orange-500 text-white font-bold rounded-full">
              {gradeData.app_Type}
            </span>
          </p>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPIComponent
              title="Total APP Quantity"
              value={gradeData?.totalTarget}
              icon={TrendingUp}
              bgColor="bg-yellow-100"
              textColor="text-yellow-700"
            />
            <KPIComponent
              title="Total Sales Quantity"
              value={gradeData?.totalSales}
              icon={Target}
              bgColor="bg-blue-100"
              textColor="text-blue-700"
            />
            <KPIComponent
              title="Overall Achievement"
              value={gradeData?.totalAchievement}
              per={"%"}
              icon={BarChart3}
              bgColor="bg-green-100"
              textColor="text-green-700"
            />
          </div>

          {/* Table */}
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-200 text-gray-700 uppercase text-xs tracking-wide">
                <tr>
                  <th className="p-3 text-left">Grade</th>
                  <th className="p-3 text-center">App Qty (MT)</th>
                  <th className="p-3 text-center">Sales Qty (MT)</th>
                  <th className="p-3 text-center">Achievement</th>
                </tr>
              </thead>

              <tbody>
                {gradeData?.lstDetails?.map((row, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-gray-100 transition"
                  >
                    <td className="p-3">
                      <span className="bg-gray-200 px-3 py-1 rounded-full text-xs font-medium">
                        {row.grade}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {Math.floor(row.target)}
                    </td>
                    <td className="p-3 text-center">{Math.floor(row.sales)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3 justify-center">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${getAchievementColor(row.achievement)}`}
                            style={{
                              width: `${Math.min(row.achievement, 150)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`font-semibold text-sm ${getTextColor(row.achievement)}`}
                        >
                          {Math.floor(row.achievement)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={styles.container}>
          <div style={styles.loaderBox}>
            <RingLoader size={100} color="#3498db" />
            <p style={styles.text}>Loading Data...</p>
          </div>
        </div>
      )}
    </div>
  );
};
const styles = {
  container: {
    // position: "fixed",
    // top: 0,
    // left: 0,
    width: "100%",
    height: "100vh",
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

export default GradeCompModal;
