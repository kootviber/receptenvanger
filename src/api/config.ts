import path from "node:path";

export type ApiConfig = {
  port: number;
  databasePath: string;
  openAiApiKey: string;
  openAiModel: string;
};

export function loadApiConfig(): ApiConfig {
  const port = Number.parseInt(process.env.PORT ?? "8787", 10);

  return {
    port: Number.isFinite(port) ? port : 8787,
    databasePath: path.resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/receptenvanger.sqlite"),
    openAiApiKey: (process.env.OPENAI_API_KEY ?? "").trim(),
    openAiModel: (process.env.OPENAI_MODEL ?? "gpt-4.1-mini").trim()
  };
}
