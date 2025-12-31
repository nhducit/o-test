import { test, expect } from '@playwright/test'
import { CampaignTablePage } from './page-objects/campaign-table.page'
import { StoryboardAndCopyPage } from '../storyboard-and-copy/page-objects/storyboard-and-copy.page'

test.describe('Campaign Lifecycle', () => {
  let campaignTablePage: CampaignTablePage
  let storyboardPage: StoryboardAndCopyPage
  let createdCampaignName: string
  let createdCampaignId: string

  test.beforeEach(async ({ page }) => {
    campaignTablePage = new CampaignTablePage(page)
  })

  test('should create campaign, generate storyboard & copy, and delete campaign', async ({
    page,
  }) => {
    // Step 1: Navigate to campaign table page
    await campaignTablePage.navigateToPage()

    // Step 2: Click "Launch a New Campaign" button to open modal
    const isLaunchButtonVisible =
      await campaignTablePage.isLaunchNewCampaignVisible()
    expect(isLaunchButtonVisible).toBe(true)

    await campaignTablePage.clickLaunchNewCampaign()
    await campaignTablePage.waitForLaunchCampaignModal()

    // Step 3: Click "click here" link to go to manual campaign creation
    await campaignTablePage.clickManualCreationLink()
    await campaignTablePage.waitForCreatePage()

    // Step 4: Verify "Generate Storyboard & Copy" button is disabled on create page
    // (Campaign hasn't been created yet, so button should be disabled)
    const isGenerateDisabledOnCreate =
      await campaignTablePage.isGenerateStoryboardEnabled()
    expect(isGenerateDisabledOnCreate).toBe(false)

    // Step 5: Fill campaign name with unique value
    createdCampaignName = campaignTablePage.generateUniqueCampaignName('duc')
    await campaignTablePage.fillCampaignName(createdCampaignName)

    // Step 6: Click Update Campaign Brief to create the campaign
    await expect(async () => {
      const isEnabled = await campaignTablePage.isUpdateCampaignBriefEnabled()
      expect(isEnabled).toBe(true)
    }).toPass({ timeout: 5000 })

    await campaignTablePage.clickUpdateCampaignBrief()

    // Step 7: Wait for navigation to campaign details page
    createdCampaignId = await campaignTablePage.waitForDetailsPage()
    expect(createdCampaignId).toBeTruthy()

    // Step 8: Wait for page to fully load and verify Generate Storyboard & Copy is now enabled
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Allow time for button state to update

    await expect(async () => {
      const isGenerateEnabled =
        await campaignTablePage.isGenerateStoryboardEnabled()
      expect(isGenerateEnabled).toBe(true)
    }).toPass({ timeout: 10000 })

    // Step 9: Click Generate Storyboard & Copy button
    await campaignTablePage.clickGenerateStoryboard()

    // Step 10: Verify button shows loading state
    await expect(async () => {
      const isLoading = await campaignTablePage.isGenerateStoryboardLoading()
      expect(isLoading).toBe(true)
    }).toPass({ timeout: 5000 })

    // Step 11: Wait for Storyboard & Copy tab to appear with spinning icon
    await campaignTablePage.waitForStoryboardTab(10000)

    // Step 12: Verify the tab is visible with spinning icon and is disabled
    const isTabVisible = await campaignTablePage.isStoryboardTabVisible()
    expect(isTabVisible).toBe(true)

    const isSpinning = await campaignTablePage.isStoryboardTabSpinning()
    expect(isSpinning).toBe(true)

    const isTabDisabled = await campaignTablePage.isStoryboardTabDisabled()
    expect(isTabDisabled).toBe(true)

    // Step 13: Wait for tab to become enabled (generation complete, may take up to 60 seconds)
    await campaignTablePage.waitForStoryboardTabEnabled(60000)

    // Step 14: Verify spinning icon is gone and tab is clickable
    const isStillSpinning = await campaignTablePage.isStoryboardTabSpinning()
    expect(isStillSpinning).toBe(false)

    const isTabEnabled = await campaignTablePage.isStoryboardTabEnabled()
    expect(isTabEnabled).toBe(true)

    // Step 15: Click on Storyboard & Copy tab and verify content
    await campaignTablePage.clickStoryboardTab()
    await page.waitForLoadState('networkidle')

    // Initialize StoryboardAndCopyPage with the created campaign ID
    storyboardPage = new StoryboardAndCopyPage(page, createdCampaignId)

    // Step 16: Verify all sections are visible
    await storyboardPage.verifySectionsVisible()
    await storyboardPage.verifyButtonsVisible()

    // Step 17: Verify Save button is disabled initially (no changes made)
    const isSaveDisabled = await storyboardPage.isSaveButtonDisabled()
    expect(isSaveDisabled).toBe(true)

    // Step 18: Test editing headline and verify Save button becomes enabled
    const testHeadline = `E2E Test Headline ${Date.now()}`
    await storyboardPage.fillDefaultHeadline(testHeadline)

    const isSaveEnabled = await storyboardPage.isSaveButtonEnabled()
    expect(isSaveEnabled).toBe(true)

    // Step 19: Save the changes
    await storyboardPage.clickSaveAndWait()

    // Step 20: Verify Save button is disabled after save
    await expect(async () => {
      const isDisabled = await storyboardPage.isSaveButtonDisabled()
      expect(isDisabled).toBe(true)
    }).toPass({ timeout: 10000 })

    // Step 21: Test preview orientation
    const isPortrait = await storyboardPage.isPortraitSelected()
    expect(isPortrait).toBe(true)

    await storyboardPage.selectLandscapePreview()
    const isLandscape = await storyboardPage.isLandscapeSelected()
    expect(isLandscape).toBe(true)

    // Step 22: Test Generate Preview button (without waiting for completion)
    // Check if Generate button is visible (no previews yet)
    const isGenerateVisible = await storyboardPage.isGenerateButtonVisible()
    expect(isGenerateVisible).toBe(true)

    // Click Generate to start preview generation
    await storyboardPage.clickGenerate()

    // Verify button shows loading state
    await expect(async () => {
      const isLoading = await storyboardPage.isGenerateLoading()
      expect(isLoading).toBe(true)
    }).toPass({ timeout: 5000 })

    // Note: Skipping wait for preview generation completion and "Generate Again" test
    // as preview generation takes longer than test timeout allows.
    // The Regenerate Preview modal can be tested in a separate dedicated test with longer timeout.

    // Step 23: Navigate back to campaign table
    await campaignTablePage.navigateBackToTable()

    // Step 24: Search for the created campaign
    await campaignTablePage.searchCampaign(createdCampaignName)

    // Step 25: Select the campaign row
    await campaignTablePage.selectCampaignRow(createdCampaignName)

    // Step 26: Click "Delete Selected Campaigns" button
    await campaignTablePage.clickDeleteSelectedCampaigns()

    // Step 27: Wait for and confirm delete modal
    await campaignTablePage.waitForDeleteConfirmModal()
    await campaignTablePage.confirmDelete()

    // Step 28: Wait for delete success
    await campaignTablePage.waitForDeleteSuccess()

    // Step 29: Verify campaign is no longer in the table
    const isDeleted = await campaignTablePage.verifyCampaignDeleted(
      createdCampaignName
    )
    expect(isDeleted).toBe(true)
  })
})
