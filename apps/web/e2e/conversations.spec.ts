// e2e/conversations.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Conversation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the conversations page before each test
    await page.goto("/conversations");
    // Ensure the page is loaded
    await expect(page.locator("h1", { hasText: "Conversations" })).toBeVisible();
  });

  test("should allow creating a conversation and sending a message", async ({ page }) => {
    const conversationName = `E2E Test Conversation ${Date.now()}`;
    const userMessage = "Hello, this is an E2E test message.";

    // --- Create Conversation --- //

    // 1. Click the "Create Conversation" button (adjust selector if needed)
    // Assuming there's a button specifically for creating conversations
    await page.getByRole("button", { name: /New Conversation/i }).click();

    // 2. Fill the form (if there's a modal/form for naming)
    // This might happen directly on the page or in a modal.
    // Assuming a simple input appears or is focused.
    // If it's a modal, wait for it:
    // await expect(page.locator("#conversation-create-modal")).toBeVisible();
    // await page.getByLabel(/Conversation Name/i).fill(conversationName);
    // await page.getByRole("button", { name: /Create/i }).click();

    // **Alternative:** If clicking "New Conversation" immediately creates and selects it:
    // We need to verify the new conversation is selected in the list.
    // Let's assume it creates one with a default name first, then we select it.
    // Or, maybe clicking the button *is* the creation step.
    // For this example, let's assume clicking "New Conversation" creates and selects it.
    // We need a way to identify the newly created conversation in the list.
    // Let's assume it gets a default name like "New Conversation" or similar, and is highlighted.

    // Wait for the new conversation to appear and be selected (adjust selector)
    const newConversationItem = page.locator(".conversation-list-item.selected", { hasText: /New Conversation|Conversation \d+/i });
    await expect(newConversationItem).toBeVisible();

    // --- Send Message --- //

    // 3. Ensure the conversation view is active for the new conversation
    // Check for the message input area
    const messageInput = page.getByPlaceholderText(/Type your message.../i);
    await expect(messageInput).toBeVisible();

    // 4. Type the message
    await messageInput.fill(userMessage);

    // 5. Click the Send button
    await page.getByRole("button", { name: /Send/i }).click();

    // --- Verify --- //

    // 6. Verify the user message appears in the chat history
    // Use a locator that targets the message display area
    const chatArea = page.locator(".chat-messages-area"); // Adjust selector
    await expect(chatArea.getByText(userMessage)).toBeVisible();

    // 7. Verify the assistant's response appears
    // This requires waiting as the backend processes the message.
    // The response content will vary. We can check for *any* assistant message after the user's.
    // Use a selector specific to assistant messages.
    const assistantMessage = chatArea.locator(".message.assistant"); // Adjust selector
    // Wait for at least one assistant message to appear after the user message
    await expect(assistantMessage).toHaveCount(1, { timeout: 15000 }); // Wait up to 15s
    // Optionally check parts of the content if predictable
    // await expect(assistantMessage.first()).toContainText("Response snippet");
  });

  // Add more tests for conversation management:
  // - Deleting a conversation
  // - Renaming a conversation (if functionality exists)
  // - Scrolling through message history
});

