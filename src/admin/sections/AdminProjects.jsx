import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '@/contexts/ContentContext.jsx';
import { AdminInput, AdminTextarea, AdminTagEditor, SaveBar, SectionPage } from '../components/AdminFormComponents.jsx';

const EMPTY_PROJECT = { title: '', category: '', description: '', tags: [], match: '99%', episode: 'S01 E01' };

export default function AdminProjects() {
  const { content, saveSection } = useContent();
  const [projects,     setProjects]     = useState([...content.projects]);
  const [saveState,    setSaveState]    = useState('idle');
  const [saveError,    setSaveError]    = useState('');
  const [expandedIdx,  setExpandedIdx]  = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const setField = (i, key, val) => { const u = [...projects]; u[i] = { ...u[i], [key]: val }; setProjects(u); };
  const setTags  = (i, tags)     => { const u = [...projects]; u[i] = { ...u[i], tags };        setProjects(u); };

  const addProject    = () => { setProjects(prev => [...prev, { ...EMPTY_PROJECT, episode: `S01 E0${prev.length + 1}` }]); setExpandedIdx(projects.length); };
  const deleteProject = (i) => { setProjects(prev => prev.filter((_, idx) => idx !== i)); setDeleteConfirm(null); setExpandedIdx(null); };
  const moveUp        = (i) => { if (i === 0) return; const u = [...projects]; [u[i-1], u[i]] = [u[i], u[i-1]]; setProjects(u); };
  const moveDown      = (i) => { if (i === projects.length - 1) return; const u = [...projects]; [u[i], u[i+1]] = [u[i+1], u[i]]; setProjects(u); };

  const handleSave = async () => {
    setSaveState('saving');
    setSaveError('');
    const result = await saveSection('projects', projects);
    if (result.success) {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } else {
      setSaveState('idle');
      setSaveError(result.error);
    }
  };

  return (
    <SectionPage title="Projects Section" episode="EPISODE 05" description="Add, edit, reorder, or delete project cards.">
      <div className="space-y-3">
        {projects.map((proj, i) => (
          <div key={i} className="border border-white/8 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/3 transition-colors" onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
              <span className="text-[10px] font-mono text-red-500/60">{proj.episode || `E0${i + 1}`}</span>
              <span className="flex-1 text-sm font-bold text-white truncate">{proj.title || 'Untitled Project'}</span>
              <span className="text-[10px] font-mono text-white/30 hidden sm:block truncate max-w-[120px]">{proj.category}</span>
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                <button type="button" onClick={() => moveUp(i)} disabled={i === 0} className="p-1 text-white/20 hover:text-white/60 disabled:opacity-20 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button type="button" onClick={() => moveDown(i)} disabled={i === projects.length - 1} className="p-1 text-white/20 hover:text-white/60 disabled:opacity-20 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); setDeleteConfirm(deleteConfirm === i ? null : i); }} className="p-1 text-white/20 hover:text-red-400 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <svg className={`w-3.5 h-3.5 text-white/30 transition-transform ${expandedIdx === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>

            <AnimatePresence>
              {deleteConfirm === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 py-3 bg-red-950/40 border-t border-red-600/20 flex items-center gap-3 text-xs font-mono">
                    <span className="text-red-400">Delete "{proj.title}"?</span>
                    <button type="button" onClick={() => deleteProject(i)} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
                    <button type="button" onClick={() => setDeleteConfirm(null)} className="text-white/40 hover:text-white/70 transition-colors">Cancel</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {expandedIdx === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-5 border-t border-white/8 bg-white/2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AdminInput label="Title" id={`p-title-${i}`} value={proj.title} onChange={v => setField(i, 'title', v)} placeholder="Project Name" maxLength={60} />
                      <AdminInput label="Category" id={`p-cat-${i}`} value={proj.category} onChange={v => setField(i, 'category', v)} placeholder="Cybersecurity Platform" maxLength={50} />
                      <AdminInput label="Match %" id={`p-match-${i}`} value={proj.match} onChange={v => setField(i, 'match', v)} placeholder="99%" maxLength={5} />
                      <AdminInput label="Episode" id={`p-ep-${i}`} value={proj.episode} onChange={v => setField(i, 'episode', v)} placeholder="S01 E01" maxLength={10} />
                    </div>
                    <AdminTextarea label="Description" id={`p-desc-${i}`} value={proj.description} onChange={v => setField(i, 'description', v)} placeholder="Project description..." maxLength={300} rows={3} />
                    <AdminTagEditor label="Tech Tags" tags={proj.tags || []} onChange={tags => setTags(i, tags)} hint="Press Enter or comma to add a tag." />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        <button type="button" onClick={addProject}
          className="w-full py-3 border border-dashed border-white/15 hover:border-red-600/40 rounded-xl text-xs font-mono text-white/30 hover:text-red-400 transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> Add Project
        </button>
      </div>
      <SaveBar onSave={handleSave} saveState={saveState} saveError={saveError} />
    </SectionPage>
  );
}
