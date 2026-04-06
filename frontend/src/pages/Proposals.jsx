import { useState, useEffect } from 'react';
import {
  FileText, Download, Trash2, Send, CheckCircle, XCircle,
  Eye, Clock, ChevronDown, ChevronRight, Search, Sparkles, Copy, MoreHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useProposalStore } from '../store';
import { proposalAPI } from '../api';
import { Button, Badge, Card, Modal, EmptyState, PageLoader } from '../components/ui';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const STATUS_TABS = ['All', 'Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];

const STATUS_ACTIONS = {
  Draft: [
    { label: 'Mark Sent', status: 'Sent', icon: Send, color: 'text-blue-400 hover:bg-blue-500/10' },
  ],
  Sent: [
    { label: 'Accepted', status: 'Accepted', icon: CheckCircle, color: 'text-emerald-400 hover:bg-emerald-500/10' },
    { label: 'Rejected', status: 'Rejected', icon: XCircle, color: 'text-red-400 hover:bg-red-500/10' },
  ],
};

function ProposalSection({ label, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!content) return null;
  return (
    <div className="border-b border-gray-800 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/30 transition-colors">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-gray-600" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-600" />}
      </button>
      {open && (
        <div className="px-4 pb-4 animate-in fade-in">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      )}
    </div>
  );
}

function DetailModal({ proposal, onClose, onUpdate, onDelete, onDownload }) {
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!proposal) return null;

  const sections = [
    { key: 'intro', label: 'Introduction' },
    { key: 'understanding', label: 'Understanding' },
    { key: 'scope', label: 'Scope of Work' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'pricing', label: 'Investment' },
    { key: 'terms', label: 'Terms' },
    { key: 'whyMe', label: 'Why Choose Us' },
  ];

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(proposal._id);
      toast.success('Proposal deleted');
      onClose();
    } catch (_) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const statusActions = STATUS_ACTIONS[proposal.status] || [];

  const handleCopyAll = () => {
    const text = proposal.fullContent || Object.values(proposal.content || {}).filter(Boolean).join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Modal isOpen={!!proposal} onClose={onClose} title={proposal.title} size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2">
            {showDeleteConfirm ? (
              <>
                <span className="text-xs text-red-400 mr-2 self-center">Are you sure?</span>
                <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>Yes, Delete</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setShowDeleteConfirm(true)}
                className="!text-red-400 hover:!bg-red-500/10">Delete</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={Copy} onClick={handleCopyAll}>Copy</Button>
            <Button variant="secondary" size="sm" icon={Download} onClick={() => onDownload(proposal._id)}>PDF</Button>
            {statusActions.map((action) => (
              <Button key={action.status} size="sm" icon={action.icon}
                onClick={() => { onUpdate(proposal._id, { status: action.status }); onClose(); }}>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      }>
      <div className="space-y-4">
        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge status={proposal.status} />
          {proposal.client && (
            <span className="text-xs text-gray-500">
              Client: <span className="text-gray-300">{proposal.client.name}</span>
              {proposal.client.company && <span className="text-gray-600"> ({proposal.client.company})</span>}
            </span>
          )}
          {proposal.project && (
            <span className="text-xs text-gray-500">
              Project: <span className="text-gray-300">{proposal.project.name}</span>
            </span>
          )}
          {proposal.budget && (
            <span className="text-xs text-gray-500">
              Budget: <span className="text-emerald-400 font-medium">${proposal.budget.toLocaleString()}</span>
            </span>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>Created {format(new Date(proposal.createdAt), 'MMM d, yyyy h:mm a')}</span>
          {proposal.sentAt && <span>Sent {format(new Date(proposal.sentAt), 'MMM d, yyyy')}</span>}
        </div>

        {/* Content Sections */}
        <Card className="overflow-hidden">
          {sections.map(({ key, label }, i) => (
            <ProposalSection key={key} label={label} content={proposal.content?.[key]} defaultOpen={i === 0} />
          ))}
          {/* Full content fallback */}
          {!proposal.content?.intro && proposal.fullContent && (
            <div className="p-4">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{proposal.fullContent}</p>
            </div>
          )}
        </Card>

        {/* Generation Info */}
        {proposal.generationInput?.tone && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Sparkles className="w-3 h-3" />
            <span>AI-generated · {proposal.generationInput.tone} tone</span>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function Proposals() {
  const { proposals, loading, fetchProposals, updateProposal, deleteProposal } = useProposalStore();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchProposals(); }, []);

  const handleStatusUpdate = async (id, data) => {
    try {
      await updateProposal(id, data);
      toast.success(`Status updated to ${data.status}`);
    } catch (_) { toast.error('Failed to update'); }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const blob = await proposalAPI.downloadPDF(id);
      const url = URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) { toast.error('PDF download failed'); }
  };

  // Filter
  const filtered = proposals.filter((p) => {
    const matchesTab = activeTab === 'All' || p.status === activeTab;
    const matchesSearch = !searchQuery || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Stats
  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === 'Draft').length,
    sent: proposals.filter((p) => p.status === 'Sent').length,
    accepted: proposals.filter((p) => p.status === 'Accepted').length,
    rejected: proposals.filter((p) => p.status === 'Rejected').length,
  };

  const winRate = stats.accepted + stats.rejected > 0
    ? Math.round((stats.accepted / (stats.accepted + stats.rejected)) * 100)
    : 0;

  if (loading && !proposals.length) return <PageLoader />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Proposals</h1>
          <p className="text-sm text-gray-500 mt-1">{proposals.length} total proposals</p>
        </div>
        <Button icon={Sparkles} onClick={() => navigate('/ai/proposal')}>Generate New</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-display">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Proposals</div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-display">{stats.sent}</div>
            <div className="text-sm text-gray-500">Awaiting Response</div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-display">{stats.accepted}</div>
            <div className="text-sm text-gray-500">Accepted</div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-display">{winRate}%</div>
            <div className="text-sm text-gray-500">Win Rate</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
          {STATUS_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-gray-200'
              }`}>
              {tab}
              {tab !== 'All' && (
                <span className="ml-1 text-[10px] opacity-60">
                  {proposals.filter((p) => p.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proposals..."
            className="pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors w-64"
          />
        </div>
      </div>

      {/* Proposal List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={searchQuery ? 'No proposals found' : 'No proposals yet'}
          description={searchQuery ? 'Try a different search term' : 'Generate your first proposal with AI'}
          action={!searchQuery && <Button icon={Sparkles} onClick={() => navigate('/ai/proposal')}>Generate Proposal</Button>}
        />
      ) : (
        <Card>
          <div className="divide-y divide-gray-800">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span className="col-span-4">Title</span>
              <span className="col-span-2">Client</span>
              <span className="col-span-2">Created</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-1 text-right">Budget</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>

            {/* Rows */}
            {filtered.map((p) => {
              const statusActions = STATUS_ACTIONS[p.status] || [];
              return (
                <div key={p._id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-800/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedProposal(p)}>
                  {/* Title */}
                  <div className="col-span-4">
                    <div className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                      {p.title}
                    </div>
                    {p.generationInput?.tone && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-purple-500/60" />
                        <span className="text-[10px] text-gray-600">AI · {p.generationInput.tone}</span>
                      </div>
                    )}
                  </div>

                  {/* Client */}
                  <div className="col-span-2">
                    <div className="text-sm text-gray-400 truncate">{p.client?.name || '—'}</div>
                    {p.client?.company && <div className="text-xs text-gray-600 truncate">{p.client.company}</div>}
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-sm text-gray-500">
                    {format(new Date(p.createdAt), 'MMM d, yyyy')}
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <Badge status={p.status} />
                  </div>

                  {/* Budget */}
                  <div className="col-span-1 text-right text-sm font-medium text-gray-300">
                    {p.budget ? `$${p.budget.toLocaleString()}` : '—'}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {statusActions.map((action) => (
                      <button key={action.status}
                        onClick={() => handleStatusUpdate(p._id, { status: action.status })}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${action.color}`}
                        title={action.label}>
                        <action.icon className="w-3 h-3" />
                        <span className="hidden xl:inline">{action.label}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => handleDownloadPDF(p._id)}
                      className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Download PDF">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedProposal(p)}
                      className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                      title="View Details">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      <DetailModal
        proposal={selectedProposal}
        onClose={() => setSelectedProposal(null)}
        onUpdate={handleStatusUpdate}
        onDelete={deleteProposal}
        onDownload={handleDownloadPDF}
      />
    </div>
  );
}
