import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderOpen, CheckSquare, FileText,
  Receipt, Sparkles, Zap, MessageSquare, ScanSearch, LogOut, Settings, ChevronRight,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Avatar } from '../ui';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Clients', icon: Users, to: '/clients' },
  { label: 'Projects', icon: FolderOpen, to: '/projects' },
  { label: 'Tasks', icon: CheckSquare, to: '/tasks' },
  { label: 'Invoices', icon: Receipt, to: '/invoices' },
  { label: 'Proposals', icon: FileText, to: '/proposals' },
];

const aiItems = [
  { label: 'Req. Analyzer', icon: ScanSearch, to: '/ai/analyzer' },
  { label: 'Proposal Gen', icon: Sparkles, to: '/ai/proposal' },
  { label: 'Task Breakdown', icon: Zap, to: '/ai/tasks' },
  { label: 'Reply Assistant', icon: MessageSquare, to: '/ai/reply' },
];

const NavItem = ({ item }) => (
  <NavLink
    to={item.to}
    end={item.to === '/'}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
      ${isActive
        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
        : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800'
      }`
    }
  >
    <item.icon className="w-4 h-4 flex-shrink-0" />
    {item.label}
  </NavLink>
);

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-60 min-w-60 h-screen bg-gray-950 border-r border-gray-800/60 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white font-display tracking-tight">FreelanceOS</div>
            <div className="text-xs text-gray-600">Operating System</div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => <NavItem key={item.to} item={item} />)}

        <div className="pt-5 pb-2">
          <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-widest">AI Tools</span>
          </div>
          <div className="space-y-0.5">
            {aiItems.map((item) => <NavItem key={item.to} item={item} />)}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-800/60 space-y-1">
        <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-all">
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-gray-900 border border-gray-800">
          <Avatar name={user?.name || 'U'} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-200 truncate">{user?.name}</div>
            <div className="text-xs text-gray-600 capitalize">{user?.plan} Plan</div>
          </div>
          <ChevronRight className="w-3 h-3 text-gray-600" />
        </div>
      </div>
    </aside>
  );
}
