import { z } from 'zod';
import { symptomChecks } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  symptomChecks: {
    list: {
      method: 'GET' as const,
      path: '/api/symptom-checks' as const,
      responses: {
        200: z.array(z.custom<typeof symptomChecks.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/symptom-checks/:id' as const,
      responses: {
        200: z.custom<typeof symptomChecks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/symptom-checks' as const,
      input: z.object({
        symptoms: z.array(z.string()),
        description: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        locationLabel: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof symptomChecks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats' as const,
      responses: {
        200: z.object({
          checksToday: z.number(),
          avgRiskScore: z.number(),
          highRiskCases: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
