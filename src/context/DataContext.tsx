import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  timeline as demoTimeline,
  events as demoEvents,
  achievements as demoAchievements,
  hallMembers as demoHallMembers,
  contentItems as demoContentItems,
} from '../data';
import type { TimelineEvent, EventItem, HallMember, ContentItem, Achievement } from '../data';

const STORAGE_KEY = 'museo-datos-v1';

export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop&auto=format';

export const PERSON_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&auto=format';

interface DataState {
  timeline: TimelineEvent[];
  events: EventItem[];
  achievements: Achievement[];
  hallMembers: HallMember[];
  contentItems: ContentItem[];
}

interface DataContextValue extends DataState {
  addTimelineEvent: (ev: TimelineEvent) => void;
  addAchievement: (a: Omit<Achievement, 'id'>) => void;
  addHallMember: (m: Omit<HallMember, 'id'>) => void;
  addCalendarEvent: (e: Omit<EventItem, 'id'>) => void;
  addFeaturedProject: (
    p: Pick<ContentItem, 'title' | 'category' | 'author' | 'date' | 'description'> & {
      tags?: string[];
      image?: string;
    }
  ) => void;
  resetData: () => void;
}

const demoData: DataState = {
  timeline: demoTimeline,
  events: demoEvents,
  achievements: demoAchievements,
  hallMembers: demoHallMembers,
  contentItems: demoContentItems,
};

function loadInitial(): DataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DataState>;
      return {
        timeline: Array.isArray(parsed.timeline) && parsed.timeline.length ? parsed.timeline : demoData.timeline,
        events: Array.isArray(parsed.events) && parsed.events.length ? parsed.events : demoData.events,
        achievements: Array.isArray(parsed.achievements) && parsed.achievements.length ? parsed.achievements : demoData.achievements,
        hallMembers: Array.isArray(parsed.hallMembers) && parsed.hallMembers.length ? parsed.hallMembers : demoData.hallMembers,
        contentItems: Array.isArray(parsed.contentItems) && parsed.contentItems.length ? parsed.contentItems : demoData.contentItems,
      };
    }
  } catch {
    // Datos corruptos o almacenamiento no disponible: usar demo
  }
  return demoData;
}

let seq = 0;
const genId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${++seq}`;

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataState>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Almacenamiento lleno o bloqueado: la app sigue funcionando en memoria
    }
  }, [data]);

  const value = useMemo<DataContextValue>(
    () => ({
      ...data,
      addTimelineEvent: ev =>
        setData(d => ({ ...d, timeline: [...d.timeline, ev] })),
      addAchievement: a =>
        setData(d => ({ ...d, achievements: [...d.achievements, { ...a, id: genId('ach') }] })),
      addHallMember: m =>
        setData(d => ({ ...d, hallMembers: [...d.hallMembers, { ...m, id: genId('hm') }] })),
      addCalendarEvent: e =>
        setData(d => ({ ...d, events: [...d.events, { ...e, id: genId('ev') }] })),
      addFeaturedProject: p =>
        setData(d => ({
          ...d,
          contentItems: [
            {
              status: 'publicado',
              featured: true,
              image: p.image?.trim() || PLACEHOLDER_IMAGE,
              tags: [],
              submittedBy: p.author,
              ...p,
              id: genId('p'),
            },
            ...d.contentItems,
          ],
        })),
      resetData: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignorar
        }
        setData({ ...demoData });
      },
    }),
    [data]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>');
  return ctx;
}
