import fs from "node:fs";
import path from "node:path";
import { PromptRow } from "./types.js";

function parseCsvLine(line: string): string[] {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            // Handle escaped quotes ""
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (ch === "," && !inQuotes) {
            out.push(cur);
            cur = "";
            continue;
        }

        cur += ch;
    }

    out.push(cur);
    return out.map((s) => s.trim());
}

export function loadPromptsFromCsv(csvPath: string): PromptRow[] {
    const abs = path.resolve(csvPath);
    if (!fs.existsSync(abs)) throw new Error(`CSV not found: ${abs}`);

    const raw = fs.readFileSync(abs, "utf-8");
    const lines = raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    if (lines.length < 2) throw new Error("CSV must include header + at least one row.");

    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
    const idIdx = header.indexOf("id");
    const promptIdx = header.indexOf("prompt");

    if (idIdx === -1 || promptIdx === -1) {
        throw new Error(`CSV header must contain 'id' and 'prompt'. Got: ${lines[0]}`);
    }

    const rows: PromptRow[] = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        const id = cols[idIdx] ?? "";
        const prompt = cols[promptIdx] ?? "";
        if (!id || !prompt) continue;
        rows.push({ id, prompt });
    }

    return rows;
}