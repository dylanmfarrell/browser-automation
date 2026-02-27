import { Page } from "playwright";
import { selectors } from "./selectors.js";

export class ChatbotClient {
    constructor(private page: Page) { }

    async goto(url: string) {
        await this.page.goto(url, { waitUntil: "load", timeout: 0 });
    }

    async sendPromptAndGetResponse(prompt: string): Promise<string> {
        // Focus input
        const input = this.page.locator(selectors.promptInput).first();
        await input.waitFor({ state: "visible" });
        await input.click();
        await input.fill(prompt);

        // Try clicking send if it exists; else press Enter
        const sendBtn = this.page.locator(selectors.sendButton);
        if (await sendBtn.count()) {
            await sendBtn.first().click();
        } else {
            await input.press("Enter");
        }

        // Wait for an assistant message to appear and then stabilize
        const response = await this.waitForLatestAssistantMessageStable();
        return response;
    }

    private async waitForLatestAssistantMessageStable(): Promise<string> {
        const msgs = this.page.locator(selectors.assistantMessage);

        // Wait for at least one assistant message
        await msgs.first().waitFor({ state: "visible", timeout: 0 });

        // Get the last message text and wait until it stops changing
        const last = msgs.last();

        // Optionally wait for thinking indicator to disappear, if present
        const thinking = this.page.locator(selectors.thinkingIndicator);
        if (await thinking.count()) {
            // don't hard-fail if it never appears/disappears; best-effort
            await thinking.first().waitFor({ state: "hidden", timeout: 0 }).catch(() => { });
        }

        let prev = "";
        let stableTicks = 0;

        const maxMinutes = 30;
        const start = Date.now();

        while (true) {
            if ((Date.now() - start) > maxMinutes * 60_000) break;

            const text = (await last.innerText().catch(() => "")).trim();

            if (text && text === prev) {
                stableTicks++;
            } else {
                stableTicks = 0;
                prev = text;
            }

            // Consider stable after ~1.5s of no change (3 ticks * 500ms)
            if (stableTicks >= 3) return prev;

            await this.page.waitForTimeout(500);
        }

        // If we didn’t stabilize, return best-effort
        return prev.trim();
    }
}