export const API_ROUTES = {
  teamMembers: {
    list: '/team-members',
    create: '/team-members',
    update: (id: string) => `/team-members/${id}`,
    delete: (id: string) => `/team-members/${id}`,
  },
} as const
