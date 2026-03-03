import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Send, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../components/header';
import Footer from '../components/footer';

function ExcelUploadPage() {
    const navigate = useNavigate();
    const [uploadedExcelData, setUploadedExcelData] = useState([]);
    const [excelHeaders, setExcelHeaders] = useState([]);
    const [uploadFileName, setUploadFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    useEffect(() => {
        // Get data from sessionStorage
        const storedData = sessionStorage.getItem('excelUploadData');
        const storedHeaders = sessionStorage.getItem('excelUploadHeaders');
        const storedFileName = sessionStorage.getItem('excelUploadFileName');
        const storedMonth = sessionStorage.getItem('excelUploadMonth');
        const storedYear = sessionStorage.getItem('excelUploadYear');

        if (storedData && storedHeaders) {
            setUploadedExcelData(JSON.parse(storedData));
            setExcelHeaders(JSON.parse(storedHeaders));
            setUploadFileName(storedFileName || '');
            setSelectedMonth(storedMonth || '');
            setSelectedYear(storedYear || '');
        } else {
            // No data, go back
            navigate('/aborad');
        }
    }, [navigate]);

    const handleClear = () => {
        sessionStorage.removeItem('excelUploadData');
        sessionStorage.removeItem('excelUploadHeaders');
        sessionStorage.removeItem('excelUploadFileName');
        sessionStorage.removeItem('excelUploadMonth');
        sessionStorage.removeItem('excelUploadYear');
        navigate('/aborad');
    };

    const handleSubmitExcelData = async () => {
        if (uploadedExcelData.length === 0) {
            toast.error('No data to submit');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Submitting data to API...');

        try {
            // Convert array data to objects with headers as keys
            const formattedData = uploadedExcelData.map(row => {
                const obj = {};
                excelHeaders.forEach((header, index) => {
                    obj[header] = row[index] ?? null;
                });
                return obj;
            });

            const payload = {
                monthYear: `${selectedMonth}-${selectedYear}`,
                data: formattedData
            };

            console.log('Submitting payload:', payload);

            const response = await fetch('http://10.14.84.54/Customeranalytics_API/api/TargetSales/UploadDispatchTarget', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to submit data');
            }

            const result = await response.json();
            toast.update(toastId, {
                render: 'Data submitted successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });

            // Clear and go back after success
            setTimeout(() => {
                handleClear();
            }, 2000);

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

    return (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <ToastContainer position="top-right" autoClose={3000} />
            <Header />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-white rounded-xl p-6 shadow-xl border">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/aborad')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <FileSpreadsheet className="w-7 h-7 text-green-600" />
                            <div>
                                <h2 className="text-2xl font-bold">PPMC Dispatch Target Upload</h2>
                                <p className="text-sm text-gray-500">{uploadFileName} • {selectedMonth}-{selectedYear}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleClear}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                            <button
                                onClick={handleSubmitExcelData}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                            >
                                <Send className="w-5 h-5" />
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>

                    <p className="mb-4 text-sm text-gray-600">
                        <strong>{uploadedExcelData.length}</strong> rows loaded from Excel file
                    </p>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        <table className="border-collapse w-full text-sm">
                            <thead>
                                <tr className="bg-slate-700 text-white">
                                    {excelHeaders.map((header, idx) => (
                                        <th key={idx} className="p-3 border border-slate-400 text-center font-semibold">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {uploadedExcelData.map((row, rowIdx) => (
                                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        {excelHeaders.map((_, colIdx) => (
                                            <td key={colIdx} className="p-2 border border-slate-300 text-center">
                                                {row[colIdx] !== undefined ? row[colIdx] : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default ExcelUploadPage;
