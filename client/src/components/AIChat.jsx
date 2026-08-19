import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useProject } from '../context/ProjectContext';
import {
  Sparkles,
  Send,
  HelpCircle,
  Bug,
  Zap,
  CheckSquare,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ArrowDownToLine,
  CheckCircle2,
} from 'lucide-react';

export default function AIChat({ activeTargetFile }) {
  const { activeFile, fileContents, executionResult, updateFileContent } = useProject();
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        '👋 Welcome to **DevSync AI**! I am your real-time pair programming assistant. Ask me anything, or use the quick actions below to inspect, debug, optimize, or test your code.',
      timestamp: new Date(),
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [appliedId, setAppliedId] = useState(null);

  const messagesEndRef = useRef(null);

  const currentFile = activeTargetFile || activeFile;
  const currentCode = currentFile ? fileContents[currentFile._id] || currentFile.content || '' : '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customPrompt = null, action = 'chat') => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      action,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setPrompt('');
    setLoading(true);

    try {
      const response = await api.queryAI({
        prompt: textToSend.trim(),
        action,
        context: {
          fileName: currentFile?.name || 'workspace_file',
          language: currentFile?.language || 'javascript',
          code: currentCode,
          terminalOutput: executionResult?.stderr || executionResult?.stdout || '',
        },
      });

      if (response.success && response.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: response.reply,
            engine: response.engine,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: '⚠️ Failed to generate AI response. Please try again.',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract first code block and apply to active file
  const handleApplyToEditor = (content, msgId) => {
    if (!currentFile) {
      alert('Please open a file in the editor first.');
      return;
    }

    const codeMatch = content.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
    if (codeMatch && codeMatch[1]) {
      const extractedCode = codeMatch[1].trim();
      updateFileContent(currentFile._id, extractedCode);
      setAppliedId(msgId);
      setTimeout(() => setAppliedId(null), 2500);
    } else {
      alert('No code block detected in this response to apply.');
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-850 border-l border-dark-700 select-none">
      {/* Header */}
      <div className="p-3 border-b border-dark-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-dark-100">DevSync AI Pair Programmer</h3>
            <p className="text-[10px] text-dark-400">
              {currentFile ? `Active File: ${currentFile.name}` : 'Context-aware assistant'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="p-2 border-b border-dark-700/60 bg-dark-800/50 flex flex-wrap gap-1.5">
        <button
          onClick={() => handleSend('Explain this code and its architecture in detail.', 'explain')}
          className="flex items-center space-x-1 text-[11px] px-2 py-1 rounded bg-dark-750 hover:bg-dark-700 text-dark-200 hover:text-brand-400 border border-dark-600/60 transition-colors"
        >
          <HelpCircle className="w-3 h-3 text-brand-400" />
          <span>Explain</span>
        </button>

        <button
          onClick={() => handleSend('Debug any syntax, logical, or runtime errors in this code.', 'debug')}
          className="flex items-center space-x-1 text-[11px] px-2 py-1 rounded bg-dark-750 hover:bg-dark-700 text-dark-200 hover:text-rose-400 border border-dark-600/60 transition-colors"
        >
          <Bug className="w-3 h-3 text-rose-400" />
          <span>Debug</span>
        </button>

        <button
          onClick={() => handleSend('Optimize this code for speed, memory, and readability.', 'optimize')}
          className="flex items-center space-x-1 text-[11px] px-2 py-1 rounded bg-dark-750 hover:bg-dark-700 text-dark-200 hover:text-amber-400 border border-dark-600/60 transition-colors"
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Optimize</span>
        </button>

        <button
          onClick={() => handleSend('Generate comprehensive automated unit test cases.', 'tests')}
          className="flex items-center space-x-1 text-[11px] px-2 py-1 rounded bg-dark-750 hover:bg-dark-700 text-dark-200 hover:text-emerald-400 border border-dark-600/60 transition-colors"
        >
          <CheckSquare className="w-3 h-3 text-emerald-400" />
          <span>Tests</span>
        </button>

        <button
          onClick={() => handleSend('Generate clean docstrings and documentation comments.', 'docs')}
          className="flex items-center space-x-1 text-[11px] px-2 py-1 rounded bg-dark-750 hover:bg-dark-700 text-dark-200 hover:text-purple-400 border border-dark-600/60 transition-colors"
        >
          <FileText className="w-3 h-3 text-purple-400" />
          <span>Docs</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 select-text">
        {messages.map((m) => {
          const isAI = m.role === 'assistant';
          const hasCodeBlock = isAI && m.content.includes('```');

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[95%] rounded-xl p-3 text-xs leading-relaxed ${
                  isAI
                    ? 'bg-dark-800 text-dark-100 border border-dark-700/80 shadow-sm'
                    : 'bg-brand-600 text-white shadow-md shadow-brand-500/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 opacity-80 text-[10px]">
                  <span className="font-bold flex items-center space-x-1">
                    <span>{isAI ? 'DevSync AI' : 'You'}</span>
                    {m.engine && (
                      <span className="px-1.5 py-0.2 rounded bg-dark-700 text-dark-400 text-[9px]">
                        {m.engine}
                      </span>
                    )}
                  </span>

                  {isAI && (
                    <div className="flex items-center space-x-1.5">
                      {hasCodeBlock && currentFile && (
                        <button
                          onClick={() => handleApplyToEditor(m.content, m.id)}
                          className="px-2 py-0.5 rounded bg-dark-700 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 text-[10px] font-semibold border border-dark-600 flex items-center space-x-1 transition-colors"
                          title="Apply suggested code to active editor file"
                        >
                          {appliedId === m.id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Applied!</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownToLine className="w-3 h-3" />
                              <span>Apply to Editor</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => copyToClipboard(m.content, m.id)}
                        className="p-1 rounded hover:bg-dark-700 text-dark-400 hover:text-white"
                        title="Copy response"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap font-sans text-dark-200">
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-brand-400 bg-dark-800 p-3 rounded-xl border border-dark-700 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Analyzing code structure and generating solution...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2 border-t border-dark-700 bg-dark-850 flex items-center space-x-2"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask DevSync AI to write, fix, or optimize code..."
          className="flex-1 bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || loading}
          className="p-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
