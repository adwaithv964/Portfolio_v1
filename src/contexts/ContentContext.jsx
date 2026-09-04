/**
 * ContentContext.jsx - Portfolio content management
 *
 * Reads content from the Express API (GET /api/content).
 * Admin saves via PUT /api/content/:section with session cookie.
 * Cookie is sent automatically - no Authorization header needed.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '@/utils/apiBase.js';

const ContentContext = createContext(null);

const EMPTY_CONTENT = {
  hero: { name: 'ADWAITH', subtitle: 'DEV.SHIELD', roles: [], roleTagline: '', topBadge: '', description: '', techStack: '', techBadge: '', badgeLeft: '', badgeRight: '', seasons: '', coreStack: '', ticker: '', version: '' },
  about: { bio: '', paragraph2: '', tags: [], achievements: [], techStack: [] },
  expertise: [],
  skills: [],
  projects: [],
  footer: { github: '', linkedin: '', email: '', location: '', copyright: 'Adwaith V' },
};

export function ContentProvider({ children }) {
  const [content,  setContent]  = useState(EMPTY_CONTENT);
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState('');

  // Fetch content from server
  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/content`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setContent(data);
      setApiError('');
    } catch (err) {
      console.warn('[ContentContext] API unavailable:', err.message);
      setApiError('Server offline - showing cached data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  // Save one section to the server (session cookie sent automatically)
  const saveSection = useCallback(async (sectionKey, sectionData) => {
    try {
      const res = await fetch(`${API_BASE}/api/content/${sectionKey}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData),
      });

      if (res.status === 401) {
        return { success: false, error: 'Session expired. Please log in again.' };
      }
      if (res.status === 403) {
        return { success: false, error: 'Request rejected. Please reload and try again.' };
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || 'Save failed.' };
      }

      const { data } = await res.json();
      setContent(prev => ({ ...prev, [sectionKey]: data }));
      return { success: true };

    } catch {
      return { success: false, error: 'Network error. Check server.' };
    }
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading, apiError, saveSection, reload: fetchContent }}>
      {children}
    </ContentContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}
