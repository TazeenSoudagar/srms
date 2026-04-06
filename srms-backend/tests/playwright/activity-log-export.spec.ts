import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Activity Log Excel Export', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:8000/admin/login');

    // Login as admin (using seeded credentials)
    await page.fill('input[type="email"]', 'admin@gmail.com');
    await page.fill('input[type="password"]', 'test1234');
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL(/\/admin/);
  });

  test('should export activity logs to Excel', async ({ page }) => {
    // Navigate to Activity Logs page
    await page.goto('http://localhost:8000/admin/activity-log/activity-logs');

    // Wait for the page to load
    await page.waitForSelector('text=Activity Logs');

    // Take a screenshot before export
    await page.screenshot({ path: 'tests/screenshots/before-export.png' });

    // Click the Export button
    const exportButton = page.locator('button:has-text("Export")').first();
    await expect(exportButton).toBeVisible();
    await exportButton.click();

    // Wait for export modal or action to appear
    await page.waitForTimeout(1000);

    // Take a screenshot of export dialog
    await page.screenshot({ path: 'tests/screenshots/export-dialog.png' });

    // Set up download listener before triggering export
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

    // Click the final export/download button
    const confirmButton = page.locator('button:has-text("Export"), button:has-text("Download")').last();
    await confirmButton.click();

    // Wait for download to start
    const download = await downloadPromise;

    // Verify filename contains 'activity-logs' and has .xlsx extension
    const filename = download.suggestedFilename();
    console.log('Downloaded file:', filename);
    expect(filename).toContain('activity-logs');
    expect(filename).toMatch(/\.xlsx$/);

    // Save the downloaded file
    const downloadPath = path.join('tests/downloads', filename);
    await download.saveAs(downloadPath);

    // Verify file exists and has content
    expect(fs.existsSync(downloadPath)).toBeTruthy();
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);

    console.log(`✓ Export successful: ${filename} (${stats.size} bytes)`);
  });

  test('should show export button on activity logs table', async ({ page }) => {
    await page.goto('http://localhost:8000/admin/activity-log/activity-logs');

    // Verify export button exists
    const exportButton = page.locator('button:has-text("Export")');
    await expect(exportButton).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/activity-logs-page.png', fullPage: true });
  });

  test('should handle export with filters applied', async ({ page }) => {
    await page.goto('http://localhost:8000/admin/activity-log/activity-logs');

    // Apply a filter (e.g., filter by action type)
    const filterButton = page.locator('button:has-text("Filter")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Select a specific action filter
      const actionFilter = page.locator('select[name="action"]').first();
      if (await actionFilter.isVisible()) {
        await actionFilter.selectOption('created');
        await page.click('button:has-text("Apply")');
        await page.waitForTimeout(1000);
      }
    }

    // Export with filters
    const exportButton = page.locator('button:has-text("Export")').first();
    await exportButton.click();

    await page.waitForTimeout(1000);

    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

    // Trigger export
    const confirmButton = page.locator('button:has-text("Export"), button:has-text("Download")').last();
    await confirmButton.click();

    // Verify download
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/activity-logs.*\.xlsx$/);

    console.log(`✓ Filtered export successful: ${filename}`);
  });
});
