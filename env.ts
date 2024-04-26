import { z } from "zod";

const envVariables = z.object({
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string(),
});

export const env = envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
