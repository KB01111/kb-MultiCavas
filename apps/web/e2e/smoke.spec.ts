// e2e/smoke.spec.ts
import { test, expect } from "@playwright/test";

test("homepage has expected title and loads agents page", async ({ page }) => {
  // Navigate to the base URL (should default to localhost:3000)
  await page.goto("/");

  // Expect a title "AI Agent Canvas" (adjust if the title is different).
  await expect(page).toHaveTitle(/AI Agent Canvas/);

  // The default page might redirect or load the agents page initially.
  // Check for an element specific to the agents page.
  // Use a robust selector, e.g., a heading or a data-testid.
  const agentPageHeading = page.locator("h1", { hasText: "Agents" });
  await expect(agentPageHeading).toBeVisible();

  // Check if the agent list area is present (even if loading or empty initially)
  // This assumes the AgentList component renders a specific structure.
  // Let's look for the "Create Agent" button as an indicator.
  const createAgentButton = page.getByRole("button", { name: /Create Agent/i });
  await expect(createAgentButton).toBeVisible();
});

