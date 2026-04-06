import { create } from 'zustand';
import { clientAPI, projectAPI, taskAPI, invoiceAPI, dashboardAPI, proposalAPI } from '../api';

// ─── Client Store ─────────────────────────────────────────────────────────────
export const useClientStore = create((set, get) => ({
  clients: [],
  currentClient: null,
  loading: false,
  stats: null,

  fetchClients: async (params) => {
    set({ loading: true });
    try {
      const res = await clientAPI.getAll(params);
      set({ clients: res.data, loading: false });
    } catch (_) { set({ loading: false }); }
  },

  fetchClient: async (id) => {
    set({ loading: true });
    try {
      const res = await clientAPI.getOne(id);
      set({ currentClient: res.data, loading: false });
      return res.data;
    } catch (_) { set({ loading: false }); }
  },

  createClient: async (data) => {
    const res = await clientAPI.create(data);
    set((s) => ({ clients: [res.data, ...s.clients] }));
    return res.data;
  },

  updateClient: async (id, data) => {
    const res = await clientAPI.update(id, data);
    set((s) => ({
      clients: s.clients.map((c) => (c._id === id ? res.data : c)),
      currentClient: s.currentClient?._id === id ? res.data : s.currentClient,
    }));
    return res.data;
  },

  deleteClient: async (id) => {
    await clientAPI.delete(id);
    set((s) => ({ clients: s.clients.filter((c) => c._id !== id) }));
  },

  addNote: async (id, content) => {
    const res = await clientAPI.addNote(id, content);
    set((s) => ({
      currentClient: s.currentClient ? { ...s.currentClient, notes: res.data } : null,
    }));
  },

  fetchStats: async () => {
    const res = await clientAPI.getStats();
    set({ stats: res.data });
  },
}));

// ─── Project Store ────────────────────────────────────────────────────────────
export const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  loading: false,

  fetchProjects: async (params) => {
    set({ loading: true });
    try {
      const res = await projectAPI.getAll(params);
      set({ projects: res.data, loading: false });
    } catch (_) { set({ loading: false }); }
  },

  fetchProject: async (id) => {
    set({ loading: true });
    try {
      const res = await projectAPI.getOne(id);
      set({ currentProject: res.data, loading: false });
      return res.data;
    } catch (_) { set({ loading: false }); }
  },

  createProject: async (data) => {
    const res = await projectAPI.create(data);
    set((s) => ({ projects: [res.data, ...s.projects] }));
    return res.data;
  },

  updateProject: async (id, data) => {
    const res = await projectAPI.update(id, data);
    set((s) => ({
      projects: s.projects.map((p) => (p._id === id ? res.data : p)),
      currentProject: s.currentProject?._id === id ? res.data : s.currentProject,
    }));
    return res.data;
  },

  deleteProject: async (id) => {
    await projectAPI.delete(id);
    set((s) => ({ projects: s.projects.filter((p) => p._id !== id) }));
  },
}));

// ─── Task Store ───────────────────────────────────────────────────────────────
export const useTaskStore = create((set) => ({
  tasks: [],
  kanban: { Todo: [], 'In Progress': [], Review: [], Done: [] },
  loading: false,

  fetchTasks: async (params) => {
    set({ loading: true });
    try {
      const res = await taskAPI.getAll(params);
      set({ tasks: res.data, kanban: res.kanban, loading: false });
    } catch (_) { set({ loading: false }); }
  },

  createTask: async (data) => {
    const res = await taskAPI.create(data);
    set((s) => {
      const updated = { ...s.kanban };
      updated[res.data.status] = [...(updated[res.data.status] || []), res.data];
      return { tasks: [...s.tasks, res.data], kanban: updated };
    });
    return res.data;
  },

  updateTask: async (id, data) => {
    const res = await taskAPI.update(id, data);
    set((s) => {
      const newKanban = { Todo: [], 'In Progress': [], Review: [], Done: [] };
      const updatedTasks = s.tasks.map((t) => (t._id === id ? res.data : t));
      updatedTasks.forEach((t) => { if (newKanban[t.status]) newKanban[t.status].push(t); });
      return { tasks: updatedTasks, kanban: newKanban };
    });
    return res.data;
  },

  deleteTask: async (id) => {
    await taskAPI.delete(id);
    set((s) => {
      const newKanban = { Todo: [], 'In Progress': [], Review: [], Done: [] };
      const updatedTasks = s.tasks.filter((t) => t._id !== id);
      updatedTasks.forEach((t) => { if (newKanban[t.status]) newKanban[t.status].push(t); });
      return { tasks: updatedTasks, kanban: newKanban };
    });
  },

  moveTask: (taskId, newStatus) => {
    set((s) => {
      const newKanban = { Todo: [], 'In Progress': [], Review: [], Done: [] };
      const updatedTasks = s.tasks.map((t) =>
        t._id === taskId ? { ...t, status: newStatus } : t
      );
      updatedTasks.forEach((t) => { if (newKanban[t.status]) newKanban[t.status].push(t); });
      return { tasks: updatedTasks, kanban: newKanban };
    });
    taskAPI.update(taskId, { status: newStatus }).catch(() => {});
  },
}));

// ─── Invoice Store ────────────────────────────────────────────────────────────
export const useInvoiceStore = create((set) => ({
  invoices: [],
  stats: null,
  loading: false,

  fetchInvoices: async (params) => {
    set({ loading: true });
    try {
      const res = await invoiceAPI.getAll(params);
      set({ invoices: res.data, loading: false });
    } catch (_) { set({ loading: false }); }
  },

  fetchStats: async () => {
    const res = await invoiceAPI.getStats();
    set({ stats: res.data });
  },

  createInvoice: async (data) => {
    const res = await invoiceAPI.create(data);
    set((s) => ({ invoices: [res.data, ...s.invoices] }));
    return res.data;
  },

  updateInvoice: async (id, data) => {
    const res = await invoiceAPI.update(id, data);
    set((s) => ({ invoices: s.invoices.map((i) => (i._id === id ? res.data : i)) }));
    return res.data;
  },

  deleteInvoice: async (id) => {
    await invoiceAPI.delete(id);
    set((s) => ({ invoices: s.invoices.filter((i) => i._id !== id) }));
  },
}));

// ─── Proposal Store ───────────────────────────────────────────────────────────
export const useProposalStore = create((set) => ({
  proposals: [],
  currentProposal: null,
  loading: false,

  fetchProposals: async () => {
    set({ loading: true });
    try {
      const res = await proposalAPI.getAll();
      set({ proposals: res.data, loading: false });
    } catch (_) { set({ loading: false }); }
  },

  fetchProposal: async (id) => {
    try {
      const res = await proposalAPI.getOne(id);
      set({ currentProposal: res.data });
      return res.data;
    } catch (_) {}
  },

  updateProposal: async (id, data) => {
    const res = await proposalAPI.update(id, data);
    set((s) => ({
      proposals: s.proposals.map((p) => (p._id === id ? res.data : p)),
      currentProposal: s.currentProposal?._id === id ? res.data : s.currentProposal,
    }));
    return res.data;
  },

  deleteProposal: async (id) => {
    await proposalAPI.delete(id);
    set((s) => ({ proposals: s.proposals.filter((p) => p._id !== id) }));
  },
}));

// ─── Dashboard Store ──────────────────────────────────────────────────────────
export const useDashboardStore = create((set) => ({
  data: null,
  loading: false,

  fetchDashboard: async () => {
    set({ loading: true });
    try {
      const res = await dashboardAPI.get();
      set({ data: res.data, loading: false });
    } catch (_) { set({ loading: false }); }
  },
}));
