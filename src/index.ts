import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { loadPromptsFromCsv } from "./csv.js";
import { ChatbotClient } from "./chatbot.js";
import { ResultRow } from "./types.js";

function getArg(name: string): string | undefined {
    const idx = process.argv.indexOf(name);
    if (idx === -1) return undefined;
    return process.argv[idx + 1];
}

function ensureDir(p: string) {
    fs.mkdirSync(p, { recursive: true });
}

async function main() {
    const csvPath = getArg("--csv") ?? getArg("-c");
    if (!csvPath) {
        console.error("Usage: npm run dev -- --csv data/prompts.csv");
        process.exit(1);
    }

    const url = process.env.CHATBOT_URL;
    if (!url) {
        console.error("Missing CHATBOT_URL in environment (.env)");
        process.exit(1);
    }

    const outputFile = process.env.OUTPUT_FILE ?? "outputs/results.jsonl";
    ensureDir(path.dirname(outputFile));

    const slowMo = Number(process.env.SLOW_MO_MS ?? "0") || 0;

    const prompts = loadPromptsFromCsv(csvPath);
    if (!prompts.length) {
        console.error("No valid rows found in CSV.");
        process.exit(1);
    }

    const browser = await chromium.launch({ slowMo, headless: process.env.HEADLESS !== "false" });
    const context = await browser.newContext({
        storageState: process.env.STORAGE_STATE || undefined
    });
    const page = await context.newPage();

    const bot = new ChatbotClient(page);
    await bot.goto(url);

    for (const row of prompts) {
        const startedAt = new Date().toISOString();
        console.log(`[${row.id}] sending prompt...`);

        const response = await bot.sendPromptAndGetResponse(row.prompt);

        const finishedAt = new Date().toISOString();
        const result: ResultRow = {
            id: row.id,
            prompt: row.prompt,
            response,
            startedAt,
            finishedAt
        };

        fs.appendFileSync(outputFile, JSON.stringify(result) + "\n", "utf-8");
        console.log(`[${row.id}] done (${response.length} chars)`);
    }

    await context.storageState({ path: "storageState.json" }).catch(() => { });
    await browser.close();

    console.log(`All done. Results written to: ${outputFile}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});