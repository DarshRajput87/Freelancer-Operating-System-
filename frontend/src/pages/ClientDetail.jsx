import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Mail, Phone, Globe, Building2, Edit2, Trash2, StickyNote, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClientStore } from '../store';
import { Button, Badge, Avatar, Card, Modal, Input, Select, Textarea, PageLoader } from '../components/ui';
import { format } from 'date-fns';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentClient: client, loading, fetchClient, updateClient, deleteClient, addNote } = useClientStore();
  const [showEdit, setShowEdit] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchClient(id); }, [id]);

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateClient(id, data);
      setShowEdit(false);
      toast.success('Client updated!');
    } catch (_) {} finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Archive client "${client?.name}"? This cannot be undone.`)) return;
    await deleteClient(id);
    toast.success('Client archived');
    navigate('/clients');
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    await addNote(id, noteText);
    setNoteText('');
    toast.success('Note added');
  };

  const handleStatusChange = async (status) => {
    await updateClient(id, { status });
    toast.success(`Status updated to ${status}`);
  };

  if (loading && !client) return <PageLoader />;
  if (!client) return <div className="p-8 text-gray-400">Client not found</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back */}
      <Link to="/clients" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-200 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar name={client.name} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-white font-display">{client.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {client.company && <span className="text-sm text-gray-400 flex items-center gap-1"><Building2 className="w-3 h-3" />{client.company}</span>}
              <Badge status={client.status} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Edit2} size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
          <Button variant="danger" icon={Trash2} size="sm" onClick={handleDelete}>Archive</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left - Info */}
        <div className="col-span-1 space-y-4">
          <Card>
            <div className="p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact Info</h3>
              <div className="space-y-3">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <Mail className="w-4 h-4 text-gray-600" /> {client.email}
                  </a>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone className="w-4 h-4 text-gray-600" /> {client.phone}
                  </div>
                )}
                {client.website && (
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors">
                    <Globe className="w-4 h-4" /> {client.website}
                  </a>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Pipeline Status</h3>
              <div className="space-y-2">
                {['Lead', 'Contacted', 'Proposal Sent', 'Won', 'Lost'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      client.status === s ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                  >
                    {client.status === s && '● '}{s}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {client.tags?.length > 0 && (
            <Card>
              <div className="p-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 text-xs">{t}</span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <Card>
            <div className="p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Revenue</h3>
              <div className="text-2xl font-bold text-emerald-400 font-display">${(client.totalRevenue || 0).toLocaleString()}</div>
              <div className="text-xs text-gray-600 mt-1">Total paid invoices</div>
            </div>
          </Card>
        </div>

        {/* Right - Projects & Notes */}
        <div className="col-span-2 space-y-6">
          {/* Projects */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Projects</h3>
                <Link to={`/projects?client=${id}`}>
                  <Button variant="ghost" size="sm" icon={Plus}>New Project</Button>
                </Link>
              </div>
              {client.projects?.length > 0 ? (
                <div className="space-y-3">
                  {client.projects.map((p) => (
                    <Link key={p._id} to={`/projects/${p._id}`} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-200">{p.name}</div>
                          {p.deadline && <div className="text-xs text-gray-500">Due {format(new Date(p.deadline), 'MMM d, yyyy')}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-emerald-400">${(p.budget || 0).toLocaleString()}</span>
                        <Badge status={p.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 text-sm">No projects yet</div>
              )}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Notes</h3>
              <form onSubmit={handleAddNote} className="flex gap-2 mb-5">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button type="submit" size="sm" icon={Plus}>Add</Button>
              </form>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {client.notes?.length > 0 ? (
                  [...client.notes].reverse().map((note) => (
                    <div key={note._id} className="p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                      <p className="text-sm text-gray-300">{note.content}</p>
                      <p className="text-xs text-gray-600 mt-1">{format(new Date(note.createdAt), 'MMM d, yyyy · h:mm a')}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-600 text-sm">
                    <StickyNote className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    No notes yet
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Client" size="md">
        <ClientEditForm client={client} onSubmit={handleUpdate} loading={saving} />
      </Modal>
    </div>
  );
}

function ClientEditForm({ client, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: client.name || '', email: client.email || '', phone: client.phone || '',
    company: client.company || '', website: client.website || '',
    status: client.status || 'Lead', tags: client.tags?.join(', ') || '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) }); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Name *" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        <Input label="Company" value={form.company} onChange={(e) => set('company', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          {['Lead', 'Contacted', 'Proposal Sent', 'Won', 'Lost'].map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Input label="Tags" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="web, mobile" />
      </div>
      <Button type="submit" loading={loading} className="w-full">Update Client</Button>
    </form>
  );
}
