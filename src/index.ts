import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { loadPromptsFromCsv } from "./csv.js";
import { loadConfig } from "./config.js";
import { SelectorChatAdapter } from "./adapters/selectorAdapter.js";
import { ResultRow } from "./types.js";
import { applyAuthCookie } from "./auth.js";

function getArg(name: string): string | undefined {
    const idx = process.argv.indexOf(name);
    return idx === -1 ? undefined : process.argv[idx + 1];
}

function ensureDir(p: string) {
    fs.mkdirSync(p, { recursive: true });
}

async function main() {
    const csvPath = getArg("--csv") ?? getArg("-c");
    if (!csvPath) throw new Error("Usage: npm run dev -- --csv data/prompts.csv");

    const cfg = loadConfig();
    const outputFile = process.env.OUTPUT_FILE ?? "outputs/results.jsonl";

    ensureDir(path.dirname(outputFile));

    const slowMo = Number(process.env.SLOW_MO_MS ?? "0") || 0;

    const prompts = loadPromptsFromCsv(csvPath);
    if (!prompts.length) throw new Error("No valid rows found in CSV.");

    const browser = await chromium.launch({
        slowMo,
        headless: process.env.HEADLESS !== "false"
    });

    const context = await browser.newContext({
        storageState: process.env.STORAGE_STATE || undefined
    });

    const page = await context.newPage();
    const chat = new SelectorChatAdapter(page, cfg);

    await applyAuthCookie(context, cfg.url);

    await chat.goto(cfg.url);
    await chat.startNewChatIfConfigured();

    for (const row of prompts) {
        const startedAt = new Date().toISOString();
        const response = await chat.sendPromptAndGetResponse(row.prompt);
        const finishedAt = new Date().toISOString();

        const result: ResultRow = {
            id: row.id,
            prompt: row.prompt,
            response,
            startedAt,
            finishedAt
        };

        fs.appendFileSync(outputFile, JSON.stringify(result) + "\n", "utf-8");
        console.log(`[${row.id}] ok (${response.length} chars)`);
    }

    await context.storageState({ path: "storageState.json" }).catch(() => { });
    await browser.close();

    console.log(`Results: ${outputFile}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});