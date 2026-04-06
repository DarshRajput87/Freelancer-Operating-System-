import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Key, User, Building, DollarSign, Globe,
  Save, Eye, EyeOff, Trash2, Shield, CheckCircle, AlertTriangle, ExternalLink, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { authAPI } from '../api';
import { Button, Card, Input, Select } from '../components/ui';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY'];
const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Tokyo',
  'Asia/Shanghai', 'Australia/Sydney', 'Pacific/Auckland',
];

function SectionCard({ icon: Icon, title, description, children, badge }) {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-brand-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              {badge}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </Card>
  );
}

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [deletingKey, setDeletingKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    name: '',
    currency: 'USD',
    timezone: 'UTC',
    hourlyRate: 0,
    businessName: '',
    businessAddress: '',
  });

  // API Key form
  const [apiKey, setApiKey] = useState('');
  const hasKey = user?.settings?.hasGeminiKey;

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        currency: user.settings?.currency || 'USD',
        timezone: user.settings?.timezone || 'UTC',
        hourlyRate: user.settings?.hourlyRate || 0,
        businessName: user.settings?.businessName || '',
        businessAddress: user.settings?.businessAddress || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: profile.name,
        settings: {
          currency: profile.currency,
          timezone: profile.timezone,
          hourlyRate: Number(profile.hourlyRate),
          businessName: profile.businessName,
          businessAddress: profile.businessAddress,
        },
      });
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch (_) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return toast.error('Please enter your API key');
    if (!apiKey.startsWith('AIza')) return toast.error('Invalid key format. Gemini keys start with "AIza"');

    setSavingKey(true);
    try {
      const res = await authAPI.updateApiKey(apiKey.trim());
      updateUser(res.data);
      setApiKey('');
      setShowKey(false);
      toast.success('API key saved & encrypted!');
    } catch (err) {
      toast.error(err.message || 'Failed to save API key');
    } finally {
      setSavingKey(false);
    }
  };

  const handleDeleteApiKey = async () => {
    setDeletingKey(true);
    try {
      const res = await authAPI.deleteApiKey();
      updateUser(res.data);
      setShowDeleteConfirm(false);
      toast.success('API key removed');
    } catch (_) {
      toast.error('Failed to remove API key');
    } finally {
      setDeletingKey(false);
    }
  };

  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile, business info, and API configuration</p>
      </div>

      <div className="space-y-6">
        {/* ── AI Configuration ────────────────────────────────────────────── */}
        <SectionCard
          icon={Key}
          title="Gemini API Key"
          description="Connect your own Google Gemini API key. All AI billing goes to your Google Cloud account."
          badge={
            hasKey ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                <CheckCircle className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3" /> Not Set
              </span>
            )
          }
        >
          <div className="space-y-4">
            {/* Info banner */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
              <Shield className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-400 leading-relaxed">
                <span className="text-gray-300 font-medium">Your key is encrypted at rest</span> using AES-256-CBC.
                It's never logged, never shared, and only decrypted at the moment of an API call.
                FreelanceOS never stores or reads your key in plain text.
              </div>
            </div>

            {/* Current status */}
            {hasKey && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Key className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-200 font-medium">API key is active</div>
                    <div className="text-xs text-gray-500">All AI tools are using your key</div>
                  </div>
                </div>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-400">Remove key?</span>
                    <Button variant="danger" size="sm" loading={deletingKey} onClick={handleDeleteApiKey}>Yes</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>No</Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setShowDeleteConfirm(true)}
                    className="!text-red-400 hover:!bg-red-500/10">Remove</Button>
                )}
              </div>
            )}

            {/* Input */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                {hasKey ? 'Replace API Key' : 'Enter Your API Key'}
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 pr-20 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-600 font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-300 transition-colors"
                  type="button"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Get your free API key from Google AI Studio
                <ExternalLink className="w-3 h-3" />
              </a>
              <Button icon={Save} loading={savingKey} onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                {hasKey ? 'Update Key' : 'Save Key'}
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* ── Profile Settings ────────────────────────────────────────────── */}
        <form onSubmit={handleSaveProfile}>
          <SectionCard icon={User} title="Profile" description="Your personal information">
            <div className="space-y-4">
              <Input label="Full Name" value={profile.name} onChange={(e) => set('name', e.target.value)} required />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Default Currency" value={profile.currency} onChange={(e) => set('currency', e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Select label="Timezone" value={profile.timezone} onChange={(e) => set('timezone', e.target.value)}>
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
                </Select>
              </div>
            </div>
          </SectionCard>

          {/* ── Business Settings ───────────────────────────────────────────── */}
          <div className="mt-6">
            <SectionCard icon={Building} title="Business Info" description="Used in invoices and proposals">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Business Name" value={profile.businessName} onChange={(e) => set('businessName', e.target.value)}
                    placeholder="Your Agency / Brand" />
                  <Input label="Hourly Rate" type="number" value={profile.hourlyRate} onChange={(e) => set('hourlyRate', e.target.value)}
                    placeholder="0" min={0} />
                </div>
                <Input label="Business Address" value={profile.businessAddress} onChange={(e) => set('businessAddress', e.target.value)}
                  placeholder="123 Main St, City, Country" />
              </div>
            </SectionCard>
          </div>

          {/* Save */}
          <div className="mt-6 flex justify-end">
            <Button type="submit" icon={Save} loading={saving}>Save Changes</Button>
          </div>
        </form>

        {/* ── About ────────────────────────────────────────────────────────── */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-display">FreelanceOS</div>
                <div className="text-xs text-gray-600">v1.0.0 · AI-Powered Freelancer Operating System</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
              <div>Plan: <span className="text-gray-300 capitalize">{user?.plan || 'free'}</span></div>
              <div>Member since: <span className="text-gray-300">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
              </span></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
