
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Download, FileDown, Table } from 'lucide-react';

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    fetchReport();
  }, [selectedMonth]);

  const fetchReport = async () => {
    setLoading(true);
    const startDate = `${selectedMonth}-01`;
    const lastDay = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();
    const endDate = `${selectedMonth}-${lastDay}`;

    const { data, error } = await supabase
      .from('work_entries')
      .select('*, employees(name, hourly_rate)')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error(error);
    } else {
      // Aggregate by employee
      const aggregated: Record<string, any> = {};
      data.forEach(entry => {
        const empId = entry.employee_id;
        if (!aggregated[empId]) {
          aggregated[empId] = {
            name: entry.employees.name,
            hourly_rate: entry.employees.hourly_rate,
            total_hours: 0,
            total_wage: 0,
            days_worked: new Set()
          };
        }
        aggregated[empId].total_hours += Number(entry.total_hours);
        aggregated[empId].total_wage += Number(entry.total_wage);
        aggregated[empId].days_worked.add(entry.date);
      });

      setReportData(Object.values(aggregated));
    }
    setLoading(false);
  };

  const exportCSV = () => {
    const headers = ['Employee Name', 'Hourly Rate', 'Total Hours', 'Total Wage (CAD)', 'Days Worked'];
    const rows = reportData.map(item => [
      item.name,
      item.hourly_rate,
      item.total_hours.toFixed(2),
      item.total_wage.toFixed(2),
      item.days_worked.size
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `WageReport_${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    // Simple alert for demo, ideally use jspdf here
    // For this context, we'll implement a simple print-view approach
    window.print();
  };

  return (
    <div className="animate-fade-in print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monthly Reports</h2>
          <p className="text-slate-500">Breakdown of earnings per employee</p>
        </div>
        <div className="flex gap-2">
          <input
            type="month"
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <button 
            onClick={exportCSV}
            className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Table className="w-4 h-4 mr-2" />
            CSV
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            PDF / Print
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Summary for {selectedMonth}</h3>
          <span className="text-sm font-medium text-slate-400">Currency: CAD</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Days</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Rate</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Total Hours</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total Wage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading data...</td></tr>
              ) : reportData.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No data for this period.</td></tr>
              ) : (
                reportData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600 text-center">{item.days_worked.size}</td>
                    <td className="px-6 py-4 text-slate-400 text-center">${item.hourly_rate.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-600 text-center font-medium">{item.total_hours.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-bold text-sm">
                        ${item.total_wage.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && reportData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50/80 font-bold">
                  <td className="px-6 py-4 text-slate-800" colSpan={3}>TOTAL MONTHLY WAGE</td>
                  <td className="px-6 py-4 text-slate-800 text-center">
                    {reportData.reduce((acc, curr) => acc + curr.total_hours, 0).toFixed(2)} hrs
                  </td>
                  <td className="px-6 py-4 text-right text-indigo-600 text-lg">
                    ${reportData.reduce((acc, curr) => acc + curr.total_wage, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start print:hidden">
        <FileDown className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Tip:</strong> Use the monthly filter to generate past reports. All exports are generated in Canadian Dollars (CAD) and follow standard Ontario/Canada time tracking recommendations.
        </p>
      </div>
    </div>
  );
};

export default Reports;
