import { Page, Locator, expect } from '@playwright/test'
import { app } from '../../../../config'

export class CampaignTablePage {
  readonly page: Page

  // Button locators
  private readonly launchNewCampaignButton: Locator
  private readonly generateStoryboardButton: Locator

  // Modal locators
  private readonly launchCampaignModal: Locator
  private readonly clickHereLink: Locator

  // Table locators
  private readonly campaignTable: Locator
  private readonly searchInput: Locator

  constructor(page: Page) {
    this.page = page

    // Launch New Campaign button
    this.launchNewCampaignButton = page.getByRole('button', {
      name: 'Launch a New Campaign',
    })

    // Generate Storyboard & Copy button (on details page)
    this.generateStoryboardButton = page.getByRole('button', {
      name: /Generate Storyboard & Copy/,
    })

    // Launch Campaign Modal
    this.launchCampaignModal = page.getByRole('dialog', {
      name: 'Launch a New Campaign',
    })
    this.clickHereLink = page.getByRole('link', { name: 'click here' })

    // Table - Ant Design uses role="grid" for tables
    this.campaignTable = page.getByRole('grid')
    this.searchInput = page.locator('input[placeholder*="Search"]').first()
  }

  /**
   * Navigate to the campaigns table page
   */
  async navigateToPage(): Promise<void> {
    await this.page.goto(`${app.hqAdmin}/campaigns`)
    await this.page.waitForLoadState('networkidle')
    await expect(this.campaignTable).toBeVisible({ timeout: 30000 })
  }

  /**
   * Click the "Launch a New Campaign" button
   */
  async clickLaunchNewCampaign(): Promise<void> {
    await this.launchNewCampaignButton.click()
  }

  /**
   * Check if Launch New Campaign button is visible
   */
  async isLaunchNewCampaignVisible(): Promise<boolean> {
    return await this.launchNewCampaignButton.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Wait for the Launch Campaign modal to appear
   */
  async waitForLaunchCampaignModal(): Promise<void> {
    await expect(this.launchCampaignModal).toBeVisible({ timeout: 10000 })
  }

  /**
   * Click the "click here" link in the modal to go to manual campaign creation
   */
  async clickManualCreationLink(): Promise<void> {
    await this.clickHereLink.click()
  }

  /**
   * Wait for navigation to campaign create page
   */
  async waitForCreatePage(): Promise<void> {
    await this.page.waitForURL(/\/campaigns\/details\/create/, { timeout: 10000 })
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Fill the campaign name field
   */
  async fillCampaignName(name: string): Promise<void> {
    const nameInput = this.page.locator(
      '.ant-form-item:has-text("Campaign Name") input'
    )
    await nameInput.fill(name)
    await nameInput.blur()
  }

  /**
   * Get the campaign name field value
   */
  async getCampaignName(): Promise<string> {
    const nameInput = this.page.locator(
      '.ant-form-item:has-text("Campaign Name") input'
    )
    return (await nameInput.inputValue()) || ''
  }

  /**
   * Click the Update Campaign Brief button
   */
  async clickUpdateCampaignBrief(): Promise<void> {
    const saveButton = this.page.getByRole('button', {
      name: 'Update Campaign Brief',
    })
    await saveButton.click()
  }

  /**
   * Check if Update Campaign Brief button is enabled
   */
  async isUpdateCampaignBriefEnabled(): Promise<boolean> {
    const saveButton = this.page.getByRole('button', {
      name: 'Update Campaign Brief',
    })
    return await saveButton.isEnabled()
  }

  /**
   * Wait for navigation to campaign details page after creation
   */
  async waitForDetailsPage(): Promise<string> {
    await this.page.waitForURL(/\/campaigns\/details\/\d+\/campaign-details/, {
      timeout: 30000,
    })
    // Extract campaign ID from URL
    const url = this.page.url()
    const match = url.match(/\/campaigns\/details\/(\d+)\//)
    return match ? match[1] : ''
  }

  /**
   * Check if Generate Storyboard & Copy button is visible
   */
  async isGenerateStoryboardVisible(): Promise<boolean> {
    return await this.generateStoryboardButton.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Check if Generate Storyboard & Copy button is enabled
   */
  async isGenerateStoryboardEnabled(): Promise<boolean> {
    return await this.generateStoryboardButton.isEnabled()
  }

  /**
   * Check if Generate Storyboard & Copy button is loading
   */
  async isGenerateStoryboardLoading(): Promise<boolean> {
    const button = this.page.getByRole('button', {
      name: /Generating Storyboard & Copy/,
    })
    return await button.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Click the Generate Storyboard & Copy button
   */
  async clickGenerateStoryboard(): Promise<void> {
    await this.generateStoryboardButton.click()
  }

  /**
   * Wait for Storyboard & Copy tab to appear
   */
  async waitForStoryboardTab(timeout: number = 60000): Promise<void> {
    const storyboardTab = this.page.getByRole('tab', {
      name: /Storyboard & Copy/,
    })
    await expect(storyboardTab).toBeVisible({ timeout })
  }

  /**
   * Check if Storyboard & Copy tab is visible
   */
  async isStoryboardTabVisible(): Promise<boolean> {
    const storyboardTab = this.page.getByRole('tab', {
      name: /Storyboard & Copy/,
    })
    return await storyboardTab.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Click on Storyboard & Copy tab
   */
  async clickStoryboardTab(): Promise<void> {
    const storyboardTab = this.page.getByRole('tab', {
      name: /Storyboard & Copy/,
    })
    await storyboardTab.click()
  }

  /**
   * Navigate back to campaign table
   */
  async navigateBackToTable(): Promise<void> {
    await this.page.goto(`${app.hqAdmin}/campaigns`)
    await this.page.waitForLoadState('networkidle')
    await expect(this.campaignTable).toBeVisible({ timeout: 30000 })
  }

  /**
   * Search for a campaign by name
   */
  async searchCampaign(name: string): Promise<void> {
    // Find the search textbox in the Name column header
    const nameColumnHeader = this.page.getByRole('columnheader', { name: 'Name' })
    const searchInput = nameColumnHeader.getByRole('textbox')
    await searchInput.fill(name)

    // Press Enter to trigger search
    await searchInput.press('Enter')

    // Wait for table to update
    await this.page.waitForTimeout(1000)
  }

  /**
   * Find a campaign row by name
   */
  async findCampaignRow(name: string): Promise<Locator> {
    // Find the row containing the campaign name in a gridcell
    return this.page.getByRole('row').filter({ hasText: name }).first()
  }

  /**
   * Select a campaign row by clicking the expand/checkbox button
   */
  async selectCampaignRow(campaignName: string): Promise<void> {
    const row = await this.findCampaignRow(campaignName)
    // Click the first button in the row (expand/select button)
    const selectButton = row.getByRole('button').first()
    await selectButton.click()
    // Wait for selection to register
    await this.page.waitForTimeout(500)
  }

  /**
   * Click the "Delete Selected Campaigns" button in the toolbar
   */
  async clickDeleteSelectedCampaigns(): Promise<void> {
    const deleteButton = this.page.getByRole('button', {
      name: 'Delete Selected Campaigns',
    })
    await deleteButton.click()
  }

  /**
   * Wait for delete confirmation modal
   */
  async waitForDeleteConfirmModal(): Promise<void> {
    await expect(
      this.page.getByText('You are about to delete the campaign')
    ).toBeVisible({ timeout: 10000 })
  }

  /**
   * Confirm delete in the modal
   */
  async confirmDelete(): Promise<void> {
    const confirmButton = this.page.getByRole('button', {
      name: 'Delete',
      exact: true,
    })
    await confirmButton.click()
  }

  /**
   * Wait for delete success message
   */
  async waitForDeleteSuccess(): Promise<void> {
    await expect(
      this.page.getByText(/Campaign.* deleted|Deleted successfully/i)
    ).toBeVisible({ timeout: 10000 })
  }

  /**
   * Verify campaign is deleted (not in the table)
   */
  async verifyCampaignDeleted(name: string): Promise<boolean> {
    await this.page.waitForTimeout(1000) // Wait for table to refresh
    const row = this.page.getByRole('row').filter({ hasText: name })
    const count = await row.count()
    return count === 0
  }

  /**
   * Generate a unique campaign name
   */
  generateUniqueCampaignName(prefix: string = 'duc'): string {
    const uuid = crypto.randomUUID().substring(0, 8)
    return `${prefix} - ${uuid}`
  }
}
