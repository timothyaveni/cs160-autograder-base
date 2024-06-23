import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/part1/index.html");
});

test(
  "The page has the correct title",
  {
    annotation: {
      type: "points",
      description: "1",
    },
  },
  async ({ page }) => {
    expect(await page.title()).toBe("Programming assignment");
  }
);
