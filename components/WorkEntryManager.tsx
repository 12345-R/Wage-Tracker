
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Employee, WorkEntryWithEmployee } from '../types';
import { Plus, Trash2, Calendar, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

const WorkEntryManager: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<WorkEntryWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form fields
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [empRes, entRes] = await Promise.all([
      supabase.from('employees').select('*').order('name'),
      supabase.from('work_entries').select('*, employees(name, hourly_rate)').order('date', { ascending: false }).limit(50)
    ]);
    
    if (empRes.data) setEmployees(empRes.data);
    if (entRes.data) setEntries(entRes.data as any);
    setLoading(false);
  };

  const calculateHours = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let diff = (endH + endM / 60) - (startH + startM / 60);
    if (diff < 0) diff += 24; // Handle overnight shifts if needed
    return Math.round(diff * 100) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const totalHours = calculateHours(startTime, endTime);
    if (totalHours <= 0) {
      alert("Invalid time entry: End time must be after start time.");
      return;
    }

    const totalWage = Math.round(totalHours * emp.hourly_rate * 100) / 100;

    const { error } = await supabase.from('work_entries').insert([{
      employee_id: employeeId,
      date,
      start_time: startTime,
      end_time: endTime,
      total_hours: totalHours,
      total_wage: totalWage
    }]);

    if (!error) {
      fetchData();
      setIsModalOpen(false);
      resetForm();
    } else {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setEmployeeId('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:00');
    setEndTime('17:00');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this work entry?')) return;
    const { error } = await supabase.from('work_entries').delete().eq('id', id);
    if (!error) fetchData();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Time Logs</h2>
          <p className="text-slate-500">Track and manage employee work hours</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Entry
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Shift</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Wage (CAD)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No entries recorded recently.</td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700">{entry.employees.name}</td>
                      <td className="px-6 py-4 text-slate-600">{entry.date}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center text-xs">
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{entry.start_time.slice(0, 5)}</span>
                          <ChevronRight className="w-3 h-3 mx-1 text-slate-300" />
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{entry.end_time.slice(0, 5)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{entry.total_hours.toFixed(2)} hrs</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600">${entry.total_wage.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add Time Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Employee</label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                >
                  <option value="">Choose an employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} (${emp.hourly_rate.toFixed(2)}/hr)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="date"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hours Preview</label>
                  <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-600 font-bold border border-slate-100">
                    {calculateHours(startTime, endTime)} Hours
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="time"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="time"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkEntryManager;
