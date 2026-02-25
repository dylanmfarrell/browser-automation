export type ChatSelectorsConfig = {
    url: string;
    chatInput: string;
    sendButton?: string;
    assistantMessage: string;
    thinking?: string;
    newChat?: string;
};

export function loadConfig(): ChatSelectorsConfig {
    const url = process.env.CHATBOT_URL;
    if (!url) throw new Error("Missing CHATBOT_URL");

    const chatInput = process.env.CHAT_INPUT_SELECTOR;
    const assistantMessage = process.env.ASSISTANT_MESSAGE_SELECTOR;

    if (!chatInput) throw new Error("Missing CHAT_INPUT_SELECTOR");
    if (!assistantMessage) throw new Error("Missing ASSISTANT_MESSAGE_SELECTOR");

    return {
        url,
        chatInput,
        sendButton: process.env.SEND_BUTTON_SELECTOR || undefined,
        assistantMessage,
        thinking: process.env.THINKING_SELECTOR || undefined,
        newChat: process.env.NEW_CHAT_SELECTOR || undefined
    };
}