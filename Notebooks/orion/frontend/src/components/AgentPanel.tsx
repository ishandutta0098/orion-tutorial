import { useState } from 'react';
import {
  Play, Loader2, CheckCircle2, XCircle, Clock, AlertCircle,
} from 'lucide-react';
import useStore from '../store/useStore';
import { runAgent } from '../api/client';

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  idle: { color: 'text-orion-text-muted', icon: <Clock size={14} />, label: 'Idle' },
  planning: { color: 'text-orion-accent-amber', icon: <Loader2 size={14} className="animate-spin" />, label: 'Planning...' },
  coding: { color: 'text-orion-accent-blue', icon: <Loader2 size={14} className="animate-spin" />, label: 'Coding...' },
  reviewing: { color: 'text-purple-400', icon: <Loader2 size={14} className="animate-spin" />, label: 'Reviewing...' },
  waiting_approval: { color: 'text-orion-accent-amber', icon: <AlertCircle size={14} className="animate-pulse" />, label: 'Waiting for Approval' },
  applying: { color: 'text-orion-accent-teal', icon: <Loader2 size={14} className="animate-spin" />, label: 'Applying Changes...' },
  testing: { color: 'text-orion-accent-blue', icon: <Loader2 size={14} className="animate-spin" />, label: 'Testing...' },
  done: { color: 'text-green-400', icon: <CheckCircle2 size={14} />, label: 'Done' },
  error: { color: 'text-orion-accent-red', icon: <XCircle size={14} />, label: 'Error' },
};

const taskStatusIcon: Record<string, React.ReactNode> = {
  pending: <span className="w-3 h-3 rounded-full border border-orion-text-muted inline-block" />,
  in_progress: <Loader2 size={12} className="text-orion-accent-blue animate-spin" />,
  done: <CheckCircle2 size={12} className="text-green-400" />,
  error: <XCircle size={12} className="text-orion-accent-red" />,
};

export default function AgentPanel() {
  const {
    apiKey, selectedModel, rules,
    agentStatus, setAgentStatus, agentPlan, setAgentPlan,
    agentTasks, setAgentTasks, setPendingReview,
    setThreadId,
  } = useStore();

  const [featureRequest, setFeatureRequest] = useState('');
  const isRunning = !['idle', 'done', 'error'].includes(agentStatus);

  const handleRun = () => {
    if (!featureRequest.trim() || !apiKey) return;

    const newThreadId = `thread_${Date.now()}`;
    setThreadId(newThreadId);
    setAgentStatus('planning');
    setAgentPlan(null);
    setAgentTasks([]);

    runAgent(featureRequest, selectedModel, newThreadId, rules, (event: Record<string, any>) => {
      switch (event.type) {
        case 'status':
          setAgentStatus(event.status);
          break;
        case 'plan':
          setAgentPlan(event.plan);
          if (event.tasks) {
            setAgentTasks(event.tasks.map((t: any) => ({
              filepath: t.filepath,
              description: t.description,
              action: t.action,
              status: 'pending',
            })));
          }
          break;
        case 'code':
          setAgentTasks((prev: typeof agentTasks) => {
            const exists = prev.some((t) => t.filepath === event.filepath);
            if (exists) {
              return prev.map((t) => t.filepath === event.filepath ? { ...t, status: event.status || 'done' } : t);
            }
            return [...prev, { filepath: event.filepath, description: event.description || '', action: 'create' as const, status: 'done' as const }];
          });
          break;
        case 'approval_needed':
          setPendingReview({
            threadId: newThreadId,
            plan: event.plan || '',
            reviewResult: event.review_result || '',
            changes: event.changes || [],
          });
          setAgentStatus('waiting_approval');
          break;
        case 'error':
          setAgentStatus('error');
          break;
      }
    });
  };

  const status = statusConfig[agentStatus] || statusConfig.idle;

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-orion-text-secondary uppercase">
          Agent Mode
        </span>
      </div>

      {/* Feature Request */}
      <div className="space-y-2">
        <textarea
          value={featureRequest}
          onChange={(e) => setFeatureRequest(e.target.value)}
          placeholder="Describe the feature to implement..."
          rows={4}
          className="w-full bg-orion-bg-input border border-orion-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-orion-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-orion-accent-blue"
        />
        <button
          onClick={handleRun}
          disabled={isRunning || !apiKey || !featureRequest.trim()}
          className="w-full flex items-center justify-center gap-2 bg-orion-accent-blue text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {isRunning ? 'Running...' : 'Run Agent'}
        </button>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-2 text-sm ${status.color}`}>
        {status.icon}
        <span>{status.label}</span>
      </div>

      {/* Plan */}
      {agentPlan && (
        <div className="bg-orion-bg-tertiary border border-orion-border rounded-lg p-3 space-y-2">
          <h4 className="text-xs font-semibold text-orion-accent-amber uppercase tracking-wider">
            Plan
          </h4>
          <p className="text-sm text-orion-text-primary whitespace-pre-wrap">
            {agentPlan}
          </p>
        </div>
      )}

      {/* Tasks */}
      {agentTasks.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-orion-text-secondary uppercase tracking-wider mb-2">
            Tasks
          </h4>
          {agentTasks.map((task, i) => (
            <div
              key={i}
              className="flex items-start gap-2 py-1.5 px-2 rounded bg-orion-bg-tertiary border border-orion-border"
            >
              <span className="mt-0.5 flex-shrink-0">
                {taskStatusIcon[task.status] || taskStatusIcon.pending}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-orion-accent-teal truncate">{task.filepath}</p>
                <p className="text-xs text-orion-text-secondary">{task.description}</p>
              </div>
              {task.action && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orion-bg-input text-orion-text-secondary flex-shrink-0">
                  {task.action}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
