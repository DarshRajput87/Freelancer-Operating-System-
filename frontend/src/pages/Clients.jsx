import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Mail, Phone, Building2, Tag, StickyNote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClientStore } from '../store';
import { Button, Badge, Avatar, Card, Modal, Input, Select, Textarea, EmptyState, PageLoader } from '../components/ui';

const STATUS_TABS = ['All', 'Lead', 'Contacted', 'Proposal Sent', 'Won', 'Lost'];

function ClientForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', website: '',
    status: 'Lead', source: 'Other', ...initial,
    tags: initial.tags?.join(', ') || '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    onSubmit({ ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full Name *" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="John Smith" required />
        <Input label="Company" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Inc." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="john@acme.com" />
        <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 234 567 8900" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          {['Lead', 'Contacted', 'Proposal Sent', 'Won', 'Lost'].map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Select label="Source" value={form.source} onChange={(e) => set('source', e.target.value)}>
          {['Referral', 'LinkedIn', 'Upwork', 'Website', 'Cold Outreach', 'Other'].map((s) => <option key={s}>{s}</option>)}
        </Select>
      </div>
      <Input label="Website" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://acme.com" />
      <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="web, mobile, ecommerce" />
      <Button type="submit" loading={loading} className="w-full">Save Client</Button>
    </form>
  );
}

function ClientCard({ client, onClick }) {
  return (
    <Card hover onClick={() => onClick(client._id)} className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} size="md" />
          <div>
            <div className="font-semibold text-white text-sm">{client.name}</div>
            <div className="text-xs text-gray-500">{client.company || 'Individual'}</div>
          </div>
        </div>
        <Badge status={client.status} />
      </div>
      <div className="space-y-1.5 mb-4">
        {client.email && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail className="w-3 h-3" /> <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone className="w-3 h-3" /> {client.phone}
          </div>
        )}
      </div>
      {client.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {client.tags.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 text-xs">{t}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <span className="text-xs text-gray-600">{client.projectCount || 0} projects</span>
        <span className="text-xs text-emerald-400 font-medium">${(client.totalRevenue || 0).toLocaleString()}</span>
      </div>
    </Card>
  );
}

export default function Clients() {
  const { clients, loading, fetchClients, createClient } = useClientStore();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchClients(); }, []);

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      await createClient(data);
      setShowModal(false);
      toast.success('Client added!');
    } catch (_) {} finally { setCreating(false); }
  };

  const filtered = clients.filter((c) => {
    const matchStatus = activeTab === 'All' || c.status === activeTab;
    const matchSearch = !search || [c.name, c.company, c.email].some((f) =>
      f?.toLowerCase().includes(search.toLowerCase())
    );
    return matchStatus && matchSearch;
  });

  if (loading && !clients.length) return <PageLoader />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">{clients.length} total clients</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Add Client</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
          />
        </div>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No clients found' : 'No clients yet'}
          description={search ? 'Try a different search term' : 'Add your first client to get started'}
          action={!search && <Button icon={Plus} onClick={() => setShowModal(true)}>Add Client</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <Link key={c._id} to={`/clients/${c._id}`}>
              <ClientCard client={c} onClick={() => {}} />
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Client" size="md">
        <ClientForm onSubmit={handleCreate} loading={creating} />
      </Modal>
    </div>
  );
}
