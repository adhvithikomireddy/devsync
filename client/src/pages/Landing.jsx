import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  Users,
  GitBranch,
  Video,
  Sparkles,
  Terminal,
  Shield,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Zap,
  Layers,
  Globe,
  Radio,
  Play,
  Share2,
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950 text-dark-200 flex flex-col relative overflow-hidden select-none">
      {/* Background Ambient Glows & Grid */}
      <div className="ambient-glow bg-brand-600/20 top-[-10%] left-[20%]" />
      <div className="ambient-glow bg-accent-purple/15 top-[30%] right-[-10%]" />
      <div className="ambient-glow bg-accent-cyan/15 bottom-[-10%] left-[10%]" />
      <div className="absolute inset-0 bg-subtle-grid opacity-60 pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-20 border-b border-white/[0.06] bg-dark-950/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/25 border border-white/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight flex items-center space-x-1.5">
                <span>DevSync</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  v1.0
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary flex items-center space-x-2">
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-dark-300 hover:text-white transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary flex items-center space-x-1.5"
                >
                  <span>Start Coding Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-dark-850 border border-white/[0.08] shadow-glass-sm animate-float-slow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-dark-300">
              Real-time synchronization engine with Monaco & WebRTC
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
              Build Together. <br />
              <span className="text-gradient-brand">Code Together.</span> Ship Together.
            </h1>
            <p className="text-base sm:text-lg text-dark-400 max-w-2xl mx-auto font-normal leading-relaxed">
              The collaborative engineering workspace designed for modern software teams.
              Real-time multi-cursor editing, isolated cloud execution, line diff attribution, and context-aware AI.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to={isAuthenticated ? '/dashboard' : '/signup'}
              className="btn-primary px-7 py-3 text-sm flex items-center space-x-2 w-full sm:w-auto shadow-glow-brand"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="btn-secondary px-6 py-3 text-sm w-full sm:w-auto"
            >
              View Interactive Demo
            </Link>
          </div>

          {/* Live Interactive IDE Preview Mockup */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-white/[0.1] bg-dark-900/90 shadow-glass-lg overflow-hidden text-left backdrop-blur-2xl">
              {/* Window Title Bar */}
              <div className="h-10 bg-dark-850 px-4 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-dark-400 pl-2">
                    devsync-workspace • auth.js
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>3 Peers Live</span>
                  </div>
                </div>
              </div>

              {/* IDE Body */}
              <div className="grid grid-cols-12 h-80 font-mono text-xs">
                {/* File Tree Mock */}
                <div className="col-span-3 bg-dark-900 border-r border-white/[0.06] p-3 space-y-1.5 text-dark-400 hidden sm:block">
                  <div className="text-[10px] font-bold text-dark-500 uppercase tracking-wider mb-2">
                    Explorer
                  </div>
                  <div className="flex items-center space-x-1.5 text-white bg-dark-800 px-2 py-1 rounded">
                    <span className="text-brand-400">JS</span>
                    <span>auth.js</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2 py-1 text-dark-400">
                    <span className="text-accent-cyan">HTML</span>
                    <span>index.html</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2 py-1 text-dark-400">
                    <span className="text-purple-400">CSS</span>
                    <span>style.css</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2 py-1 text-dark-400">
                    <span className="text-emerald-400">PY</span>
                    <span>service.py</span>
                  </div>
                </div>

                {/* Monaco Editor Code Mock with Multi-Cursors */}
                <div className="col-span-12 sm:col-span-9 bg-dark-950 p-4 space-y-1 text-dark-300 relative overflow-hidden select-text">
                  <div className="flex">
                    <span className="w-8 text-dark-600 shrink-0">1</span>
                    <span><span className="text-purple-400">const</span> jwt = <span className="text-amber-300">require</span>(<span className="text-emerald-300">'jsonwebtoken'</span>);</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 text-dark-600 shrink-0">2</span>
                    <span><span className="text-purple-400">const</span> bcrypt = <span className="text-amber-300">require</span>(<span className="text-emerald-300">'bcryptjs'</span>);</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 text-dark-600 shrink-0">3</span>
                    <span></span>
                  </div>
                  <div className="flex relative">
                    <span className="w-8 text-dark-600 shrink-0">4</span>
                    <span><span className="text-blue-400">async function</span> <span className="text-amber-300">authenticate</span>(email, password) &#123;</span>
                  </div>
                  <div className="flex relative items-center">
                    <span className="w-8 text-dark-600 shrink-0">5</span>
                    <span className="pl-4"><span className="text-purple-400">const</span> user = <span className="text-purple-400">await</span> User.<span className="text-blue-400">findByEmail</span>(email);</span>
                    {/* Remote Cursor 1 */}
                    <div className="inline-flex items-center ml-1">
                      <span className="w-0.5 h-4 bg-brand-500 animate-pulse" />
                      <span className="px-1.5 py-0.5 bg-brand-600 text-[9px] font-sans font-bold text-white rounded shadow-md -translate-y-4">
                        Adhvithi
                      </span>
                    </div>
                  </div>
                  <div className="flex relative items-center">
                    <span className="w-8 text-dark-600 shrink-0">6</span>
                    <span className="pl-4"><span className="text-purple-400">return</span> jwt.<span className="text-blue-400">sign</span>(&#123; id: user.id &#125;, process.env.JWT_SECRET);</span>
                    {/* Remote Cursor 2 */}
                    <div className="inline-flex items-center ml-1">
                      <span className="w-0.5 h-4 bg-emerald-500 animate-pulse" />
                      <span className="px-1.5 py-0.5 bg-emerald-600 text-[9px] font-sans font-bold text-white rounded shadow-md -translate-y-4">
                        Rahul
                      </span>
                    </div>
                  </div>
                  <div className="flex">
                    <span className="w-8 text-dark-600 shrink-0">7</span>
                    <span>&#125;</span>
                  </div>

                  {/* Terminal Drawer Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-28 bg-dark-900 border-t border-white/[0.08] p-3 text-[11px] space-y-1">
                    <div className="text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sandbox execution finished with exit code 0 (0.142s)</span>
                    </div>
                    <div className="text-dark-400">
                      &gt; Output: &#123; authenticated: true, token: "eyJhbGciOiJIUzI1Ni..." &#125;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Feature Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything Your Engineering Team Needs
            </h2>
            <p className="text-xs sm:text-sm text-dark-400">
              Built for speed, clarity, and collaboration across the entire software development lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">Sub-Millisecond Code Sync</h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Real-time multi-cursor typing powered by Monaco and Socket.IO. See who is typing, selecting, and editing in real time.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">Multi-Language Sandbox</h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Run JavaScript, Python, C, C++, and Java in isolated cloud environments with real-time stdout and exit code capturing.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">Context-Aware AI Assistant</h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Deep AST inspection to explain architecture, debug runtime crashes, optimize algorithms, and generate automated tests.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald flex items-center justify-center">
                <GitBranch className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">Line Attribution & Diffs</h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Always know who changed what, when, and where. Visual side-by-side and inline diff inspector with line-level author tags.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">Mesh WebRTC Video & Calls</h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Jump into crystal-clear voice, video conferences, and screen shares without leaving your IDE workspace.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent-amber/10 border border-accent-amber/20 text-accent-amber flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">Granular Role-Based Access</h3>
                <p className="text-xs text-dark-400 leading-relaxed">
                  Strict permission controls with Owner, Admin, Editor, and Viewer roles enforced across REST, files, and WebSockets.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-dark-950 py-8 px-6 text-center text-xs text-dark-500 relative z-10">
        <p>© 2026 DevSync Collaborative Engineering Workspace • Build Together. Code Together. Ship Together.</p>
      </footer>
    </div>
  );
}
