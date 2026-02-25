import { Page } from "playwright";

export abstract class BaseChatAdapter {
    constructor(protected page: Page) { }

    abstract goto(url: string): Promise<void>;
    abstract startNewChatIfConfigured(): Promise<void>;
    abstract sendPromptAndGetResponse(prompt: string): Promise<string>;
}