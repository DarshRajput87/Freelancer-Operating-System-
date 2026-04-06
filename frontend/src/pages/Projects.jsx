import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, FolderOpen, Calendar, DollarSign, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProjectStore, useClientStore } from '../store';
import { Button, Badge, Card, Modal, Input, Select, Textarea, EmptyState, ProgressBar, Avatar, PageLoader } from '../components/ui';
import { format } from 'date-fns';

const STATUS_TABS = ['All', 'Planning', 'In Progress', 'Review', 'Completed', 'On Hold'];

function ProjectForm({ onSubmit, loading, clients = [] }) {
  const [form, setForm] = useState({
    name: '', client: '', description: '', budget: '', status: 'Planning',
    priority: 'Medium', startDate: '', deadline: '', rawRequirement: '', techStack: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!form.name || !form.client) return toast.error('Name and client required');
      onSubmit({ ...form, budget: Number(form.budget) || 0, techStack: form.techStack.split(',').map((t) => t.trim()).filter(Boolean) });
    }} className="space-y-4">
      <Input label="Project Name *" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="E-commerce Redesign" required />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Client *" value={form.client} onChange={(e) => set('client', e.target.value)} required>
          <option value="">Select client...</option>
          {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </Select>
        <Input label="Budget ($)" type="number" value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder="5000" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          {['Planning', 'In Progress', 'Review', 'Completed', 'On Hold'].map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Select label="Priority" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
          {['Low', 'Medium', 'High', 'Urgent'].map((s) => <option key={s}>{s}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
        <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
      </div>
      <Textarea label="Requirements" value={form.rawRequirement} onChange={(e) => set('rawRequirement', e.target.value)} placeholder="Describe what needs to be built..." rows={3} />
      <Input label="Tech Stack (comma separated)" value={form.techStack} onChange={(e) => set('techStack', e.target.value)} placeholder="React, Node.js, MongoDB" />
      <Button type="submit" loading={loading} className="w-full">Create Project</Button>
    </form>
  );
}

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project._id}`}>
      <Card hover className="p-5 h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            <h3 className="font-semibold text-white text-sm truncate">{project.name}</h3>
            {project.client && (
              <div className="flex items-center gap-1.5 mt-1">
                <Avatar name={project.client.name} size="xs" />
                <span className="text-xs text-gray-500 truncate">{project.client.name}</span>
              </div>
            )}
          </div>
          <Badge status={project.status} />
        </div>

        {project.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{project.description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-400">{project.progress || 0}%</span>
          </div>
          <ProgressBar value={project.progress || 0} />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span className="text-emerald-400 font-medium">${(project.budget || 0).toLocaleString()}</span>
          </div>
          {project.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(project.deadline), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {project.taskStats && (
          <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-600">
            {project.taskStats.done}/{project.taskStats.total} tasks done
          </div>
        )}
      </Card>
    </Link>
  );
}

export default function Projects() {
  const { projects, loading, fetchProjects, createProject } = useProjectStore();
  const { clients, fetchClients } = useClientStore();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const clientId = searchParams.get('client');
    fetchProjects(clientId ? { client: clientId } : {});
    fetchClients();
  }, []);

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      await createProject(data);
      setShowModal(false);
      toast.success('Project created!');
    } catch (_) {} finally { setCreating(false); }
  };

  const filtered = projects.filter((p) => {
    const matchStatus = activeTab === 'All' || p.status === activeTab;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading && !projects.length) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} total projects</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>New Project</Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..."
            className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 w-64" />
        </div>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {STATUS_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-gray-200'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No projects found" description="Create your first project to get started"
          action={<Button icon={Plus} onClick={() => setShowModal(true)}>New Project</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => <ProjectCard key={p._id} project={p} />)}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Project" size="lg">
        <ProjectForm onSubmit={handleCreate} loading={creating} clients={clients} />
      </Modal>
    </div>
  );
}
