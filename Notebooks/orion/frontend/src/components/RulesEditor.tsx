import { useState, useEffect, type ChangeEvent } from 'react';
import { Save, Check } from 'lucide-react';
import useStore from '../store/useStore';
import { fetchRules, saveRules } from '../api/client';

export default function RulesEditor() {
  const { rules, setRules } = useStore();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchRules().then((data) => {
      if (data.content) setRules(data.content);
    });
  }, []);

  const handleSave = async () => {
    await saveRules(rules);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-orion-text-secondary uppercase">
          Rules
        </span>
        <span className="text-[10px] text-orion-text-muted">.cursorrules</span>
      </div>

      {/* Editor */}
      <textarea
        value={rules}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRules(e.target.value)}
        placeholder="Add coding rules here... (equivalent to .cursorrules)"
        className="flex-1 w-full bg-orion-bg-input border border-orion-border rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-orion-text-muted resize-none focus:outline-none focus:ring-1 focus:ring-orion-accent-blue"
      />

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
          saved
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-orion-accent-blue text-white hover:opacity-90'
        }`}
      >
        {saved ? <Check size={16} /> : <Save size={16} />}
        {saved ? 'Saved' : 'Save Rules'}
      </button>

      {/* Help */}
      <p className="text-[11px] text-orion-text-muted leading-relaxed">
        Rules are injected into every AI interaction to shape code style and conventions.
      </p>
    </div>
  );
}
