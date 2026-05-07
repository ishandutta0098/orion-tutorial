import { X } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useStore from '../store/useStore';
import { approveAgent, fetchFiles } from '../api/client';

export default function ReviewDialog() {
  const {
    pendingReview, setPendingReview,
    threadId, setAgentStatus,
  } = useStore();

  if (!pendingReview) return null;

  const handleDecision = (decision: 'approve' | 'reject') => {
    setPendingReview(null);
    setAgentStatus(decision === 'approve' ? 'applying' : 'idle');

    approveAgent(threadId, decision, (event: Record<string, any>) => {
      switch (event.type) {
        case 'status':
          if (event.status === 'done' || event.status === 'tested') {
            setAgentStatus('done');
            fetchFiles().then((data) => {
              const files = Array.isArray(data) ? data : data.files || [];
              useStore.getState().setFiles(files);
            });
          } else {
            setAgentStatus(event.status);
          }
          break;
        case 'done':
          setAgentStatus('done');
          fetchFiles().then((data) => {
            const files = Array.isArray(data) ? data : data.files || [];
            useStore.getState().setFiles(files);
          });
          break;
        case 'error':
          setAgentStatus('error');
          break;
      }
    });
  };

  const langFromPath = (filepath: string): string => {
    const ext = filepath.split('.').pop() || '';
    const map: Record<string, string> = {
      ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
      py: 'python', json: 'json', css: 'css', html: 'html', md: 'markdown',
    };
    return map[ext] || 'text';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-orion-bg-secondary rounded-lg border border-orion-border max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-orion-border flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">Review Changes</h2>
          <button
            onClick={() => setPendingReview(null)}
            className="p-1 rounded hover:bg-orion-bg-input text-orion-text-secondary hover:text-orion-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Plan Summary */}
          {pendingReview.plan && (
            <div className="bg-orion-accent-blue/10 border border-orion-accent-blue/30 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-orion-accent-blue uppercase tracking-wider mb-2">
                Plan Summary
              </h3>
              <p className="text-sm text-orion-text-primary whitespace-pre-wrap">
                {pendingReview.plan}
              </p>
            </div>
          )}

          {/* Review Result */}
          {pendingReview.reviewResult && (
            <div className="bg-orion-bg-tertiary border border-orion-border rounded-lg p-4">
              <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                AI Review
              </h3>
              <p className="text-sm text-orion-text-primary whitespace-pre-wrap">
                {pendingReview.reviewResult}
              </p>
            </div>
          )}

          {/* Changes */}
          {pendingReview.changes?.map((change: any, i: number) => (
            <div key={i} className="border border-orion-border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-orion-bg-tertiary flex items-center justify-between">
                <span className="text-sm font-mono text-orion-accent-teal">{change.filepath}</span>
                <span className="text-xs text-orion-text-secondary">{change.description}</span>
              </div>
              {(change.code || change.code_preview) && (
                <SyntaxHighlighter
                  style={oneDark}
                  language={langFromPath(change.filepath)}
                  customStyle={{ margin: 0, borderRadius: 0, fontSize: '12px', maxHeight: '300px' }}
                >
                  {change.code || change.code_preview}
                </SyntaxHighlighter>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-orion-border flex-shrink-0">
          <button
            onClick={() => handleDecision('reject')}
            className="px-4 py-2 bg-orion-accent-red text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Reject
          </button>
          <button
            onClick={() => handleDecision('approve')}
            className="px-4 py-2 bg-orion-accent-teal text-black rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
