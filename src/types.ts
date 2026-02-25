export type PromptRow = {
    id: string;
    prompt: string;
};

export type ResultRow = {
    id: string;
    prompt: string;
    response: string;
    startedAt: string;
    finishedAt: string;
    meta?: Record<string, unknown>;
};