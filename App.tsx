
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import EmployeeManager from './components/EmployeeManager';
import WorkEntryManager from './components/WorkEntryManager';
import Reports from './components/Reports';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'entries' | 'reports'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} userEmail={session.user.email}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'employees' && <EmployeeManager />}
      {activeTab === 'entries' && <WorkEntryManager />}
      {activeTab === 'reports' && <Reports />}
    </Layout>
  );
};

export default App;
