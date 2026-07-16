"use client";

import { useState } from 'react';
import useAuthStore from '@/context/useAuthStore';
import PersonalInfoForm from '@/components/profile/PersonalInfoForm';
import SecuritySettingsForm from '@/components/profile/SecuritySettingsForm';
import { User, Lock } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'security', label: 'Security & Password', icon: Lock },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your admin account details and security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Tab Navigation */}
        <aside className="w-full lg:w-56 shrink-0 bg-white border border-slate-200 rounded-xl p-3 lg:sticky lg:top-24 shadow-sm">
          <nav className="flex lg:flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 font-medium text-sm ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <section className="flex-1 w-full min-w-0 bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm min-h-[500px]">
          {activeTab === 'personal' && <PersonalInfoForm user={user} />}
          {activeTab === 'security' && <SecuritySettingsForm />}
        </section>
      </div>
    </div>
  );
}
