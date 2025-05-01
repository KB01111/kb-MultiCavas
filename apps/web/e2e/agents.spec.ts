// e2e/agents.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Agent Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the agents page before each test in this describe block
    await page.goto("/"); // Assuming base URL goes to agents page or has link
    // If not default, navigate explicitly: await page.goto("/agents");
    // Ensure the page is loaded (e.g., wait for the heading)
    await expect(page.locator("h1", { hasText: "Agents" })).toBeVisible();
  });

  test("should allow creating a new agent", async ({ page }) => {
    const agentName = `E2E Test Agent ${Date.now()}`;
    const agentDescription = "This agent was created during an E2E test.";
    const agentPrompt = "You are an E2E test agent.";
    const agentConfig = JSON.stringify({ model: "gpt-e2e-test" });

    // 1. Click the "Create Agent" button
    await page.getByRole("button", { name: /Create Agent/i }).click();

    // 2. Fill the form (wait for modal/form to appear if necessary)
    // Use locators that are robust (e.g., getByLabel)
    await page.getByLabel(/Agent Name/i).fill(agentName);
    await page.getByLabel(/Description/i).fill(agentDescription);
    await page.getByLabel(/System Prompt/i).fill(agentPrompt);
    await page.getByLabel(/Model Config \(JSON\)/i).fill(agentConfig);

    // 3. Submit the form
    // Assuming the submit button is within the same form/modal
    await page.getByRole("button", { name: /Create Agent/i }).last().click(); // Use last() if there are multiple buttons with same name

    // 4. Verify the agent appears in the list
    // Wait for the list to potentially update
    // Look for the new agent's name and description
    await expect(page.locator("h3", { hasText: agentName })).toBeVisible();
    await expect(page.getByText(agentDescription)).toBeVisible();

    // Optional: Verify other details if displayed
  });

  // Add more tests for agent management:
  // - Editing an agent (if functionality exists)
  // - Deleting an agent (if functionality exists)
  // - Viewing agent details (if there's a detail view)
});

