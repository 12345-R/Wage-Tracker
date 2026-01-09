
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  FileText, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  userEmail: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userEmail }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'entries', label: 'Time Logs', icon: Clock },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">WageCalc<span className="text-slate-400 font-normal">CA</span></h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold text-indigo-600">WageCalcCA</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white">
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 px-6 space-y-4 pt-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-4 text-lg font-medium rounded-xl ${
                    activeTab === item.id 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600'
                  }`}
                >
                  <item.icon className="w-6 h-6 mr-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-4 text-lg font-medium text-red-600 rounded-xl"
              >
                <LogOut className="w-6 h-6 mr-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
