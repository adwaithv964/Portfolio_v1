import { useState } from 'react';
import { useContent } from '@/contexts/ContentContext.jsx';
import { AdminInput, SaveBar, SectionPage } from '../components/AdminFormComponents.jsx';

export default function AdminFooter() {
  const { content, saveSection } = useContent();
  const [form, setForm] = useState({ ...content.footer });
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState('');

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaveState('saving');
    setSaveError('');
    const result = await saveSection('footer', form);
    if (result.success) {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } else {
      setSaveState('idle');
      setSaveError(result.error);
    }
  };

  return (
    <SectionPage title="Footer & Social Links" episode="EPISODE 06" description="Edit social links, location, and copyright.">
      <div className="space-y-5">
        <AdminInput label="GitHub URL" id="github" value={form.github} onChange={set('github')} placeholder="https://github.com/yourusername" type="url" maxLength={200} />
        <AdminInput label="LinkedIn URL" id="linkedin" value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/yourusername" type="url" maxLength={200} />
        <AdminInput label="Email Address" id="email" value={form.email} onChange={set('email')} placeholder="you@example.com" type="email" maxLength={254} />
        <AdminInput label="Location" id="location" value={form.location} onChange={set('location')} placeholder="KERALA, INDIA" maxLength={50} />
        <AdminInput label="Copyright Name" id="copyright" value={form.copyright} onChange={set('copyright')} placeholder="Adwaith V" maxLength={60} hint="Shown as: © 2026 [Copyright Name]. All Rights Reserved." />
      </div>
      <SaveBar onSave={handleSave} saveState={saveState} saveError={saveError} />
    </SectionPage>
  );
}
