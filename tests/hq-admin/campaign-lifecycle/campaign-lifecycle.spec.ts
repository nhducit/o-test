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

    // Step 11: Wait for Storyboard & Copy tab to appear (may take up to 60 seconds)
    await campaignTablePage.waitForStoryboardTab(60000)

    // Step 12: Verify the tab is visible
    const isTabVisible = await campaignTablePage.isStoryboardTabVisible()
    expect(isTabVisible).toBe(true)

    // Step 13: Click on Storyboard & Copy tab and verify content
    await campaignTablePage.clickStoryboardTab()
    await page.waitForLoadState('networkidle')

    // Initialize StoryboardAndCopyPage with the created campaign ID
    storyboardPage = new StoryboardAndCopyPage(page, createdCampaignId)

    // Step 14: Verify all sections are visible
    await storyboardPage.verifySectionsVisible()
    await storyboardPage.verifyButtonsVisible()

    // Step 15: Verify Save button is disabled initially (no changes made)
    const isSaveDisabled = await storyboardPage.isSaveButtonDisabled()
    expect(isSaveDisabled).toBe(true)

    // Step 16: Test editing headline and verify Save button becomes enabled
    const testHeadline = `E2E Test Headline ${Date.now()}`
    await storyboardPage.fillDefaultHeadline(testHeadline)

    const isSaveEnabled = await storyboardPage.isSaveButtonEnabled()
    expect(isSaveEnabled).toBe(true)

    // Step 17: Save the changes
    await storyboardPage.clickSaveAndWait()

    // Step 18: Verify Save button is disabled after save
    await expect(async () => {
      const isDisabled = await storyboardPage.isSaveButtonDisabled()
      expect(isDisabled).toBe(true)
    }).toPass({ timeout: 10000 })

    // Step 19: Test preview orientation
    const isPortrait = await storyboardPage.isPortraitSelected()
    expect(isPortrait).toBe(true)

    await storyboardPage.selectLandscapePreview()
    const isLandscape = await storyboardPage.isLandscapeSelected()
    expect(isLandscape).toBe(true)

    // Step 20: Test Regenerate Preview modal
    await storyboardPage.clickGenerateAgain()
    await storyboardPage.waitForRegenerateModal()
    const isRegenerateModalVisible = await storyboardPage.isRegenerateModalVisible()
    expect(isRegenerateModalVisible).toBe(true)
    await storyboardPage.clickRegenerateModalCancel()

    // Step 21: Test Campaign Style Settings modal
    await storyboardPage.clickConfigureStyles()
    await storyboardPage.waitForStyleModal()
    const isStyleModalVisible = await storyboardPage.isStyleModalVisible()
    expect(isStyleModalVisible).toBe(true)

    // Verify all style sections are present
    const styleSections = [
      'headline',
      'sub-headline',
      'body-copy',
      'cta-copy',
      'legal-copy',
    ] as const
    for (const section of styleSections) {
      const isSectionVisible = await storyboardPage.isStyleSectionVisible(section)
      expect(isSectionVisible).toBe(true)
    }

    await storyboardPage.clickStyleModalCancel()

    // Step 22: Navigate back to campaign table
    await campaignTablePage.navigateBackToTable()

    // Step 23: Search for the created campaign
    await campaignTablePage.searchCampaign(createdCampaignName)

    // Step 24: Select the campaign row
    await campaignTablePage.selectCampaignRow(createdCampaignName)

    // Step 25: Click "Delete Selected Campaigns" button
    await campaignTablePage.clickDeleteSelectedCampaigns()

    // Step 26: Wait for and confirm delete modal
    await campaignTablePage.waitForDeleteConfirmModal()
    await campaignTablePage.confirmDelete()

    // Step 27: Wait for delete success
    await campaignTablePage.waitForDeleteSuccess()

    // Step 28: Verify campaign is no longer in the table
    const isDeleted = await campaignTablePage.verifyCampaignDeleted(
      createdCampaignName
    )
    expect(isDeleted).toBe(true)
  })
})
