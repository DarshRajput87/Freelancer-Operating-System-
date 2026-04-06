import { useState, useEffect } from 'react';
import { Plus, Receipt, TrendingUp, Clock, AlertTriangle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useInvoiceStore, useClientStore, useProjectStore } from '../store';
import { invoiceAPI } from '../api';
import { Button, Badge, Card, Modal, Input, Select, Textarea, EmptyState, StatCard, PageLoader } from '../components/ui';
import { format } from 'date-fns';

const STATUS_TABS = ['All', 'Draft', 'Sent', 'Pending', 'Paid', 'Overdue'];

function LineItemRow({ item, index, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <input value={item.description} onChange={(e) => onChange(index, 'description', e.target.value)}
        placeholder="Description" className="col-span-5 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
      <input value={item.quantity} onChange={(e) => onChange(index, 'quantity', e.target.value)}
        type="number" min="0" placeholder="Qty" className="col-span-2 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500" />
      <input value={item.unitPrice} onChange={(e) => onChange(index, 'unitPrice', e.target.value)}
        type="number" min="0" placeholder="Price" className="col-span-2 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500" />
      <div className="col-span-2 text-sm text-gray-400 text-right">${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</div>
      <button type="button" onClick={() => onRemove(index)} className="col-span-1 text-gray-600 hover:text-red-400 transition-colors text-center">✕</button>
    </div>
  );
}

function InvoiceForm({ onSubmit, loading, clients, projects }) {
  const [form, setForm] = useState({ client: '', project: '', dueDate: '', notes: '', taxRate: 0, discount: 0, status: 'Draft', paymentTerms: 'Net 30' });
  const [lineItems, setLineItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const updateItem = (i, k, v) => setLineItems((items) => items.map((item, idx) => idx === i ? { ...item, [k]: k === 'description' ? v : Number(v) } : item));
  const addItem = () => setLineItems((items) => [...items, { description: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (i) => setLineItems((items) => items.filter((_, idx) => idx !== i));

  const subtotal = lineItems.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  const tax = (subtotal * (form.taxRate || 0)) / 100;
  const total = subtotal + tax - (form.discount || 0);

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!form.client || !form.dueDate) return toast.error('Client and due date required');
      onSubmit({ ...form, lineItems, taxRate: Number(form.taxRate), discount: Number(form.discount) });
    }} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Select label="Client *" value={form.client} onChange={(e) => set('client', e.target.value)} required>
          <option value="">Select client...</option>
          {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </Select>
        <Select label="Project" value={form.project} onChange={(e) => set('project', e.target.value)}>
          <option value="">No project</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Due Date *" type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} required />
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          {['Draft', 'Sent', 'Pending', 'Paid'].map((s) => <option key={s}>{s}</option>)}
        </Select>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Line Items</label>
          <button type="button" onClick={addItem} className="text-xs text-brand-400 hover:text-brand-300">+ Add Item</button>
        </div>
        <div className="grid grid-cols-12 gap-2 mb-2 text-xs text-gray-600 font-medium uppercase tracking-wide">
          <span className="col-span-5">Description</span>
          <span className="col-span-2">Qty</span>
          <span className="col-span-2">Unit Price</span>
          <span className="col-span-2 text-right">Amount</span>
        </div>
        <div className="space-y-2">
          {lineItems.map((item, i) => (
            <LineItemRow key={i} item={item} index={i} onChange={updateItem} onRemove={removeItem} />
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 flex-1">Tax (%)</span>
          <input type="number" value={form.taxRate} onChange={(e) => set('taxRate', e.target.value)} min="0" max="100"
            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-right text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          <span className="text-gray-400 w-24 text-right">${tax.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 flex-1">Discount ($)</span>
          <input type="number" value={form.discount} onChange={(e) => set('discount', e.target.value)} min="0"
            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-right text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="flex justify-between text-white font-semibold pt-2 border-t border-gray-700">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>

      <Textarea label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Payment instructions, thank you note..." rows={2} />
      <Button type="submit" loading={loading} className="w-full">Create Invoice</Button>
    </form>
  );
}

export default function Invoices() {
  const { invoices, stats, loading, fetchInvoices, fetchStats, createInvoice, updateInvoice, deleteInvoice } = useInvoiceStore();
  const { clients, fetchClients } = useClientStore();
  const { projects, fetchProjects } = useProjectStore();
  const [activeTab, setActiveTab] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchInvoices(); fetchStats(); fetchClients(); fetchProjects(); }, []);

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      await createInvoice(data);
      setShowModal(false);
      fetchStats();
      toast.success('Invoice created!');
    } catch (_) {} finally { setCreating(false); }
  };

  const handleMarkPaid = async (id) => {
    await updateInvoice(id, { status: 'Paid', paidDate: new Date() });
    fetchStats();
    toast.success('Marked as paid!');
  };

  const handleDownloadPDF = async (id, number) => {
    try {
      const blob = await invoiceAPI.downloadPDF(id);
      const url = URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a'); a.href = url; a.download = `${number}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (_) { toast.error('PDF download failed'); }
  };

  const filtered = activeTab === 'All' ? invoices : invoices.filter((i) => i.status === activeTab);

  if (loading && !invoices.length) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">{invoices.length} total invoices</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>New Invoice</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Paid" value={`$${(stats?.Paid?.total || 0).toLocaleString()}`} icon={TrendingUp} color="emerald" />
        <StatCard label="Pending" value={`$${(stats?.Pending?.total || 0).toLocaleString()}`} icon={Clock} color="amber" />
        <StatCard label="Overdue" value={`$${(stats?.Overdue?.total || 0).toLocaleString()}`} icon={AlertTriangle} color="red" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 w-fit">
        {STATUS_TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-brand-500 text-white' : 'text-gray-500 hover:text-gray-200'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      {filtered.length === 0 ? (
        <EmptyState icon={Receipt} title="No invoices found" description="Create your first invoice"
          action={<Button icon={Plus} onClick={() => setShowModal(true)}>New Invoice</Button>} />
      ) : (
        <Card>
          <div className="divide-y divide-gray-800">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span className="col-span-2">Invoice #</span>
              <span className="col-span-3">Client</span>
              <span className="col-span-2">Project</span>
              <span className="col-span-2">Due Date</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-1 text-right">Amount</span>
              <span className="col-span-1" />
            </div>
            {filtered.map((inv) => (
              <div key={inv._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-800/30 transition-colors">
                <div className="col-span-2 text-sm font-mono text-brand-400">{inv.invoiceNumber}</div>
                <div className="col-span-3">
                  <div className="text-sm font-medium text-gray-200">{inv.client?.name || '—'}</div>
                  <div className="text-xs text-gray-500">{inv.client?.company}</div>
                </div>
                <div className="col-span-2 text-sm text-gray-400 truncate">{inv.project?.name || '—'}</div>
                <div className="col-span-2 text-sm text-gray-400">{format(new Date(inv.dueDate), 'MMM d, yyyy')}</div>
                <div className="col-span-1"><Badge status={inv.status} /></div>
                <div className="col-span-1 text-right text-sm font-semibold text-white">${(inv.total || 0).toLocaleString()}</div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  {inv.status !== 'Paid' && (
                    <button onClick={() => handleMarkPaid(inv._id)} className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 hover:bg-emerald-500/10 rounded-lg transition-colors">
                      Paid
                    </button>
                  )}
                  <button onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)} className="p-1 text-gray-600 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Invoice" size="lg">
        <InvoiceForm onSubmit={handleCreate} loading={creating} clients={clients} projects={projects} />
      </Modal>
    </div>
  );
}
