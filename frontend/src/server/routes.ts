export const API_ROUTES = {
  teamMembers: {
    list: '/team-members',
    create: '/team-members',
    update: (id: string) => `/team-members/${id}`,
    delete: (id: string) => `/team-members/${id}`,
  },
  scheduleRequirements: {
    list: '/schedule-requirements',
    create: '/schedule-requirements',
    update: (id: string) => `/schedule-requirements/${id}`,
    enable: (id: string) => `/schedule-requirements/${id}/enable`,
    disable: (id: string) => `/schedule-requirements/${id}/disable`,
    delete: (id: string) => `/schedule-requirements/${id}`,
  },
  scheduleEntries: {
    set: '/schedule-entries',
    list: '/schedule-entries',
    delete: (id: string) => `/schedule-entries/${id}`,
    overview: '/schedule-overview',
  },
} as const
