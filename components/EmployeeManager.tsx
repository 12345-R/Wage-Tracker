
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Employee } from '../types';
import { UserPlus, Edit2, Trash2, X, Check } from 'lucide-react';

const EmployeeManager: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('15.50');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name', { ascending: true });
    
    if (!error) setEmployees(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(hourlyRate);
    if (isNaN(rate)) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingEmployee) {
      const { error } = await supabase
        .from('employees')
        .update({ name, hourly_rate: rate })
        .eq('id', editingEmployee.id);
      
      if (!error) {
        fetchEmployees();
        closeModal();
      }
    } else {
      // Limit check
      if (employees.length >= 15) {
        alert("Maximum limit of 15 employees reached for the free tier.");
        return;
      }

      const { error } = await supabase
        .from('employees')
        .insert([{ name, hourly_rate: rate, employer_id: user.id }]);
      
      if (!error) {
        fetchEmployees();
        closeModal();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee? This will delete all their work history.')) return;
    
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) fetchEmployees();
  };

  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setName(employee.name);
      setHourlyRate(employee.hourly_rate.toString());
    } else {
      setEditingEmployee(null);
      setName('');
      setHourlyRate('15.50');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setName('');
    setHourlyRate('15.50');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Employees</h2>
          <p className="text-slate-500">Manage your team and their hourly rates ({employees.length}/15)</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Add Employee
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
          <p className="text-slate-400 mb-4">No employees added yet.</p>
          <button onClick={() => openModal()} className="text-indigo-600 font-bold hover:underline">
            Click here to add your first employee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div key={emp.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {emp.name.charAt(0)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(emp)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(emp.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{emp.name}</h3>
              <div className="flex items-center text-slate-500">
                <span className="text-2xl font-bold text-indigo-600">${emp.hourly_rate.toFixed(2)}</span>
                <span className="ml-2 text-sm">/ hr CAD</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Smith"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hourly Rate (CAD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {editingEmployee ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;
