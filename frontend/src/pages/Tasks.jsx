import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Clock, Calendar, Flame, ChevronDown, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTaskStore, useProjectStore } from '../store';
import { Button, Badge, Card, Modal, Input, Select, Textarea, EmptyState, PageLoader } from '../components/ui';
import { format, isPast } from 'date-fns';

const COLUMNS = [
  { id: 'Todo', label: 'Todo', color: 'text-gray-400', dot: 'bg-gray-500' },
  { id: 'In Progress', label: 'In Progress', color: 'text-blue-400', dot: 'bg-blue-500' },
  { id: 'Review', label: 'Review', color: 'text-amber-400', dot: 'bg-amber-500' },
  { id: 'Done', label: 'Done', color: 'text-emerald-400', dot: 'bg-emerald-500' },
];

const PRIORITY_COLORS = {
  Low: 'text-gray-500 bg-gray-500/10',
  Medium: 'text-amber-500 bg-amber-500/10',
  High: 'text-orange-500 bg-orange-500/10',
  Urgent: 'text-red-500 bg-red-500/10',
};

function TaskCard({ task, index, onEdit, onDelete }) {
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'Done';

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-gray-900 border rounded-xl p-3.5 mb-2 cursor-grab active:cursor-grabbing transition-all
            ${snapshot.isDragging ? 'shadow-2xl shadow-brand-500/20 border-brand-500/50 rotate-1' : 'border-gray-800 hover:border-gray-700'}`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-200 leading-snug flex-1">{task.title}</p>
            <button onClick={() => onDelete(task._id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-gray-600 transition-all flex-shrink-0">
              <X className="w-3 h-3" />
            </button>
          </div>

          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
          )}

          {task.project && (
            <div className="text-xs text-brand-400/70 mb-2 truncate">📁 {task.project.name}</div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium}`}>
                {task.priority}
              </span>
              {task.estimatedHours > 0 && (
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{task.estimatedHours}h
                </span>
              )}
            </div>
            {task.deadline && (
              <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-gray-600'}`}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.deadline), 'MMM d')}
              </span>
            )}
          </div>

          {task.isAiGenerated && (
            <div className="mt-2 flex items-center gap-1 text-xs text-purple-400/70">
              <Zap className="w-3 h-3" /> AI generated
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

function AddTaskForm({ defaultStatus = 'Todo', projects = [], onSubmit, loading, onClose }) {
  const [form, setForm] = useState({
    title: '', description: '', status: defaultStatus, priority: 'Medium',
    estimatedHours: '', deadline: '', project: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (!form.title.trim()) return toast.error('Title required');
      onSubmit({ ...form, estimatedHours: Number(form.estimatedHours) || 0 });
    }} className="space-y-4">
      <Input label="Task Title *" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Implement user authentication" autoFocus />
      <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Details about this task..." rows={2} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
          {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </Select>
        <Select label="Priority" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
          {['Low', 'Medium', 'High', 'Urgent'].map((p) => <option key={p}>{p}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Est. Hours" type="number" value={form.estimatedHours} onChange={(e) => set('estimatedHours', e.target.value)} placeholder="4" min="0" />
        <Input label="Deadline" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
      </div>
      {projects.length > 0 && (
        <Select label="Project" value={form.project} onChange={(e) => set('project', e.target.value)}>
          <option value="">No project</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </Select>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={loading} className="flex-1">Add Task</Button>
      </div>
    </form>
  );
}

export default function Tasks() {
  const { kanban, loading, fetchTasks, createTask, deleteTask, moveTask } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const [showModal, setShowModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('Todo');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    moveTask(draggableId, destination.droppableId);
  };

  const handleCreateTask = async (data) => {
    setCreating(true);
    try {
      await createTask(data);
      setShowModal(false);
      toast.success('Task added!');
    } catch (_) {} finally { setCreating(false); }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(id);
    toast.success('Task deleted');
  };

  const openAddTask = (status) => {
    setDefaultStatus(status);
    setShowModal(true);
  };

  if (loading && !Object.values(kanban).some((col) => col.length > 0)) return <PageLoader />;

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Task Board</h1>
          <p className="text-sm text-gray-500 mt-1">
            {Object.values(kanban).reduce((s, col) => s + col.length, 0)} total tasks
          </p>
        </div>
        <Button icon={Plus} onClick={() => openAddTask('Todo')}>Add Task</Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4 flex-1 overflow-hidden">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${col.color}`}>{col.label}</span>
                  <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                    {kanban[col.id]?.length || 0}
                  </span>
                </div>
                <button onClick={() => openAddTask(col.id)} className="p-1 hover:bg-gray-800 rounded-lg transition-colors text-gray-600 hover:text-gray-300">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Droppable */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-brand-500/5' : ''}`}
                    style={{ minHeight: 100 }}
                  >
                    {kanban[col.id]?.length > 0 ? (
                      <div className="group">
                        {kanban[col.id].map((task, index) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            index={index}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                      </div>
                    ) : (
                      !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center h-24 text-gray-700 text-xs text-center">
                          <div className="mb-1">Drop tasks here</div>
                        </div>
                      )
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Task" size="md">
        <AddTaskForm
          defaultStatus={defaultStatus}
          projects={projects}
          onSubmit={handleCreateTask}
          loading={creating}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
