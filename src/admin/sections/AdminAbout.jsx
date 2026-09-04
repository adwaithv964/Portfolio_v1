import { useState } from 'react';
import { useContent } from '@/contexts/ContentContext.jsx';
import { AdminInput, AdminTextarea, AdminTagEditor, SaveBar, SectionPage } from '../components/AdminFormComponents.jsx';

export default function AdminAbout() {
  const { content, saveSection } = useContent();
  const [form, setForm] = useState({ ...content.about });
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState('');

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const setAchievementText = (i, val) => {
    const updated = [...form.achievements];
    updated[i] = { text: val };
    setForm(prev => ({ ...prev, achievements: updated }));
  };
  const addAchievement = () => setForm(prev => ({ ...prev, achievements: [...prev.achievements, { text: '' }] }));
  const removeAchievement = (i) => setForm(prev => ({ ...prev, achievements: prev.achievements.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaveState('saving');
    setSaveError('');
    const result = await saveSection('about', form);
    if (result.success) {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } else {
      setSaveState('idle');
      setSaveError(result.error);
    }
  };

  return (
    <SectionPage title="About Section" episode="EPISODE 02" description="Edit bio, achievements, and tech stack tags.">
      <AdminTextarea label="Bio (wrap names in <strong>...</strong>)" id="bio" value={form.bio} onChange={set('bio')} placeholder="I am <strong>Adwaith V</strong>..." rows={3} hint="Only <strong> and <em> tags are allowed — all others are stripped by the server." />
      <AdminTextarea label="Second Paragraph" id="paragraph2" value={form.paragraph2} onChange={set('paragraph2')} placeholder="My technical journey..." rows={3} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Achievements / Milestones</p>
          <button type="button" onClick={addAchievement} className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> Add
          </button>
        </div>
        {form.achievements?.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input type="text" value={item.text} onChange={e => setAchievementText(i, e.target.value)} placeholder={`Achievement ${i + 1} (supports <strong> tags)`}
              className="flex-1 bg-white/5 border border-white/10 focus:border-red-600/50 rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-xs font-mono focus:outline-none transition-all" />
            <button type="button" onClick={() => removeAchievement(i)} className="mt-2 text-white/20 hover:text-red-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>

      <AdminTagEditor label="Specialty Tags" tags={form.tags || []} onChange={v => setForm(prev => ({ ...prev, tags: v }))} hint="Press Enter or comma to add a tag." />
      <AdminTagEditor label="Tech Stack Row" tags={form.techStack || []} onChange={v => setForm(prev => ({ ...prev, techStack: v }))} hint="Technologies shown in the bottom full-width card." />
      <SaveBar onSave={handleSave} saveState={saveState} saveError={saveError} />
    </SectionPage>
  );
}
