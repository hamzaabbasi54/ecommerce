"use client";

import { useState } from 'react';
import useAuthStore from '@/context/useAuthStore';
import { useRouter } from 'next/navigation';
import PersonalInfoForm from './PersonalInfoForm';
import SecuritySettingsForm from './SecuritySettingsForm';
import AddressManager from './AddressManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfileLayoutClient() {
  const { user, isAuthenticated, loading } = useAuthStore();
  const router = useRouter();

  // Wait for auth check
  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined animate-spin text-[32px] text-primary">sync</span>
      </main>
    );
  }

  // Redirect if not logged in
  if (!isAuthenticated || !user) {
    router.push('/login?redirect=/profile');
    return null;
  }

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: 'person' },
    { id: 'security', label: 'Security & Password', icon: 'lock' },
    { id: 'addresses', label: 'Addresses', icon: 'location_on' },
  ];

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-10 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your account details and preferences.</p>
      </div>

      <Tabs defaultValue="personal" orientation="vertical" className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 shrink-0 bg-surface-container-lowest border border-border rounded-xl p-4 sticky top-24 shadow-sm">
          <TabsList className="flex flex-col space-y-2 h-auto bg-transparent p-0 w-full items-stretch">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-3 w-full justify-start px-4 py-3 rounded-lg transition-colors duration-200 font-medium text-muted-foreground hover:bg-surface-container hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:hover:bg-primary data-[state=active]:hover:text-primary-foreground"
              >
                <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>{tab.icon}</span>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 w-full min-w-0 bg-surface-container-lowest border border-border rounded-xl p-6 md:p-8 shadow-sm min-h-[500px]">
          <TabsContent value="personal" className="mt-0 outline-none">
            <PersonalInfoForm user={user} />
          </TabsContent>
          <TabsContent value="security" className="mt-0 outline-none">
            <SecuritySettingsForm />
          </TabsContent>
          <TabsContent value="addresses" className="mt-0 outline-none">
            <AddressManager />
          </TabsContent>
        </section>
      </Tabs>
    </main>
  );
}
