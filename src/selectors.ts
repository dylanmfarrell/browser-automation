export const selectors = {
    // The chat input element (textarea or input)
    promptInput: 'textarea[placeholder*="Message"], textarea, input[type="text"]',

    // The send button (or use Enter key if no button)
    sendButton: 'button:has-text("Send"), button[aria-label*="Send"]',

    // A locator that represents the latest assistant message container.
    // You MUST adjust this to match your chatbot’s structure.
    assistantMessage: '[data-role="assistant-message"], .assistant-message, .message.assistant',

    // Optional: a "thinking" indicator you can wait to disappear
    thinkingIndicator: '[data-testid="thinking"], .typing-indicator, .spinner'
} as const;