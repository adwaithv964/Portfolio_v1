import { useState } from 'react';
import { useContent } from '@/contexts/ContentContext.jsx';
import { AdminInput, AdminTextarea, AdminTagEditor, SaveBar, SectionPage } from '../components/AdminFormComponents.jsx';

export default function AdminSkills() {
  const { content, saveSection } = useContent();
  const [categories, setCategories] = useState([...content.skills]);
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState('');

  const setField  = (i, key, val) => { const u = [...categories]; u[i] = { ...u[i], [key]: val }; setCategories(u); };
  const setSkills = (i, skills)   => { const u = [...categories]; u[i] = { ...u[i], skills };       setCategories(u); };
  const addCategory    = ()  => setCategories(prev => [...prev, { title: '', desc: '', tag: '', skills: [] }]);
  const removeCategory = (i) => setCategories(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaveState('saving');
    setSaveError('');
    const result = await saveSection('skills', categories);
    if (result.success) {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } else {
      setSaveState('idle');
      setSaveError(result.error);
    }
  };

  return (
    <SectionPage title="Skills Section" episode="EPISODE 04" description="Edit skill categories and individual skill chips.">
      <div className="space-y-6">
        {categories.map((cat, i) => (
          <div key={i} className="p-5 bg-white/3 border border-white/8 rounded-xl space-y-4 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Category {i + 1}</span>
              <button type="button" onClick={() => removeCategory(i)} className="text-white/20 hover:text-red-400 text-xs font-mono transition-colors">Remove</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput label="Category Title" id={`cat-title-${i}`} value={cat.title} onChange={v => setField(i, 'title', v)} placeholder="Frontend Engineering" maxLength={40} />
              <AdminInput label="Tag Badge" id={`cat-tag-${i}`} value={cat.tag} onChange={v => setField(i, 'tag', v)} placeholder="UI / INTERACTION" maxLength={30} />
            </div>
            <AdminTextarea label="Description" id={`cat-desc-${i}`} value={cat.desc} onChange={v => setField(i, 'desc', v)} placeholder="Brief description..." maxLength={200} rows={2} />
            <AdminTagEditor label="Skill Chips" tags={cat.skills || []} onChange={skills => setSkills(i, skills)} hint="Press Enter or comma to add a skill tag." />
          </div>
        ))}
        <button type="button" onClick={addCategory}
          className="w-full py-3 border border-dashed border-white/15 hover:border-red-600/40 rounded-xl text-xs font-mono text-white/30 hover:text-red-400 transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> Add Category
        </button>
      </div>
      <SaveBar onSave={handleSave} saveState={saveState} saveError={saveError} />
    </SectionPage>
  );
}
