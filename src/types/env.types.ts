export type AppEnv = "dev" | "prod" | "test";

export interface EnvConfig {
  ENV: AppEnv;
  PORT: number;
}
const allowedEnvs: AppEnv[] = ["dev", "prod", "test"];


