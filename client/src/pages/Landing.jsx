import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  Users,
  Video,
  Sparkles,
  Play,
  GitCommit,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Zap,
  Radio,
  FileCode,
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-dark-900 text-dark-100 flex flex-col selection:bg-brand-600 selection:text-white">
      {/* Navbar */}
      <nav className="h-16 border-b border-dark-700/80 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-dark-100 to-dark-300 bg-clip-text text-transparent">
            DevSync
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-xs font-medium text-dark-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#editor" className="hover:text-white transition-colors">Workspace</a>
        </div>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-medium text-dark-200 hover:text-white hover:bg-dark-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 lg:px-12 max-w-6xl mx-auto text-center space-y-8 relative">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold animate-pulse-subtle">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Next-Generation Real-Time Collaborative Workspace</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Build Together. <br className="hidden sm:inline" />
          Code Together. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-accent-emerald bg-clip-text text-transparent">
            Ship Together.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-dark-300 max-w-2xl mx-auto leading-relaxed">
          A unified engineering workspace where developers write, run, understand, and improve code together in real time — with live Monaco sync, WebRTC video, change attribution, and AI pair programming.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white text-sm font-bold shadow-xl shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <span>Start Building with DevSync</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-dark-800 hover:bg-dark-750 border border-dark-700 text-dark-200 hover:text-white text-sm font-semibold transition-colors"
          >
            Explore Features
          </a>
        </div>

        {/* Live Interactive Workspace Preview Mockup */}
        <div id="editor" className="pt-10">
          <div className="rounded-2xl border border-dark-700/80 bg-dark-850 shadow-2xl overflow-hidden text-left relative glow-active">
            {/* Window bar */}
            <div className="h-10 bg-dark-800 px-4 flex items-center justify-between border-b border-dark-700">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs text-dark-400 font-mono ml-2">devsync-workspace — auth.js</span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Radio className="w-3 h-3" />
                  <span>3 Peers Live</span>
                </span>
                <span className="text-dark-400 font-mono">Node.js Sandbox</span>
              </div>
            </div>

            {/* Mock Editor Body */}
            <div className="grid grid-cols-12 h-80 font-mono text-xs">
              {/* Explorer mockup */}
              <div className="col-span-3 bg-dark-850 p-3 border-r border-dark-700 space-y-2 hidden md:block">
                <p className="text-[11px] font-bold text-dark-400 uppercase">Explorer</p>
                <div className="space-y-1 text-dark-300">
                  <div className="flex items-center space-x-1.5 text-brand-400 font-semibold">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>auth.js</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-dark-400 pl-2">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Dashboard.jsx</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-dark-400 pl-2">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>User.js</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-dark-400 pl-2">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>README.md</span>
                  </div>
                </div>
              </div>

              {/* Code content mockup with live cursors */}
              <div className="col-span-12 md:col-span-9 bg-dark-900 p-4 relative space-y-1 text-dark-200 overflow-hidden select-none">
                <div className="text-dark-500">// Real-time synchronized session</div>
                <div><span className="text-rose-400 font-bold">export async function</span> <span className="text-purple-400">verifySessionToken</span>(token) &#123;</div>
                <div className="pl-4"><span className="text-rose-400">if</span> (!token) <span className="text-rose-400">throw new</span> <span className="text-amber-400">Error</span>(<span className="text-cyan-300">"Missing token"</span>);</div>
                <div className="pl-4 relative">
                  <span className="text-rose-400 font-bold">const</span> decoded = <span className="text-rose-400 font-bold">await</span> jwt.<span className="text-purple-400">verify</span>(token, process.env.JWT_SECRET);
                  
                  {/* Remote Cursor 1: Rahul */}
                  <span className="absolute -top-4 left-36 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                    Rahul
                  </span>
                  <span className="inline-block w-0.5 h-4 bg-emerald-500 align-middle animate-pulse ml-0.5" />
                </div>
                <div className="pl-4"><span className="text-rose-400 font-bold">return</span> &#123; valid: <span className="text-emerald-400">true</span>, userId: decoded.id &#125;;</div>
                <div>&#125;</div>

                {/* Floating Video Call Pill Mockup */}
                <div className="absolute bottom-4 right-4 bg-dark-850/90 backdrop-blur border border-dark-700 p-2.5 rounded-2xl shadow-xl flex items-center space-x-3">
                  <div className="flex items-center -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-[10px] border-2 border-dark-850">
                      R
                    </div>
                    <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-[10px] border-2 border-dark-850">
                      A
                    </div>
                  </div>
                  <div className="text-[11px] font-sans">
                    <p className="font-semibold text-white">Live Voice & Video</p>
                    <p className="text-dark-400 text-[10px]">Discussing auth logic</p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything Your Engineering Team Needs
          </h2>
          <p className="text-dark-300 text-sm max-w-xl mx-auto">
            From the first line of code to the final deployment — collaborate without boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Code2 className="w-5 h-5 text-brand-400" />}
            title="Real-Time Code Sync"
            description="CRDT-powered collaborative editing. See teammates type with sub-millisecond latency, remote colored cursors, and active selections."
          />
          <FeatureCard
            icon={<Video className="w-5 h-5 text-rose-400" />}
            title="Crystal-Clear Video & Screen Share"
            description="Integrated WebRTC voice, video, and screen sharing. Start calls directly from inside your project without third-party meeting apps."
          />
          <FeatureCard
            icon={<Sparkles className="w-5 h-5 text-purple-400" />}
            title="Context-Aware AI Assistant"
            description="Instant explanation, debugging, optimization, test generation, and pair programming powered by Gemini and contextual analysis."
          />
          <FeatureCard
            icon={<Play className="w-5 h-5 text-emerald-400" />}
            title="Isolated Code Execution"
            description="Run JavaScript, Python, C, C++, and Java in resource-isolated cloud sandboxes with live stdout, stderr, and execution metrics."
          />
          <FeatureCard
            icon={<GitCommit className="w-5 h-5 text-amber-400" />}
            title="Who Edited What? (Attribution)"
            description="Every change session tracks author attribution, line ranges modified, and instant side-by-side visual diffs."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-5 h-5 text-cyan-400" />}
            title="Role-Based Team Access"
            description="Owner, Admin, Editor, and Viewer roles enforced strictly at the database, REST API, and WebSocket signaling layers."
          />
        </div>
      </section>

      {/* How It Works Flow */}
      <section id="how-it-works" className="py-16 bg-dark-850/50 border-y border-dark-700/60 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How DevSync Works</h2>
            <p className="text-xs text-dark-400">Simple, seamless, and lightning fast.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StepCard number="01" title="Create Workspace" desc="Pick your template: JS, React, Python, Java, C/C++." />
            <StepCard number="02" title="Invite Teammates" desc="Add collaborators with granular role permissions." />
            <StepCard number="03" title="Code & Call Live" desc="Edit concurrently, share screens, and debug errors." />
            <StepCard number="04" title="Run & Ship" desc="Execute safely in sandbox and track change attribution." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 lg:px-12 border-t border-dark-700/80 bg-dark-900 text-xs text-dark-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-dark-100">DevSync</span>
            <span>— Build Together. Code Together. Ship Together.</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#features" className="hover:text-dark-200">Features</a>
            <a href="#how-it-works" className="hover:text-dark-200">Workflow</a>
            <Link to="/login" className="hover:text-dark-200">Login</Link>
            <Link to="/signup" className="hover:text-dark-200">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-6 rounded-2xl bg-dark-850 border border-dark-700/80 hover:border-brand-500/40 transition-all space-y-3 group hover:shadow-xl hover:shadow-brand-500/5">
      <div className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <h3 className="text-base font-bold text-dark-100 group-hover:text-brand-400 transition-colors">
        {title}
      </h3>
      <p className="text-xs text-dark-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div className="p-5 rounded-2xl bg-dark-800/80 border border-dark-700/60 space-y-2">
      <span className="text-xl font-extrabold text-brand-500 font-mono">{number}</span>
      <h4 className="text-sm font-bold text-dark-100">{title}</h4>
      <p className="text-xs text-dark-400">{desc}</p>
    </div>
  );
}
