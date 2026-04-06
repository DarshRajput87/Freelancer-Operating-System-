import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Users, FolderOpen, Clock, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { useDashboardStore } from '../store';
import { StatCard, Card, Badge, Avatar, ProgressBar, PageLoader } from '../components/ui';
import { format } from 'date-fns';

const MonthlyChart = ({ data }) => {
  if (!data?.length) return <div className="text-center text-gray-600 py-8 text-sm">No revenue data yet</div>;
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full relative">
            <div
              className="w-full bg-brand-500/20 rounded-t-sm hover:bg-brand-500/40 transition-colors cursor-default"
              style={{ height: `${(d.revenue / max) * 112}px`, minHeight: 4 }}
              title={`$${d.revenue.toLocaleString()}`}
            />
          </div>
          <span className="text-xs text-gray-600">{months[(d._id.month - 1)]}</span>
        </div>
      ))}
    </div>
  );
};

const PipelineBar = ({ pipeline }) => {
  if (!pipeline) return null;
  const stages = ['Lead', 'Contacted', 'Proposal Sent', 'Won', 'Lost'];
  const colors = {
    Lead: 'bg-blue-500', Contacted: 'bg-purple-500',
    'Proposal Sent': 'bg-amber-500', Won: 'bg-emerald-500', Lost: 'bg-red-500',
  };
  const total = Object.values(pipeline).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-3">
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {stages.map((s) => pipeline[s] > 0 && (
          <div key={s} className={`${colors[s]} rounded-full`} style={{ width: `${(pipeline[s] / total) * 100}%` }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {stages.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${colors[s]}`} />
            <span className="text-xs text-gray-500">{s}: <span className="text-gray-300">{pipeline[s] || 0}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { data, loading, fetchDashboard } = useDashboardStore();

  useEffect(() => { fetchDashboard(); }, []);

  if (loading && !data) return <PageLoader />;

  const o = data?.overview || {};

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`$${(o.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="brand" />
        <StatCard label="Pending Revenue" value={`$${(o.pendingRevenue || 0).toLocaleString()}`} icon={Clock} color="amber" />
        <StatCard label="Active Projects" value={o.activeProjects || 0} icon={FolderOpen} color="blue" />
        <StatCard label="Conversion Rate" value={`${o.conversionRate || 0}%`} icon={TrendingUp} color="emerald" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-white">Monthly Revenue</h2>
              <span className="text-xs text-gray-600">Last 12 months</span>
            </div>
            <MonthlyChart data={data?.monthlyRevenue} />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-white">Client Pipeline</h2>
              <Link to="/clients" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <PipelineBar pipeline={data?.clientPipeline} />
            <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Clients</span>
              <span className="text-sm font-semibold text-white">{o.totalClients || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Clients */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Recent Clients</h2>
              <Link to="/clients" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
            </div>
            <div className="space-y-3">
              {data?.recentClients?.length ? data.recentClients.map((c) => (
                <Link key={c._id} to={`/clients/${c._id}`} className="flex items-center gap-3 group">
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-200 truncate group-hover:text-white">{c.name}</div>
                    <div className="text-xs text-gray-600 truncate">{c.company || 'Individual'}</div>
                  </div>
                  <Badge status={c.status} />
                </Link>
              )) : (
                <p className="text-sm text-gray-600 text-center py-4">No clients yet</p>
              )}
            </div>
          </div>
        </Card>

        {/* Recent Projects */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Active Projects</h2>
              <Link to="/projects" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
            </div>
            <div className="space-y-4">
              {data?.recentProjects?.length ? data.recentProjects.map((p) => (
                <Link key={p._id} to={`/projects/${p._id}`} className="block group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium text-gray-200 group-hover:text-white truncate">{p.name}</div>
                    <Badge status={p.status} className="ml-2 flex-shrink-0" />
                  </div>
                  <ProgressBar value={p.progress || 0} />
                  <div className="text-xs text-gray-600 mt-1">{p.progress || 0}% complete</div>
                </Link>
              )) : (
                <p className="text-sm text-gray-600 text-center py-4">No projects yet</p>
              )}
            </div>
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-white">Upcoming Deadlines</h2>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="space-y-3">
              {data?.upcomingDeadlines?.length ? data.upcomingDeadlines.map((t) => (
                <div key={t._id} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-200 truncate">{t.title}</div>
                    <div className="text-xs text-gray-600">{t.project?.name} · {format(new Date(t.deadline), 'MMM d')}</div>
                  </div>
                  <Badge status={t.priority} />
                </div>
              )) : (
                <p className="text-sm text-gray-600 text-center py-4">No upcoming deadlines 🎉</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
