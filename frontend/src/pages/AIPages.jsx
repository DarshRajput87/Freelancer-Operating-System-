// ─── AI Requirement Analyzer ──────────────────────────────────────────────────
import { useState } from 'react';
import { ScanSearch, Sparkles, Copy, CheckCircle, AlertTriangle, Zap, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiAPI } from '../api';
import { Button, Card, Textarea, Select, Input } from '../components/ui';

function ResultSection({ icon: Icon, title, items = [], color = 'brand' }) {
  const colors = {
    brand: 'text-brand-400 bg-brand-500/10', emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10', red: 'text-red-400 bg-red-500/10',
  };
  if (!items?.length) return null;
  return (
    <div>
      <div className={`flex items-center gap-2 text-sm font-semibold mb-3 ${colors[color].split(' ')[0]}`}>
        <Icon className="w-4 h-4" /> {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AIAnalyzer() {
  const [req, setReq] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (!req.trim()) return toast.error('Please enter requirements');
    setLoading(true);
    try {
      const res = await aiAPI.analyze({ rawRequirement: req, projectType: type });
      setResult(res.data);
      toast.success('Analysis complete!');
    } catch (_) {} finally { setLoading(false); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <ScanSearch className="w-4 h-4 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Requirement Analyzer</h1>
          <span className="px-2 py-0.5 bg-brand-500/10 text-brand-400 text-xs font-semibold rounded-full border border-brand-500/20">AI</span>
        </div>
        <p className="text-gray-500 text-sm">Paste raw client requirements and get a structured technical breakdown.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <Textarea label="Raw Client Requirements" value={req} onChange={(e) => setReq(e.target.value)}
            placeholder="I need a website where users can register, browse products, add items to cart, checkout with Stripe, and admins can manage inventory and view analytics..."
            rows={10} />
          <Select label="Project Type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">General Software</option>
            {['Web Application', 'Mobile App', 'E-commerce', 'SaaS Platform', 'API / Backend', 'Desktop App'].map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Button onClick={analyze} loading={loading} icon={ScanSearch} className="w-full">Analyze Requirements</Button>
        </div>

        {/* Result */}
        <Card>
          {result ? (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Analysis Result</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    result.complexity === 'High' || result.complexity === 'Very High' ? 'bg-red-500/10 text-red-400' :
                    result.complexity === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>{result.complexity} Complexity</span>
                  {result.estimatedHours && <span className="text-xs text-gray-500">~{result.estimatedHours}h</span>}
                </div>
              </div>
              {result.summary && <p className="text-sm text-gray-400 bg-gray-800/50 rounded-xl p-3">{result.summary}</p>}
              <ResultSection icon={CheckCircle} title="Features" items={result.features} color="emerald" />
              <ResultSection icon={AlertTriangle} title="Missing Requirements" items={result.missing} color="amber" />
              <ResultSection icon={Sparkles} title="Risks" items={result.risks} color="red" />
              <ResultSection icon={Layers} title="Suggested Modules" items={result.modules} color="brand" />
              {result.recommendedStack?.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-2">Recommended Stack</div>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedStack.map((s) => (
                      <span key={s} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <Button variant="secondary" size="sm" icon={Copy}
                onClick={() => { navigator.clipboard.writeText(JSON.stringify(result, null, 2)); toast.success('Copied!'); }}>
                Copy JSON
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center p-6">
              <ScanSearch className="w-12 h-12 text-gray-700 mb-3" />
              <p className="text-gray-500 text-sm">Enter requirements and click Analyze</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── AI Freelance Proposal Writer ─────────────────────────────────────────────
export function AIProposal() {
  const [form, setForm] = useState({
    jobDescription: '',
    clientName: '',
    skills: '',
    experience: '',
    portfolio: '',
    tone: 'professional',
    customInstructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState('');
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.jobDescription.trim()) return toast.error('Paste the job description first');
    setLoading(true);
    setProposal('');
    try {
      const res = await aiAPI.freelanceProposal(form);
      const text = res.data.proposal;
      setProposal(text);
      setWordCount(text.trim().split(/\s+/).length);
      toast.success('Proposal ready — copy & send!');
    } catch (_) {
      toast.error('Failed to generate. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyProposal = () => {
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const TONES = [
    { value: 'professional', label: '💼 Professional', desc: 'Formal, business-ready' },
    { value: 'friendly', label: '😊 Friendly', desc: 'Warm and approachable' },
    { value: 'confident', label: '🔥 Confident', desc: 'Bold and direct' },
    { value: 'concise', label: '⚡ Concise', desc: 'Short and punchy' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white font-display">Proposal Writer</h1>
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 text-xs font-semibold rounded-full border border-purple-500/20">AI</span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">Generate winning Upwork & Fiverr proposals that land clients.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* ── Left: Input Form ── */}
        <div className="col-span-2 space-y-4">
          {/* Job Description - Primary Input */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
              Job Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.jobDescription}
              onChange={(e) => set('jobDescription', e.target.value)}
              placeholder="Paste the full job posting from Upwork, Fiverr, or wherever…"
              rows={6}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Client Name */}
          <Input label="Client Name (optional)" value={form.clientName} onChange={(e) => set('clientName', e.target.value)} placeholder="e.g. Sarah, John, or leave blank" />

          {/* Skills */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">Your Skills</label>
            <textarea
              value={form.skills}
              onChange={(e) => set('skills', e.target.value)}
              placeholder="React, Node.js, MongoDB, AWS, REST APIs, Figma to Code…"
              rows={2}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Experience */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">Your Experience</label>
            <textarea
              value={form.experience}
              onChange={(e) => set('experience', e.target.value)}
              placeholder="5+ years building SaaS apps. Built 20+ full-stack projects. Worked with YC startups…"
              rows={2}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Portfolio */}
          <Input label="Portfolio / Proof Links" value={form.portfolio} onChange={(e) => set('portfolio', e.target.value)} placeholder="https://myportfolio.com, https://github.com/me" />

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button key={t.value} type="button" onClick={() => set('tone', t.value)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    form.tone === t.value
                      ? 'border-purple-500 bg-purple-500/10 shadow-sm shadow-purple-500/10'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}>
                  <div className={`text-sm font-medium ${form.tone === t.value ? 'text-purple-400' : 'text-gray-300'}`}>{t.label}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">Custom Instructions (optional)</label>
            <textarea
              value={form.customInstructions}
              onChange={(e) => set('customInstructions', e.target.value)}
              placeholder="Mention my 100% job success rate, emphasize fast delivery, don't mention pricing…"
              rows={2}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Generate Button */}
          <Button onClick={generate} loading={loading} icon={Sparkles}
            className="w-full !bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-500 hover:!to-pink-500 !shadow-lg !shadow-purple-500/25 !border-0">
            {loading ? 'Crafting your proposal…' : 'Generate Winning Proposal'}
          </Button>
        </div>

        {/* ── Right: Output ── */}
        <div className="col-span-3">
          {proposal ? (
            <div className="space-y-3 animate-in fade-in">
              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-white">Your Proposal</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    wordCount >= 150 && wordCount <= 250
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : wordCount < 150
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>{wordCount} words</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={copied ? CheckCircle : Copy} onClick={copyProposal}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button variant="ghost" size="sm" icon={Sparkles} onClick={generate} loading={loading}>
                    Regenerate
                  </Button>
                </div>
              </div>

              {/* Proposal Card */}
              <Card>
                <div className="p-6">
                  <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {proposal}
                  </div>
                </div>
              </Card>

              {/* Tips */}
              <div className="p-3 bg-purple-500/5 border border-purple-500/15 rounded-xl flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-purple-300/80">
                  <strong>Tip:</strong> Review & personalize before sending. Add a specific detail about the client's project to stand out even more.
                </p>
              </div>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[500px]">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-500/50" />
                </div>
                <h3 className="text-base font-medium text-gray-400 mb-1">Ready to write a killer proposal</h3>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">Paste the job description, fill in your details, and let AI craft a proposal that gets replies.</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500/50" /> 150–250 words</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500/50" /> Human-written feel</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500/50" /> Conversion-focused</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AI Task Breakdown ─────────────────────────────────────────────────────────
export function AITaskBreakdown() {
  const [form, setForm] = useState({ projectName: '', requirements: '', techStack: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.requirements.trim()) return toast.error('Please enter project requirements');
    setLoading(true);
    try {
      const structured = { features: [form.requirements], modules: [], risks: [], missing: [] };
      const techStack = form.techStack.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await aiAPI.tasks({ structuredRequirement: structured, techStack, projectName: form.projectName, autoSave: false });
      setResult(res.data);
      toast.success(`${res.data.tasks?.length} tasks generated!`);
    } catch (_) {} finally { setLoading(false); }
  };

  const saveToBoard = async () => {
    if (!result?.tasks?.length) return;
    setSaving(true);
    try {
      const structured = { features: [form.requirements], modules: [], risks: [], missing: [] };
      const techStack = form.techStack.split(',').map((t) => t.trim()).filter(Boolean);
      await aiAPI.tasks({ structuredRequirement: structured, techStack, projectName: form.projectName, autoSave: true });
      toast.success(`${result.tasks.length} tasks saved to board!`);
    } catch (_) {} finally { setSaving(false); }
  };

  const PRIORITY_COLORS = { Low: 'text-gray-400 bg-gray-500/10', Medium: 'text-amber-400 bg-amber-500/10', High: 'text-orange-400 bg-orange-500/10', Urgent: 'text-red-400 bg-red-500/10' };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Task Breakdown</h1>
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">AI</span>
        </div>
        <p className="text-gray-500 text-sm">Automatically break down projects into actionable development tasks.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input label="Project Name" value={form.projectName} onChange={(e) => set('projectName', e.target.value)} placeholder="E-commerce Platform" />
          <Input label="Tech Stack" value={form.techStack} onChange={(e) => set('techStack', e.target.value)} placeholder="React, Node.js, PostgreSQL, Redis" />
          <Textarea label="Project Requirements *" value={form.requirements} onChange={(e) => set('requirements', e.target.value)}
            placeholder="Describe the full project scope: features needed, integrations, user roles, technical constraints..." rows={9} />
          <Button onClick={generate} loading={loading} icon={Zap} className="w-full">Generate Tasks</Button>
        </div>

        <div>
          {result ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-semibold text-white">{result.tasks?.length} Tasks Generated</span>
                  {result.totalEstimatedHours && (
                    <span className="ml-2 text-xs text-gray-500">~{result.totalEstimatedHours}h total</span>
                  )}
                </div>
                <Button variant="success" size="sm" onClick={saveToBoard} loading={saving} icon={CheckCircle}>
                  Save to Board
                </Button>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {result.tasks?.map((task, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-200">{task.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{task.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>⏱ {task.estimatedHours}h</span>
                      {task.phase && <span className="px-2 py-0.5 bg-gray-800 rounded text-gray-400">{task.phase}</span>}
                    </div>
                  </Card>
                ))}
              </div>
              {result.notes && (
                <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-400">{result.notes}</div>
              )}
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <Zap className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Tasks will appear here</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AI Reply Assistant ────────────────────────────────────────────────────────
import { MessageSquare } from 'lucide-react';

export function AIReplyAssistant() {
  const [form, setForm] = useState({ clientMessage: '', context: '', tone: 'professional', clientName: '' });
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [copied, setCopied] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.clientMessage.trim()) return toast.error('Please enter client message');
    setLoading(true);
    try {
      const res = await aiAPI.reply(form);
      setReply(res.data.reply);
      toast.success('Reply generated!');
    } catch (_) {} finally { setLoading(false); }
  };

  const copyReply = () => {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const TONES = [
    { value: 'professional', label: 'Professional', desc: 'Formal and business-appropriate' },
    { value: 'friendly', label: 'Friendly', desc: 'Warm and personable' },
    { value: 'assertive', label: 'Assertive', desc: 'Direct and confident' },
    { value: 'concise', label: 'Concise', desc: 'Brief and to the point' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Reply Assistant</h1>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">AI</span>
        </div>
        <p className="text-gray-500 text-sm">Generate professional, ready-to-send replies to client messages.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input label="Client Name" value={form.clientName} onChange={(e) => set('clientName', e.target.value)} placeholder="John Smith" />
          <Textarea label="Client Message *" value={form.clientMessage} onChange={(e) => set('clientMessage', e.target.value)}
            placeholder="Paste the client's message here..." rows={6} />
          <Textarea label="Project Context (optional)" value={form.context} onChange={(e) => set('context', e.target.value)}
            placeholder="Current project status, any issues, milestones completed..." rows={3} />

          {/* Tone selector */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Reply Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button key={t.value} type="button" onClick={() => set('tone', t.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.tone === t.value ? 'border-brand-500 bg-brand-500/10' : 'border-gray-800 hover:border-gray-700'
                  }`}>
                  <div className={`text-sm font-medium ${form.tone === t.value ? 'text-brand-400' : 'text-gray-300'}`}>{t.label}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={generate} loading={loading} icon={MessageSquare} className="w-full">Generate Reply</Button>
        </div>

        <div>
          {reply ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Generated Reply</h3>
                <Button variant="secondary" size="sm" icon={copied ? CheckCircle : Copy} onClick={copyReply}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Card>
                <div className="p-5">
                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{reply}</div>
                </div>
              </Card>
              <p className="text-xs text-gray-600">You can edit this reply before sending. Click Copy to use it.</p>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Your reply will appear here</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
