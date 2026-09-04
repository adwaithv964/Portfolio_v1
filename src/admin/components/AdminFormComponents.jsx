/** Reusable styled input/textarea/tag editor for admin forms */

// ── Text input ─────────────────────────────────────────────────────────────────
export function AdminInput({ label, id, value, onChange, placeholder, maxLength, type = 'text', hint }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
        {label} {maxLength && <span className="text-white/20">({value?.length || 0}/{maxLength})</span>}
      </label>
      <input
        type={type}
        id={id}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-white/5 border border-white/10 focus:border-red-600/50 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm font-mono focus:outline-none transition-all"
      />
      {hint && <p className="text-[10px] text-white/25 font-mono">{hint}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function AdminTextarea({ label, id, value, onChange, placeholder, maxLength, rows = 4, hint }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
        {label} {maxLength && <span className="text-white/20">({value?.length || 0}/{maxLength})</span>}
      </label>
      <textarea
        id={id}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className="w-full bg-white/5 border border-white/10 focus:border-red-600/50 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm font-mono focus:outline-none transition-all resize-none"
      />
      {hint && <p className="text-[10px] text-white/25 font-mono">{hint}</p>}
    </div>
  );
}

// ── Tag list editor ───────────────────────────────────────────────────────────
export function AdminTagEditor({ label, tags, onChange, hint }) {
  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = e.target.value.replace(',', '').trim();
      if (val && !tags.includes(val)) onChange([...tags, val]);
      e.target.value = '';
    }
  };
  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">{label}</p>
      <div className="flex flex-wrap gap-2 p-3 bg-white/5 border border-white/10 rounded-xl min-h-[48px]">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-red-600/15 border border-red-600/30 rounded-lg text-xs font-mono text-red-300">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-red-400/60 hover:text-red-300 transition-colors">×</button>
          </span>
        ))}
        <input
          type="text"
          onKeyDown={addTag}
          placeholder="Type & press Enter to add..."
          className="flex-1 min-w-[120px] bg-transparent text-white text-xs font-mono placeholder-white/20 focus:outline-none"
        />
      </div>
      {hint && <p className="text-[10px] text-white/25 font-mono">{hint}</p>}
    </div>
  );
}

// ── Section save bar (handles async saveState + server error message) ─────────
export function SaveBar({ onSave, onReset, saveState, saveError }) {
  return (
    <div className="space-y-2 pt-6 border-t border-white/8 mt-6">
      {saveError && (
        <p className="text-xs font-mono text-red-400 bg-red-600/10 border border-red-600/20 rounded-lg px-4 py-2">
          ⚠ {saveError}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saveState === 'saving'}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(229,9,20,0.4)]"
        >
          {saveState === 'saving' ? (
            <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Saving...</>
          ) : saveState === 'saved' ? (
            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Saved!</>
          ) : (
            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>Save Changes</>
          )}
        </button>
        {onReset && (
          <button type="button" onClick={onReset} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 font-mono text-xs uppercase tracking-widest rounded-xl transition-all">
            Reset to Default
          </button>
        )}
      </div>
    </div>
  );
}

// ── Section page wrapper ──────────────────────────────────────────────────────
export function SectionPage({ title, episode, description, children }) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-600/10 border border-red-600/20 text-[10px] font-mono uppercase tracking-widest text-red-500 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            {episode}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{title}</h1>
          {description && <p className="text-sm text-white/40 font-mono mt-1">{description}</p>}
        </div>
      </div>
      <div className="bg-[#111111] border border-white/8 rounded-2xl p-6 space-y-6">
        {children}
      </div>
    </div>
  );
}
