
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Users, Clock, DollarSign, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalHoursThisMonth: 0,
    totalWageThisMonth: 0,
    avgHourlyRate: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [empRes, entriesRes] = await Promise.all([
      supabase.from('employees').select('hourly_rate'),
      supabase.from('work_entries').select('total_hours, total_wage, date').gte('date', firstDayOfMonth)
    ]);

    if (empRes.data) {
      const avg = empRes.data.length > 0 
        ? empRes.data.reduce((acc, curr) => acc + Number(curr.hourly_rate), 0) / empRes.data.length 
        : 0;
      setStats(prev => ({ ...prev, totalEmployees: empRes.data.length, avgHourlyRate: avg }));
    }

    if (entriesRes.data) {
      const totalHours = entriesRes.data.reduce((acc, curr) => acc + Number(curr.total_hours), 0);
      const totalWage = entriesRes.data.reduce((acc, curr) => acc + Number(curr.total_wage), 0);
      setStats(prev => ({ ...prev, totalHoursThisMonth: totalHours, totalWageThisMonth: totalWage }));

      // Prepare daily chart data for this month
      const dailyMap: Record<string, number> = {};
      entriesRes.data.forEach(entry => {
        const d = entry.date.split('-')[2];
        dailyMap[d] = (dailyMap[d] || 0) + Number(entry.total_wage);
      });

      const formattedData = Object.keys(dailyMap).sort().map(day => ({
        day,
        wage: Math.round(dailyMap[day])
      }));
      setChartData(formattedData);
    }

    setLoading(false);
  };

  const statCards = [
    { label: 'Employees', value: stats.totalEmployees, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Hours (Month)', value: `${stats.totalHoursThisMonth.toFixed(1)}h`, icon: Clock, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Wages (Month)', value: `$${stats.totalWageThisMonth.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Avg Rate', value: `$${stats.avgHourlyRate.toFixed(2)}/h`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Overview</h2>
        <p className="text-slate-500">Business performance summary for {new Date().toLocaleString('default', { month: 'long' })}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{card.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Daily Wage Distribution (CAD)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="wage" radius={[4, 4, 0, 0]}>
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
