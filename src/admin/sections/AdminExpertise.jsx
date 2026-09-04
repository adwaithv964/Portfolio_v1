import { useState } from 'react';
import { useContent } from '@/contexts/ContentContext.jsx';
import { AdminInput, AdminTextarea, SaveBar, SectionPage } from '../components/AdminFormComponents.jsx';

export default function AdminExpertise() {
  const { content, saveSection } = useContent();
  const [items, setItems] = useState([...content.expertise]);
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState('');

  const setField = (i, key, val) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [key]: val };
    setItems(updated);
  };

  const handleSave = async () => {
    setSaveState('saving');
    setSaveError('');
    const result = await saveSection('expertise', items);
    if (result.success) {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } else {
      setSaveState('idle');
      setSaveError(result.error);
    }
  };

  return (
    <SectionPage title="Expertise Section" episode="EPISODE 03" description="Edit the 4 stacked expertise cards.">
      <div className="space-y-8">
        {items.map((item, i) => (
          <div key={i} className="p-5 bg-white/3 border border-white/8 rounded-xl space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-black text-red-600/40 font-mono">{item.number}</span>
              <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Card {i + 1}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput label="Title" id={`title-${i}`} value={item.title} onChange={v => setField(i, 'title', v)} placeholder="Full-Stack Development" maxLength={50} />
              <AdminInput label="Tag Badge" id={`tag-${i}`} value={item.tag} onChange={v => setField(i, 'tag', v)} placeholder="UI / UX & BACKEND" maxLength={40} />
            </div>
            <AdminTextarea label="Description" id={`text-${i}`} value={item.text} onChange={v => setField(i, 'text', v)} placeholder="Description..." maxLength={300} rows={3} />
          </div>
        ))}
      </div>
      <SaveBar onSave={handleSave} saveState={saveState} saveError={saveError} />
    </SectionPage>
  );
}
