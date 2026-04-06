import { Loader2, X } from 'lucide-react';

// ─── Button ───────────────────────────────────────────────────────────────────
export const Button = ({
  children, variant = 'primary', size = 'md', loading = false,
  disabled, className = '', icon: Icon, ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500 shadow-lg shadow-brand-500/25',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 focus:ring-gray-600',
    ghost: 'hover:bg-gray-800 text-gray-400 hover:text-gray-100 focus:ring-gray-700',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 focus:ring-red-500',
    success: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 focus:ring-emerald-500',
    outline: 'border border-gray-700 hover:border-brand-500 text-gray-300 hover:text-white focus:ring-brand-500',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1">
    {label && <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</label>}
    <input
      className={`w-full px-3 py-2.5 bg-gray-800 border rounded-lg text-sm text-gray-100 placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors
        ${error ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'} ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ─── Textarea ─────────────────────────────────────────────────────────────────
export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1">
    {label && <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</label>}
    <textarea
      className={`w-full px-3 py-2.5 bg-gray-800 border rounded-lg text-sm text-gray-100 placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none
        ${error ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'} ${className}`}
      rows={4}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className="space-y-1">
    {label && <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</label>}
    <select
      className={`w-full px-3 py-2.5 bg-gray-800 border rounded-lg text-sm text-gray-100
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors
        ${error ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative w-full ${sizes[size]} bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl
          animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeVariants = {
  Lead: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Proposal Sent': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Lost: 'bg-red-500/10 text-red-400 border-red-500/20',
  Planning: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'On Hold': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  Todo: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  Draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  High: 'bg-red-500/10 text-red-400 border-red-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Urgent: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export const Badge = ({ status, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
    ${badgeVariants[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'} ${className}`}>
    {status}
  </span>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', onClick, hover = false }) => (
  <div
    className={`bg-gray-900 border border-gray-800 rounded-2xl
      ${hover ? 'hover:border-gray-700 transition-colors cursor-pointer' : ''}
      ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return <Loader2 className={`animate-spin text-brand-500 ${sizes[size]} ${className}`} />;
};

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-600" />
      </div>
    )}
    <h3 className="text-base font-medium text-gray-300 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
    {action}
  </div>
);

// ─── Stats Card ───────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = 'brand', change, changeLabel }) => {
  const colors = {
    brand: { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  };
  const c = colors[color] || colors.brand;

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
            {Icon && <Icon className={`w-5 h-5 ${c.text}`} />}
          </div>
        </div>
        <div className="text-3xl font-bold text-white font-display mb-1">{value ?? '—'}</div>
        <div className="text-sm text-gray-500">{label}</div>
        {change !== undefined && (
          <div className={`text-xs mt-2 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% {changeLabel || 'vs last month'}
          </div>
        )}
      </div>
    </Card>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const avatarColors = [
  'from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600', 'from-indigo-500 to-blue-600',
];

export const Avatar = ({ name = '', size = 'md', className = '' }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const colorIdx = name.charCodeAt(0) % avatarColors.length;
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-to-br ${avatarColors[colorIdx]}
      flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export const ProgressBar = ({ value = 0, className = '' }) => (
  <div className={`h-1.5 bg-gray-800 rounded-full overflow-hidden ${className}`}>
    <div
      className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
);
