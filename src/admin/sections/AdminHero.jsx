import { useState } from 'react';
import { useContent } from '@/contexts/ContentContext.jsx';
import { AdminInput, AdminTextarea, AdminTagEditor, SaveBar, SectionPage } from '../components/AdminFormComponents.jsx';

export default function AdminHero() {
  const { content, saveSection } = useContent();
  const [form, setForm] = useState({ ...content.hero });
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState('');

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));
  const rolesText = form.roles?.join('\n') || '';
  const setRoles  = (text) => setForm(prev => ({ ...prev, roles: text.split('\n').filter(Boolean) }));

  const handleSave = async () => {
    setSaveState('saving');
    setSaveError('');
    const result = await saveSection('hero', form);
    if (result.success) {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } else {
      setSaveState('idle');
      setSaveError(result.error);
    }
  };

  return (
    <SectionPage title="Hero Section" episode="EPISODE 01" description="Edit the main hero — name, subtitle, roles, description, badges.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AdminInput label="Name" id="name" value={form.name} onChange={set('name')} placeholder="ADWAITH" maxLength={30} />
        <AdminInput label="Subtitle" id="subtitle" value={form.subtitle} onChange={set('subtitle')} placeholder="DEV.SHIELD" maxLength={30} />
        <AdminInput label="Top Badge" id="topBadge" value={form.topBadge} onChange={set('topBadge')} placeholder="TOP DEV" maxLength={20} />
        <AdminInput label="Role Tagline" id="roleTagline" value={form.roleTagline} onChange={set('roleTagline')} placeholder="Full-Stack Developer & ..." maxLength={80} />
        <AdminInput label="Tech Stack" id="techStack" value={form.techStack} onChange={set('techStack')} placeholder="React • Node.js • Python" maxLength={80} />
        <AdminInput label="Tech Badge" id="techBadge" value={form.techBadge} onChange={set('techBadge')} placeholder="Docker & CyberSec" maxLength={40} />
        <AdminInput label="Badge Left" id="badgeLeft" value={form.badgeLeft} onChange={set('badgeLeft')} placeholder="FULL-STACK 4K" maxLength={30} />
        <AdminInput label="Badge Right" id="badgeRight" value={form.badgeRight} onChange={set('badgeRight')} placeholder="CYBER SECURITY" maxLength={30} />
        <AdminInput label="Seasons" id="seasons" value={form.seasons} onChange={set('seasons')} placeholder="SEASONS 2023 - 2026" maxLength={30} />
        <AdminInput label="Portfolio Version" id="version" value={form.version} onChange={set('version')} placeholder="PORTFOLIO RELEASE v1.0" maxLength={40} />
        <AdminInput label="Bottom Ticker" id="ticker" value={form.ticker} onChange={set('ticker')} placeholder="ENGINEERED FOR SECURITY..." maxLength={60} />
      </div>
      <AdminTextarea label="Description" id="description" value={form.description} onChange={set('description')} placeholder="Short bio text shown in hero..." maxLength={300} rows={3} />
      <AdminTextarea label="Core Stack & Highlights (right panel)" id="coreStack" value={form.coreStack} onChange={set('coreStack')} placeholder="BSc Computer Science, CyberSafeHub Creator..." maxLength={200} rows={3} />
      <AdminTextarea
        label="Scrolling Marquee Roles (one per line)"
        id="roles"
        value={rolesText}
        onChange={setRoles}
        placeholder={'FEATURE FILM // FULL-STACK DEVELOPER\nORIGINAL SERIES // CYBER SECURITY ANALYST'}
        rows={5}
        hint="Each line becomes one scrolling text item in the background marquee."
      />
      <SaveBar onSave={handleSave} saveState={saveState} saveError={saveError} />
    </SectionPage>
  );
}
