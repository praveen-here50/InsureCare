'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import {
  FiUser,
  FiGlobe,
  FiBell,
  FiLock,
  FiHelpCircle,
  FiLogOut,
  FiChevronRight,
} from 'react-icons/fi';

export default function SettingsPage() {
  const [language, setLanguage] = useState('english');
  const [textSize, setTextSize] = useState('medium');
  const [reducedMotion, setReducedMotion] = useState(false);

  const [notifications, setNotifications] = useState({
    policyReminders: true,
    claimUpdates: true,
    documentUpdates: true,
    hospitalAlerts: true,
    schemeUpdates: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSignOut = () => {
    window.location.href = '/';
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your preferences, notifications, language, and privacy.
        </p>
        <div className="mt-3">
          <Badge tone="blue">Synthetic demo account</Badge>
        </div>
      </div>

      {/* Profile Section */}
      <Card>
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                <FiUser className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Profile Information</h2>
                <p className="text-sm text-slate-500">Manage your account details</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <p className="mt-1 text-sm text-slate-900">Priya Sharma</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Member ID</label>
                <p className="mt-1 font-mono text-sm text-slate-900">DEMO-PS-2024-7834</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="mt-1 text-sm text-slate-900">demo.patient@insurecare.local</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <p className="mt-1 text-sm text-slate-900">+91 98765 DEMO 01</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
                Edit profile
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Language & Accessibility */}
      <Card>
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <FiGlobe className="h-5 w-5 text-slate-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Language & Accessibility</h2>
              <p className="text-sm text-slate-500">Language, text size, and motion preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-4">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Preferred Language</label>
            <div className="mt-3 space-y-2">
              {[
                { value: 'english', label: 'English' },
                { value: 'tamil', label: 'Tamil (தமிழ்)' },
                { value: 'hindi', label: 'Hindi (हिन्दी)' },
              ].map(lang => (
                <label key={lang.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value={lang.value}
                    checked={language === lang.value}
                    onChange={e => setLanguage(e.target.value)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className="text-sm text-slate-900">{lang.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Text Size */}
          <div className="border-t border-gray-100 pt-4">
            <label className="block text-sm font-medium text-slate-700">Text Size</label>
            <div className="mt-3 space-y-2">
              {[
                { value: 'small', label: 'Small', preview: 'text-sm' },
                { value: 'medium', label: 'Medium (Default)', preview: 'text-base' },
                { value: 'large', label: 'Large', preview: 'text-lg' },
              ].map(size => (
                <label key={size.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="textSize"
                    value={size.value}
                    checked={textSize === size.value}
                    onChange={e => setTextSize(e.target.value)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className={`text-slate-900 ${size.preview}`}>{size.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={e => setReducedMotion(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Reduce motion</p>
                <p className="text-xs text-slate-500">Minimize animations and transitions</p>
              </div>
            </label>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <FiBell className="h-5 w-5 text-slate-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Notifications</h2>
              <p className="text-sm text-slate-500">Control how and when you receive updates</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-4">
          {[
            { key: 'policyReminders', label: 'Policy renewal reminders', description: 'Get notified about upcoming policy renewals' },
            { key: 'claimUpdates', label: 'Claim updates', description: 'Receive updates on your claim status' },
            { key: 'documentUpdates', label: 'Document updates', description: 'Be notified when new documents are ready' },
            { key: 'hospitalAlerts', label: 'Hospital/healthcare alerts', description: 'Important healthcare facility announcements' },
            { key: 'schemeUpdates', label: 'Government scheme updates', description: 'New healthcare scheme information' },
          ].map(item => (
            <label
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 cursor-pointer hover:bg-slate-50"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
              <input
                type="checkbox"
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={() => handleNotificationChange(item.key as keyof typeof notifications)}
                className="ml-4 h-4 w-4 accent-blue-600"
              />
            </label>
          ))}
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <FiLock className="h-5 w-5 text-slate-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Privacy & Security</h2>
              <p className="text-sm text-slate-500">Manage your data and privacy settings</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Demo Notice:</span> Security, encryption, and authentication features are placeholder. Full backend integration coming soon.
            </p>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Document privacy</p>
                <p className="text-xs text-slate-500">Control document access permissions</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Manage
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">AI assistant data usage</p>
                <p className="text-xs text-slate-500">Your data usage in AI interactions</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Session information</p>
                <p className="text-xs text-slate-500">Active sessions and login history</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Help & Account */}
      <Card>
        <div className="space-y-2 px-6 py-4">
          <button className="flex w-full items-center justify-between rounded-lg border border-gray-100 px-4 py-3 hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <FiHelpCircle className="h-5 w-5 text-slate-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">Help & Support</p>
                <p className="text-xs text-slate-500">FAQs and contact support</p>
              </div>
            </div>
            <FiChevronRight className="h-5 w-5 text-slate-400" />
          </button>

          <div className="flex gap-2 border-t border-gray-100 pt-4">
            <button className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50">
              Privacy Policy
            </button>
            <button className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50">
              Terms of Service
            </button>
          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 hover:bg-red-100"
          >
            <div className="flex items-center gap-3">
              <FiLogOut className="h-5 w-5 text-red-600" />
              <p className="text-sm font-medium text-red-900">Sign out</p>
            </div>
            <FiChevronRight className="h-5 w-5 text-red-400" />
          </button>
        </div>
      </Card>
    </div>
  );
}
