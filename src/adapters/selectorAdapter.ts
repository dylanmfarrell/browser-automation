import { Page } from "playwright";
import { BaseChatAdapter } from "./baseAdapter.js";
import { ChatSelectorsConfig } from "../config.js";

export class SelectorChatAdapter extends BaseChatAdapter {
    constructor(page: Page, private cfg: ChatSelectorsConfig) {
        super(page);
    }

    async goto(url: string) {
        await this.page.goto(url, { waitUntil: "load", timeout: 0 });
    }

    async startNewChatIfConfigured(): Promise<void> {
        if (!this.cfg.newChat) return;
        const btn = this.page.locator(this.cfg.newChat).first();
        if (await btn.count()) {
            await btn.click();
        }
    }

    async sendPromptAndGetResponse(prompt: string): Promise<string> {
        const input = this.page.locator(this.cfg.chatInput).first();
        await input.waitFor({ state: "visible" });
        await input.click();
        await input.fill(prompt);

        if (this.cfg.sendButton) {
            const send = this.page.locator(this.cfg.sendButton).first();
            await send.waitFor({ state: "visible" });
            await send.click();
        } else {
            await input.press("Enter");
        }

        return await this.waitForLatestAssistantMessageStable();
    }

    private async waitForLatestAssistantMessageStable(): Promise<string> {
        const msgs = this.page.locator(this.cfg.assistantMessage);

        // Wait until at least one assistant message exists
        await msgs.first().waitFor({ state: "visible", timeout: 0 });
        const last = msgs.last();

        // Best-effort “thinking” indicator handling
        if (this.cfg.thinking) {
            const thinking = this.page.locator(this.cfg.thinking).first();
            await thinking.waitFor({ state: "hidden", timeout: 0 }).catch(() => { });
        }

        // Stabilization loop (text stops changing)
        let prev = "";
        let stableTicks = 0;

        for (let i = 0; i < 80; i++) {
            const text = (await last.innerText().catch(() => "")).trim();

            if (text && text === prev) stableTicks++;
            else {
                prev = text;
                stableTicks = 0;
            }

            if (stableTicks >= 3) return prev;
            await this.page.waitForTimeout(500);
        }

        return prev.trim();
    }
}