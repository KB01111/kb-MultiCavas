// e2e/teams.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Team Management", () => {
  // Assume an agent exists for selection. We might need a setup step
  // or rely on an agent created in a previous test/manual setup.
  // For isolated tests, ideally, we'd create an agent via API before this test runs.
  const existingAgentName = "E2E Test Agent"; // Needs to match an agent created previously or mocked

  test.beforeEach(async ({ page }) => {
    // Navigate to the teams page before each test
    await page.goto("/teams");
    // Ensure the page is loaded
    await expect(page.locator("h1", { hasText: "Teams" })).toBeVisible();
  });

  test("should allow creating a new team", async ({ page }) => {
    const teamName = `E2E Test Team ${Date.now()}`;
    const teamDescription = "This team was created during an E2E test.";

    // 1. Click the "Create Team" button
    await page.getByRole("button", { name: /Create Team/i }).click();

    // 2. Fill the form
    await page.getByLabel(/Team Name/i).fill(teamName);
    await page.getByLabel(/Description/i).fill(teamDescription);

    // 3. Select an agent
    // This depends heavily on the multi-select component implementation.
    // Example: Assuming it's a dropdown or list where you can click the agent name.
    // First, ensure the agent list within the form is loaded.
    // Use a specific locator for the agent selection area if possible.
    const agentSelector = page.locator(".agent-select-container"); // Adjust selector
    await expect(agentSelector.getByText(existingAgentName)).toBeVisible();
    await agentSelector.getByText(existingAgentName).click();

    // 4. Submit the form
    await page.getByRole("button", { name: /Create Team/i }).last().click();

    // 5. Verify the team appears in the list
    await expect(page.locator("h3", { hasText: teamName })).toBeVisible();
    await expect(page.getByText(teamDescription)).toBeVisible();
    // Verify agent count if displayed
    await expect(page.locator(`//div[contains(@class, 'team-card') and .//h3[text()='${teamName}']]//span[contains(text(), '1 Agent')]`)).toBeVisible(); // Example XPath
  });

  // Add more tests for team management:
  // - Editing a team
  // - Deleting a team
  // - Adding/removing agents from a team
});

