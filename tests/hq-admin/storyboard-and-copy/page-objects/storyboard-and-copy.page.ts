import { Page, Locator, expect } from '@playwright/test'
import { app } from '../../../../config'

export class StoryboardAndCopyPage {
  readonly page: Page
  private readonly campaignId: string

  // Tab locator
  private readonly storyboardTab: Locator

  // Section locators using data-testid
  private readonly headlineSection: Locator
  private readonly subHeadlineSection: Locator
  private readonly bodyCopySection: Locator
  private readonly ctaCopySection: Locator
  private readonly legalCopySection: Locator
  private readonly assetSection: Locator

  // Form field locators
  private readonly defaultHeadlineInput: Locator
  private readonly defaultSubHeadlineInput: Locator
  private readonly defaultBodyTextarea: Locator
  private readonly defaultCtaInput: Locator
  private readonly legalCopyTextarea: Locator

  // Button locators using data-testid
  private readonly saveButton: Locator
  private readonly cancelButton: Locator

  // Form locator
  private readonly storyboardForm: Locator

  constructor(page: Page, campaignId: string = '7482') {
    this.page = page
    this.campaignId = campaignId

    // Tab locator for "Storyboard & Copy"
    this.storyboardTab = page.getByRole('tab', { name: 'Storyboard & Copy' })

    // Initialize section locators using data-testid
    this.headlineSection = page.getByTestId('headline-section')
    this.subHeadlineSection = page.getByTestId('sub-headline-section')
    this.bodyCopySection = page.getByTestId('body-copy-section')
    this.ctaCopySection = page.getByTestId('cta-copy-section')
    this.legalCopySection = page.getByTestId('legal-copy-section')
    this.assetSection = page.getByTestId('asset-section')

    // Form field locators - targeting inputs by their labels
    this.defaultHeadlineInput = page.locator(
      '.ant-form-item:has-text("Default Headline") input'
    )
    this.defaultSubHeadlineInput = page.locator(
      '.ant-form-item:has-text("Default Sub Headline") input'
    )
    this.defaultBodyTextarea = page.locator(
      '.ant-form-item:has-text("Default Body Copy") textarea'
    )
    this.defaultCtaInput = page.locator(
      '.ant-form-item:has-text("Default CTA Copy") input'
    )
    this.legalCopyTextarea = page.locator(
      '.ant-form-item:has-text("Legal Copy") textarea'
    )

    // Button locators using data-testid
    this.saveButton = page.getByTestId('storyboard-save-btn')
    this.cancelButton = page.getByTestId('storyboard-cancel-btn')

    // Form locator
    this.storyboardForm = page.getByTestId('storyboard-form')
  }

  /**
   * Navigate to the campaign details page and wait for it to load
   */
  async navigateToCampaignPage(): Promise<void> {
    // Navigate to campaign details page
    await this.page.goto(
      `${app.hqAdmin}/campaigns/details/${this.campaignId}/campaign-details`
    )

    // Wait for page to load
    await this.page.waitForLoadState('networkidle')

    // Wait for tabs to be visible
    await this.page.waitForSelector('.ant-tabs', { timeout: 30000 })
  }

  /**
   * Navigate to the campaign details page first, then click the Storyboard & Copy tab
   * Returns true if navigation was successful, false if tab is not available
   */
  async navigateToPage(): Promise<boolean> {
    await this.navigateToCampaignPage()

    // Check if we're on the campaign details page (not create page)
    // by verifying the URL doesn't contain 'create'
    const currentUrl = this.page.url()
    if (currentUrl.includes('/create')) {
      console.error('Campaign does not exist - redirected to create page')
      return false
    }

    // Check if Storyboard & Copy tab exists
    const tabExists = await this.storyboardTab.isVisible().catch(() => {
      return false
    })

    if (!tabExists) {
      return false
    }

    // Wait for the Storyboard & Copy tab to become enabled
    // The tab is disabled when storyboard data hasn't been generated yet
    // Use a shorter timeout since if the tab will be enabled, it should already be enabled
    try {
      await expect(this.storyboardTab).toBeEnabled({ timeout: 10000 })
    } catch {
      console.error('Storyboard & Copy tab is disabled - storyboard data may not be generated')
      return false
    }

    // Click on the Storyboard & Copy tab
    await this.storyboardTab.click()

    // Wait for the form to load
    await this.waitForPageLoad()
    return true
  }

  /**
   * Wait for the page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    // Wait for the storyboard form to be visible
    await expect(this.storyboardForm).toBeVisible({ timeout: 30000 })
  }

  /**
   * Check if Storyboard & Copy tab is available
   */
  async isStoryboardTabAvailable(): Promise<boolean> {
    return await this.storyboardTab.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Fill the default headline field
   */
  async fillDefaultHeadline(value: string): Promise<void> {
    await this.defaultHeadlineInput.fill(value)
    await this.defaultHeadlineInput.blur()
  }

  /**
   * Fill the default sub headline field
   */
  async fillDefaultSubHeadline(value: string): Promise<void> {
    await this.defaultSubHeadlineInput.fill(value)
    await this.defaultSubHeadlineInput.blur()
  }

  /**
   * Fill the default body copy field
   */
  async fillDefaultBody(value: string): Promise<void> {
    await this.defaultBodyTextarea.fill(value)
    await this.defaultBodyTextarea.blur()
  }

  /**
   * Fill the default CTA copy field
   */
  async fillDefaultCta(value: string): Promise<void> {
    await this.defaultCtaInput.fill(value)
    await this.defaultCtaInput.blur()
  }

  /**
   * Fill the legal copy field
   */
  async fillLegalCopy(value: string): Promise<void> {
    await this.legalCopyTextarea.fill(value)
    await this.legalCopyTextarea.blur()
  }

  /**
   * Get the current value of the default headline
   */
  async getDefaultHeadlineValue(): Promise<string> {
    return (await this.defaultHeadlineInput.inputValue()) || ''
  }

  /**
   * Get the current value of the default sub headline
   */
  async getDefaultSubHeadlineValue(): Promise<string> {
    return (await this.defaultSubHeadlineInput.inputValue()) || ''
  }

  /**
   * Get the current value of the default body copy
   */
  async getDefaultBodyValue(): Promise<string> {
    return (await this.defaultBodyTextarea.inputValue()) || ''
  }

  /**
   * Get the current value of the default CTA copy
   */
  async getDefaultCtaValue(): Promise<string> {
    return (await this.defaultCtaInput.inputValue()) || ''
  }

  /**
   * Get the current value of the legal copy
   */
  async getLegalCopyValue(): Promise<string> {
    return (await this.legalCopyTextarea.inputValue()) || ''
  }

  /**
   * Click the Save button
   */
  async clickSave(): Promise<void> {
    await this.saveButton.click()
  }

  /**
   * Click the Save button and wait for the save to complete
   */
  async clickSaveAndWait(): Promise<void> {
    await this.saveButton.click()
    // Wait for the save button to become disabled (form is no longer dirty)
    await expect(this.saveButton).toBeDisabled({ timeout: 15000 })
  }

  /**
   * Click the Cancel button
   */
  async clickCancel(): Promise<void> {
    await this.cancelButton.click()
  }

  /**
   * Check if the Save button is enabled
   */
  async isSaveButtonEnabled(): Promise<boolean> {
    return await this.saveButton.isEnabled()
  }

  /**
   * Check if the Save button is disabled
   */
  async isSaveButtonDisabled(): Promise<boolean> {
    return await this.saveButton.isDisabled()
  }

  /**
   * Add a headline variant
   */
  async addHeadlineVariant(): Promise<void> {
    const addButton = this.page.getByTestId('add-headline-variant-btn')
    await addButton.click()
  }

  /**
   * Fill a headline variant by index (0-based)
   */
  async fillHeadlineVariant(index: number, value: string): Promise<void> {
    const variantInput = this.headlineSection.locator(
      `.ant-form-item:has-text("Variation Headline ${index + 1}") input`
    )
    await variantInput.fill(value)
    await variantInput.blur()
  }

  /**
   * Delete a headline variant by index (0-based)
   */
  async deleteHeadlineVariant(index: number): Promise<void> {
    await this.page.getByTestId(`delete-headline-variant-${index}`).click()
  }

  /**
   * Get the count of headline variants
   */
  async getHeadlineVariantsCount(): Promise<number> {
    const variants = this.headlineSection.locator(
      '.ant-form-item:has-text("Variation Headline")'
    )
    return await variants.count()
  }

  /**
   * Check if Add Headline Variant button is disabled
   */
  async isAddHeadlineVariantDisabled(): Promise<boolean> {
    const addButton = this.page.getByTestId('add-headline-variant-btn')
    return await addButton.isDisabled()
  }

  /**
   * Add a sub headline variant
   */
  async addSubHeadlineVariant(): Promise<void> {
    const addButton = this.page.getByTestId('add-sub-headline-variant-btn')
    await addButton.click()
  }

  /**
   * Fill a sub headline variant by index (0-based)
   */
  async fillSubHeadlineVariant(index: number, value: string): Promise<void> {
    const variantInput = this.subHeadlineSection.locator(
      `.ant-form-item:has-text("Variation Sub Headline ${index + 1}") input`
    )
    await variantInput.fill(value)
    await variantInput.blur()
  }

  /**
   * Delete a sub headline variant by index (0-based)
   */
  async deleteSubHeadlineVariant(index: number): Promise<void> {
    await this.page.getByTestId(`delete-sub-headline-variant-${index}`).click()
  }

  /**
   * Get the count of sub headline variants
   */
  async getSubHeadlineVariantsCount(): Promise<number> {
    const variants = this.subHeadlineSection.locator(
      '.ant-form-item:has-text("Variation Sub Headline")'
    )
    return await variants.count()
  }

  /**
   * Check if Add Sub Headline Variant button is disabled
   */
  async isAddSubHeadlineVariantDisabled(): Promise<boolean> {
    const addButton = this.page.getByTestId('add-sub-headline-variant-btn')
    return await addButton.isDisabled()
  }

  /**
   * Add a body copy variant
   */
  async addBodyVariant(): Promise<void> {
    const addButton = this.page.getByTestId('add-body-variant-btn')
    await addButton.click()
  }

  /**
   * Fill a body copy variant by index (0-based)
   */
  async fillBodyVariant(index: number, value: string): Promise<void> {
    const variantInput = this.bodyCopySection.locator(
      `.ant-form-item:has-text("Variation Body Copy ${index + 1}") textarea`
    )
    await variantInput.fill(value)
    await variantInput.blur()
  }

  /**
   * Delete a body copy variant by index (0-based)
   */
  async deleteBodyVariant(index: number): Promise<void> {
    await this.page.getByTestId(`delete-body-variant-${index}`).click()
  }

  /**
   * Get the count of body copy variants
   */
  async getBodyVariantsCount(): Promise<number> {
    const variants = this.bodyCopySection.locator(
      '.ant-form-item:has-text("Variation Body Copy")'
    )
    return await variants.count()
  }

  /**
   * Check if Add Body Variant button is disabled
   */
  async isAddBodyVariantDisabled(): Promise<boolean> {
    const addButton = this.page.getByTestId('add-body-variant-btn')
    return await addButton.isDisabled()
  }

  /**
   * Add a CTA variant
   */
  async addCtaVariant(): Promise<void> {
    const addButton = this.page.getByTestId('add-cta-variant-btn')
    await addButton.click()
  }

  /**
   * Fill a CTA variant by index (0-based)
   */
  async fillCtaVariant(index: number, value: string): Promise<void> {
    const variantInput = this.ctaCopySection.locator(
      `.ant-form-item:has-text("Variation CTA Copy ${index + 1}") input`
    )
    await variantInput.fill(value)
    await variantInput.blur()
  }

  /**
   * Delete a CTA variant by index (0-based)
   */
  async deleteCtaVariant(index: number): Promise<void> {
    await this.page.getByTestId(`delete-cta-variant-${index}`).click()
  }

  /**
   * Get the count of CTA variants
   */
  async getCtaVariantsCount(): Promise<number> {
    const variants = this.ctaCopySection.locator(
      '.ant-form-item:has-text("Variation CTA Copy")'
    )
    return await variants.count()
  }

  /**
   * Check if Add CTA Variant button is disabled
   */
  async isAddCtaVariantDisabled(): Promise<boolean> {
    const addButton = this.page.getByTestId('add-cta-variant-btn')
    return await addButton.isDisabled()
  }

  /**
   * Collapse a section by clicking its header
   */
  async collapseSection(
    section:
      | 'headline'
      | 'sub-headline'
      | 'body-copy'
      | 'cta-copy'
      | 'legal-copy'
      | 'asset'
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-section`)
    await sectionLocator.locator('.ant-collapse-header').click()
  }

  /**
   * Check if a section is expanded by checking for ant-collapse-item-active class or expanded button
   */
  async isSectionExpanded(
    section:
      | 'headline'
      | 'sub-headline'
      | 'body-copy'
      | 'cta-copy'
      | 'legal-copy'
      | 'asset'
  ): Promise<boolean> {
    const sectionLocator = this.page.getByTestId(`${section}-section`)
    // First try: Check if the collapse item has the active class
    const collapseItem = sectionLocator.locator('.ant-collapse-item')
    if (await collapseItem.count() > 0) {
      const className = await collapseItem.getAttribute('class')
      if (className?.includes('ant-collapse-item-active')) {
        return true
      }
    }
    // Fallback: Check if there's a button containing "expanded" in its name (vs "collapsed")
    // Use regex to match buttons like "expanded HEADLINE", "expanded SUB HEADLINE", etc.
    const expandedButton = sectionLocator.getByRole('button', { name: /^expanded/i })
    return (await expandedButton.count()) > 0
  }

  /**
   * Expand a section if it's collapsed
   */
  async expandSection(
    section:
      | 'headline'
      | 'sub-headline'
      | 'body-copy'
      | 'cta-copy'
      | 'legal-copy'
      | 'asset'
  ): Promise<void> {
    const isExpanded = await this.isSectionExpanded(section)
    if (!isExpanded) {
      const sectionLocator = this.page.getByTestId(`${section}-section`)
      // Click the collapsed button (icon) to expand
      const collapsedButton = sectionLocator.getByRole('button', { name: 'collapsed' })
      if (await collapsedButton.count() > 0) {
        await collapsedButton.click()
      } else {
        // Fallback: try clicking the collapse header
        const header = sectionLocator.locator('.ant-collapse-header')
        if (await header.count() > 0) {
          await header.click()
        }
      }
      // Wait for animation to complete and content to render
      await this.page.waitForTimeout(500)
    }
  }

  /**
   * Expand the asset section if it's collapsed
   */
  async expandAssetSection(): Promise<void> {
    await this.expandSection('asset')
  }

  /**
   * Expand the body copy section if it's collapsed
   */
  async expandBodyCopySection(): Promise<void> {
    await this.expandSection('body-copy')
  }

  /**
   * Expand the CTA copy section if it's collapsed
   */
  async expandCtaCopySection(): Promise<void> {
    await this.expandSection('cta-copy')
  }

  /**
   * Upload an asset file
   * Automatically expands the asset section if collapsed
   */
  async uploadAsset(filePath: string): Promise<void> {
    await this.expandAssetSection()
    // Wait for the collapse content to be fully rendered (Ant Design lazy loads collapse content)
    await this.page.waitForTimeout(500)
    // Find the file input - Ant Design Dragger renders it inside the upload area
    const fileInput = this.assetSection.locator('input[type="file"]')
    // Wait for the input to be attached to DOM (may be lazy loaded)
    await fileInput.waitFor({ state: 'attached', timeout: 10000 })
    await fileInput.setInputFiles(filePath)
  }

  /**
   * Get the count of uploaded assets
   */
  async getUploadedAssetsCount(): Promise<number> {
    const assetItems = this.assetSection.locator('.ant-upload-list-item')
    return await assetItems.count()
  }

  /**
   * Delete an uploaded asset by index (0-based)
   */
  async deleteAsset(index: number): Promise<void> {
    const deleteButtons = this.assetSection.locator(
      '.ant-upload-list-item-actions button'
    )
    await deleteButtons.nth(index).click()
  }

  /**
   * Verify all form sections are visible
   */
  async verifySectionsVisible(): Promise<void> {
    await expect(this.headlineSection).toBeVisible()
    await expect(this.subHeadlineSection).toBeVisible()
    await expect(this.bodyCopySection).toBeVisible()
    await expect(this.ctaCopySection).toBeVisible()
    await expect(this.legalCopySection).toBeVisible()
    await expect(this.assetSection).toBeVisible()
  }

  /**
   * Verify Save and Cancel buttons are visible
   */
  async verifyButtonsVisible(): Promise<void> {
    await expect(this.saveButton).toBeVisible()
    await expect(this.cancelButton).toBeVisible()
  }

  // ==================== Add Token Methods ====================

  /**
   * Check if Add Token button is visible in the headline section
   * Now includes both default headline and variant inputs
   */
  async isAddTokenButtonVisibleInHeadlineSection(): Promise<boolean> {
    const addTokenBtn = this.headlineSection.getByTestId('add-token-btn').first()
    return await addTokenBtn.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Click the Add Token button for the default headline (first Add Token button in headline section)
   */
  async clickAddTokenForDefaultHeadline(): Promise<void> {
    const addTokenBtns = this.headlineSection.getByTestId('add-token-btn')
    await addTokenBtns.first().click()
  }

  /**
   * Click the Add Token button for a headline variant
   * Note: index 0 is now the default headline, variants start at index 1
   */
  async clickAddTokenForHeadlineVariant(index: number): Promise<void> {
    // Index 0 = default headline, index 1+ = variants
    // So to click variant 0, we need to click the second Add Token button (index 1)
    const addTokenBtns = this.headlineSection.getByTestId('add-token-btn')
    await addTokenBtns.nth(index + 1).click()
  }

  /**
   * Get count of Add Token buttons in headline section
   */
  async getAddTokenButtonCountInHeadlineSection(): Promise<number> {
    const addTokenBtns = this.headlineSection.getByTestId('add-token-btn')
    return await addTokenBtns.count()
  }

  /**
   * Check if token dropdown is visible
   */
  async isTokenDropdownVisible(): Promise<boolean> {
    const dropdown = this.page.locator('.ant-dropdown:not(.ant-dropdown-hidden)')
    return await dropdown.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Wait for token dropdown to be visible
   */
  async waitForTokenDropdown(): Promise<void> {
    await this.page.locator('.ant-dropdown:not(.ant-dropdown-hidden)').waitFor({ state: 'visible', timeout: 5000 })
  }

  /**
   * Get all token items from dropdown
   */
  async getTokenDropdownItems(): Promise<string[]> {
    await this.waitForTokenDropdown()
    const items = this.page.locator('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item')
    const count = await items.count()
    const labels: string[] = []
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent()
      if (text) {
        labels.push(text.trim())
      }
    }
    return labels
  }

  /**
   * Click a token item in the dropdown by its label text
   */
  async clickTokenItem(label: string): Promise<void> {
    await this.waitForTokenDropdown()
    const item = this.page.locator('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item', { hasText: label })
    await item.click()
  }

  /**
   * Get the value of a headline variant input
   */
  async getHeadlineVariantValue(index: number): Promise<string> {
    const variantInput = this.headlineSection.locator(
      `.ant-form-item:has-text("Variation Headline ${index + 1}") input`
    )
    return (await variantInput.inputValue()) || ''
  }

  // ==================== Preview Section Methods ====================

  /**
   * Click the Portrait button to switch preview orientation
   * Note: Radio.Button's data-testid is on the hidden input, so we click the label wrapper
   */
  async selectPortraitPreview(): Promise<void> {
    const previewToggle = this.page.getByTestId('preview-orientation-toggle')
    await previewToggle.locator('label.ant-radio-button-wrapper', { hasText: 'Portrait' }).click()
  }

  /**
   * Click the Landscape button to switch preview orientation
   * Note: Radio.Button's data-testid is on the hidden input, so we click the label wrapper
   */
  async selectLandscapePreview(): Promise<void> {
    const previewToggle = this.page.getByTestId('preview-orientation-toggle')
    await previewToggle.locator('label.ant-radio-button-wrapper', { hasText: 'Landscape' }).click()
  }

  /**
   * Check if Portrait is selected
   */
  async isPortraitSelected(): Promise<boolean> {
    const previewToggle = this.page.getByTestId('preview-orientation-toggle')
    const wrapper = previewToggle.locator('label.ant-radio-button-wrapper', { hasText: 'Portrait' })
    const className = await wrapper.getAttribute('class')
    return className?.includes('ant-radio-button-wrapper-checked') ?? false
  }

  /**
   * Check if Landscape is selected
   */
  async isLandscapeSelected(): Promise<boolean> {
    const previewToggle = this.page.getByTestId('preview-orientation-toggle')
    const wrapper = previewToggle.locator('label.ant-radio-button-wrapper', { hasText: 'Landscape' })
    const className = await wrapper.getAttribute('class')
    return className?.includes('ant-radio-button-wrapper-checked') ?? false
  }

  /**
   * Click the Generate Again button to open the Regenerate Preview modal
   */
  async clickGenerateAgain(): Promise<void> {
    await this.page.getByTestId('generate-again-btn').click()
  }

  /**
   * Check if Generate Again button is in loading state
   */
  async isGenerateAgainLoading(): Promise<boolean> {
    const button = this.page.getByTestId('generate-again-btn')
    const className = await button.getAttribute('class')
    return className?.includes('ant-btn-loading') ?? false
  }

  /**
   * Check if Generate button is in loading state
   */
  async isGenerateLoading(): Promise<boolean> {
    const button = this.page.getByTestId('generate-btn')
    const isVisible = await button.isVisible().catch(() => {
      return false
    })
    if (!isVisible) {
      return false
    }
    const className = await button.getAttribute('class')
    return className?.includes('ant-btn-loading') ?? false
  }

  /**
   * Click the initial Generate button to start preview generation
   * This button appears when there are no previews yet
   */
  async clickGenerate(): Promise<void> {
    await this.page.getByTestId('generate-btn').click()
  }

  /**
   * Check if the initial Generate button is visible (no previews exist yet)
   */
  async isGenerateButtonVisible(): Promise<boolean> {
    return await this.page.getByTestId('generate-btn').isVisible().catch(() => {
      return false
    })
  }

  /**
   * Check if the Generate Again button is visible (previews exist)
   */
  async isGenerateAgainButtonVisible(): Promise<boolean> {
    return await this.page.getByTestId('generate-again-btn').isVisible().catch(() => {
      return false
    })
  }

  /**
   * Check if the Generate Again button is clickable (visible and not loading)
   */
  async isGenerateAgainButtonClickable(): Promise<boolean> {
    const button = this.page.getByTestId('generate-again-btn')
    const isVisible = await button.isVisible().catch(() => {
      return false
    })
    if (!isVisible) {
      return false
    }
    // Check if button is NOT in loading state
    const isLoading = await this.isGenerateAgainLoading()
    return !isLoading
  }

  /**
   * Wait for the Generate Again button to be clickable (not loading)
   */
  async waitForGenerateAgainClickable(timeout: number = 30000): Promise<boolean> {
    try {
      await expect(async () => {
        const isClickable = await this.isGenerateAgainButtonClickable()
        expect(isClickable).toBe(true)
      }).toPass({ timeout })
      return true
    } catch {
      return false
    }
  }

  /**
   * Wait for preview generation to complete by waiting for the Generate Again button to appear
   * This indicates that previews have been generated
   */
  async waitForPreviewGenerationComplete(timeout: number = 60000): Promise<void> {
    await expect(this.page.getByTestId('generate-again-btn')).toBeVisible({ timeout })
  }

  /**
   * Check if Regenerate Preview modal is visible
   */
  async isRegenerateModalVisible(): Promise<boolean> {
    const modal = this.page.getByRole('dialog', { name: 'Regenerate Preview' })
    return await modal.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Wait for Regenerate Preview modal to be visible
   */
  async waitForRegenerateModal(): Promise<void> {
    await expect(
      this.page.getByRole('dialog', { name: 'Regenerate Preview' })
    ).toBeVisible({ timeout: 10000 })
  }

  /**
   * Select Image type in Regenerate Preview modal
   */
  async selectImageType(): Promise<void> {
    await this.page.getByTestId('regenerate-type-image').click()
  }

  /**
   * Select Video type in Regenerate Preview modal
   */
  async selectVideoType(): Promise<void> {
    await this.page.getByTestId('regenerate-type-video').click()
  }

  /**
   * Check if video-specific fields are visible (duration, fps, multi-shoot)
   */
  async areVideoFieldsVisible(): Promise<boolean> {
    const durationField = this.page.getByText('Duration:')
    return await durationField.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Click Cancel button in Regenerate Preview modal
   */
  async clickRegenerateModalCancel(): Promise<void> {
    await this.page.getByTestId('regenerate-modal-cancel-btn').click()
  }

  /**
   * Click Generate button in Regenerate Preview modal
   */
  async clickRegenerateModalGenerate(): Promise<void> {
    await this.page.getByTestId('regenerate-modal-generate-btn').click()
  }

  // ==================== Campaign Style Settings Modal Methods ====================

  /**
   * Click the Configure Styles button to open the Campaign Style Settings modal
   */
  async clickConfigureStyles(): Promise<void> {
    await this.page.getByTestId('configure-styles-btn').click()
  }

  /**
   * Check if Configure Styles button is disabled
   */
  async isConfigureStylesDisabled(): Promise<boolean> {
    return await this.page.getByTestId('configure-styles-btn').isDisabled()
  }

  /**
   * Check if Configure Styles button is enabled
   */
  async isConfigureStylesEnabled(): Promise<boolean> {
    return await this.page.getByTestId('configure-styles-btn').isEnabled()
  }

  /**
   * Wait for Campaign Style Settings modal to be visible
   */
  async waitForStyleModal(): Promise<void> {
    await expect(
      this.page.getByRole('dialog', { name: 'Campaign Style Settings' })
    ).toBeVisible({ timeout: 10000 })
  }

  /**
   * Check if Campaign Style Settings modal is visible
   */
  async isStyleModalVisible(): Promise<boolean> {
    const modal = this.page.getByRole('dialog', { name: 'Campaign Style Settings' })
    return await modal.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Click Cancel button in Campaign Style Settings modal
   */
  async clickStyleModalCancel(): Promise<void> {
    await this.page.getByTestId('campaign-style-modal-cancel-btn').click()
  }

  /**
   * Click Save button in Campaign Style Settings modal
   */
  async clickStyleModalSave(): Promise<void> {
    await this.page.getByTestId('campaign-style-modal-save-btn').click()
  }

  /**
   * Check if Save button is enabled in Campaign Style Settings modal
   */
  async isStyleModalSaveEnabled(): Promise<boolean> {
    return await this.page.getByTestId('campaign-style-modal-save-btn').isEnabled()
  }

  /**
   * Check if a style section is visible in the modal
   */
  async isStyleSectionVisible(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<boolean> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    return await sectionLocator.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Check if a style section is expanded in the modal
   */
  async isStyleSectionExpanded(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<boolean> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const collapseItem = sectionLocator.locator('.ant-collapse-item')
    const className = await collapseItem.getAttribute('class')
    return className?.includes('ant-collapse-item-active') ?? false
  }

  /**
   * Toggle (expand/collapse) a style section in the modal
   */
  async toggleStyleSection(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    // Click the expand/collapse icon button to toggle
    const expandButton = sectionLocator.locator('.ant-collapse-expand-icon')
    await expandButton.click()
  }

  /**
   * Get the Font Size value from a style section
   */
  async getStyleSectionFontSize(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<string> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Font Size") input')
    return (await input.inputValue()) || ''
  }

  /**
   * Fill the Font Size value in a style section
   */
  async fillStyleSectionFontSize(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy',
    value: string
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Font Size") input')
    await input.fill(value)
    await input.blur()
  }

  /**
   * Get the Text Align value from a style section
   */
  async getStyleSectionTextAlign(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<string> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const select = sectionLocator.locator('.ant-form-item:has-text("Text Align") .ant-select-selection-item')
    return (await select.textContent()) || ''
  }

  /**
   * Select a Text Align value in a style section
   */
  async selectStyleSectionTextAlign(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy',
    value: 'left' | 'center' | 'right'
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const select = sectionLocator.locator('.ant-form-item:has-text("Text Align") .ant-select')
    await select.click()
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item', { hasText: value }).click()
  }

  /**
   * Get the Top position value from a style section
   */
  async getStyleSectionTop(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<string> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Top") input.ant-input')
    return (await input.inputValue()) || ''
  }

  /**
   * Fill the Top position value in a style section
   */
  async fillStyleSectionTop(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy',
    value: string
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Top") input.ant-input')
    await input.fill(value)
    await input.blur()
  }

  /**
   * Get the Appear Animation value from a style section
   */
  async getStyleSectionAppearAnimation(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<string> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const select = sectionLocator.locator('.ant-form-item:has-text("Appear Animation") .ant-select-selection-item')
    return (await select.textContent()) || ''
  }

  /**
   * Select an Appear Animation value in a style section
   */
  async selectStyleSectionAppearAnimation(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy',
    value: string
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const select = sectionLocator.locator('.ant-form-item:has-text("Appear Animation") .ant-select')
    await select.click()
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item', { hasText: value }).click()
  }

  /**
   * Check if Typography section label is visible within a style section
   */
  async isTypographySectionVisible(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<boolean> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const typographyLabel = sectionLocator.getByText('Typography', { exact: true })
    return await typographyLabel.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Check if Position & Dimensions section label is visible within a style section
   */
  async isPositionSectionVisible(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<boolean> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const positionLabel = sectionLocator.getByText('Position & Dimensions', { exact: true })
    return await positionLabel.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Check if Animation section label is visible within a style section
   */
  async isAnimationSectionVisible(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<boolean> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const animationLabel = sectionLocator.getByText('Animation', { exact: true })
    return await animationLabel.isVisible().catch(() => {
      return false
    })
  }

  // ==================== Campaign Preview Methods ====================

  /**
   * Get the preview container dimensions
   * Returns { width, height } based on the inline style of the preview container
   */
  async getPreviewContainerDimensions(): Promise<{ width: number; height: number }> {
    // The preview container has data-testid="campaign-preview-container"
    const previewContainer = this.page.getByTestId('campaign-preview-container')

    try {
      await previewContainer.waitFor({ state: 'visible', timeout: 5000 })
      const boundingBox = await previewContainer.boundingBox({ timeout: 5000 })
      if (boundingBox) {
        return { width: Math.round(boundingBox.width), height: Math.round(boundingBox.height) }
      }
    } catch {
      // If we can't find or get the bounding box, return zero
    }

    return { width: 0, height: 0 }
  }

  /**
   * Wait for preview to update after orientation change
   * Waits for network idle to ensure data has been refetched
   */
  async waitForPreviewUpdate(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(500)
  }

  /**
   * Click Save button in Campaign Style Settings modal and wait for save to complete
   */
  async clickStyleModalSaveAndWait(): Promise<void> {
    await this.page.getByTestId('campaign-style-modal-save-btn').click()
    // Wait for the modal to close (success message appears)
    await this.page.waitForLoadState('networkidle')
    // Wait for modal to close
    await expect(
      this.page.getByRole('dialog', { name: 'Campaign Style Settings' })
    ).not.toBeVisible({ timeout: 10000 })
  }

  /**
   * Get the Font Color value from a style section
   */
  async getStyleSectionFontColor(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<string> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Font Color") input')
    return (await input.inputValue()) || ''
  }

  /**
   * Fill the Font Color value in a style section
   */
  async fillStyleSectionFontColor(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy',
    value: string
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Font Color") input')
    await input.fill(value)
    await input.blur()
  }

  // ==================== Preview Carousel Methods ====================

  /**
   * Get the carousel container locator
   * The carousel uses slick-slider class from Ant Design
   */
  private getCarouselContainer(): Locator {
    return this.page.locator('.slick-slider')
  }

  /**
   * Check if carousel is visible
   * Checks for the presence of slick-slider (carousel) or the navigation buttons
   */
  async isCarouselVisible(): Promise<boolean> {
    // Check if carousel navigation buttons are visible (near Configure Styles button)
    const configureStylesButton = this.page.getByRole('button', { name: 'Configure Styles' })
    const isConfigureVisible = await configureStylesButton.isVisible().catch(() => false)
    if (!isConfigureVisible) {
      return false
    }
    // Check for slick slider or the preview area with content
    const slickSlider = this.page.locator('.slick-slider')
    return await slickSlider.isVisible().catch(() => false)
  }

  /**
   * Click the previous button in the carousel
   * @deprecated Navigation buttons are hidden in R4.2
   */
  async clickCarouselPrev(): Promise<void> {
    // Navigation buttons are hidden in R4.2
    throw new Error('Carousel navigation buttons are hidden in R4.2')
  }

  /**
   * Click the next button in the carousel
   * @deprecated Navigation buttons are hidden in R4.2
   */
  async clickCarouselNext(): Promise<void> {
    // Navigation buttons are hidden in R4.2
    throw new Error('Carousel navigation buttons are hidden in R4.2')
  }

  /**
   * Get the current active slide index (0-based)
   * The carousel uses slick-slide class for slides
   */
  async getActiveCarouselSlideIndex(): Promise<number> {
    // Try to find slides using the slick-slide class (Ant Design Carousel)
    const slides = this.page.locator('.slick-slide:not(.slick-cloned)')
    const count = await slides.count()
    for (let i = 0; i < count; i++) {
      const className = await slides.nth(i).getAttribute('class')
      if (className?.includes('slick-active') || className?.includes('slick-current')) {
        return i
      }
    }
    return 0
  }

  /**
   * Get total number of carousel slides
   */
  async getCarouselSlideCount(): Promise<number> {
    // Count only actual slides, not cloned ones
    const slides = this.page.locator('.slick-slide:not(.slick-cloned)')
    return await slides.count()
  }

  // ==================== Empty Preview State Methods ====================

  /**
   * Check if empty preview state is visible
   */
  async isEmptyPreviewVisible(): Promise<boolean> {
    const emptyState = this.page.locator('.ant-empty')
    return await emptyState.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Get the empty preview description text
   */
  async getEmptyPreviewText(): Promise<string> {
    const emptyDescription = this.page.locator('.ant-empty-description')
    return (await emptyDescription.textContent()) || ''
  }

  // ==================== Regenerate Modal - Additional Methods ====================

  /**
   * Get the current prompt value in the regenerate modal
   */
  async getRegeneratePromptValue(): Promise<string> {
    const textarea = this.page.locator('#regenerate-preview-form textarea')
    return (await textarea.inputValue()) || ''
  }

  /**
   * Fill the prompt value in the regenerate modal
   */
  async fillRegeneratePrompt(value: string): Promise<void> {
    const textarea = this.page.locator('#regenerate-preview-form textarea')
    await textarea.fill(value)
  }

  /**
   * Get the duration value in the regenerate modal (video mode)
   */
  async getRegenerateDurationValue(): Promise<string> {
    const durationInput = this.page.locator('#regenerate-preview-form input[type="number"]').first()
    return (await durationInput.inputValue()) || ''
  }

  /**
   * Fill the duration value in the regenerate modal (video mode)
   */
  async fillRegenerateDuration(value: string): Promise<void> {
    const durationInput = this.page.locator('#regenerate-preview-form input[type="number"]').first()
    await durationInput.fill(value)
  }

  /**
   * Get the FPS value in the regenerate modal (video mode)
   */
  async getRegenerateFpsValue(): Promise<string> {
    const fpsInput = this.page.locator('#regenerate-preview-form .ant-input-number input')
    return (await fpsInput.inputValue()) || ''
  }

  /**
   * Fill the FPS value in the regenerate modal (video mode)
   */
  async fillRegenerateFps(value: string): Promise<void> {
    const fpsInput = this.page.locator('#regenerate-preview-form .ant-input-number input')
    await fpsInput.fill(value)
  }

  /**
   * Check if multi-shoot checkbox is checked
   */
  async isMultiShootChecked(): Promise<boolean> {
    const checkbox = this.page.locator('#regenerate-preview-form .ant-checkbox-input')
    return await checkbox.isChecked()
  }

  /**
   * Toggle multi-shoot checkbox
   */
  async toggleMultiShoot(): Promise<void> {
    const checkbox = this.page.locator('#regenerate-preview-form .ant-checkbox')
    await checkbox.click()
  }

  /**
   * Check if Image type is selected in regenerate modal
   */
  async isImageTypeSelected(): Promise<boolean> {
    const imageRadio = this.page.getByTestId('regenerate-type-image')
    return await imageRadio.isChecked()
  }

  /**
   * Check if Video type is selected in regenerate modal
   */
  async isVideoTypeSelected(): Promise<boolean> {
    const videoRadio = this.page.getByTestId('regenerate-type-video')
    return await videoRadio.isChecked()
  }

  // ==================== Asset Management - Additional Methods ====================

  /**
   * Get list of uploaded asset names
   */
  async getUploadedAssetNames(): Promise<string[]> {
    const assetItems = this.assetSection.locator('.ant-upload-list-item-name')
    const count = await assetItems.count()
    const names: string[] = []
    for (let i = 0; i < count; i++) {
      const name = await assetItems.nth(i).textContent()
      if (name) {
        names.push(name.trim())
      }
    }
    return names
  }

  /**
   * Delete an asset by clicking the remove button
   * The remove button appears on hover, so we need to hover first
   */
  async deleteUploadedAsset(index: number): Promise<void> {
    const assetItems = this.assetSection.locator('.ant-upload-list-item')
    const itemCount = await assetItems.count()
    if (itemCount > index) {
      // Hover over the item to reveal the delete button
      await assetItems.nth(index).hover()
      // Click the delete/remove button
      const removeButton = assetItems.nth(index).locator('.ant-upload-list-item-action button, .anticon-delete').first()
      await removeButton.click()
    }
  }

  /**
   * Check if asset upload error is shown
   */
  async isAssetUploadErrorVisible(): Promise<boolean> {
    const errorItem = this.assetSection.locator('.ant-upload-list-item-error')
    return await errorItem.isVisible().catch(() => {
      return false
    })
  }

  // ==================== Token Feature - Additional Fields ====================

  /**
   * Check if Add Token button is visible in the sub-headline section
   */
  async isAddTokenButtonVisibleInSubHeadlineSection(): Promise<boolean> {
    const addTokenBtn = this.subHeadlineSection.getByTestId('add-token-btn').first()
    return await addTokenBtn.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Click the Add Token button for the default sub-headline
   */
  async clickAddTokenForDefaultSubHeadline(): Promise<void> {
    const addTokenBtns = this.subHeadlineSection.getByTestId('add-token-btn')
    await addTokenBtns.first().click()
  }

  /**
   * Check if Add Token button is visible in the body copy section
   */
  async isAddTokenButtonVisibleInBodySection(): Promise<boolean> {
    const addTokenBtn = this.bodyCopySection.getByTestId('add-token-btn').first()
    return await addTokenBtn.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Click the Add Token button for the default body copy
   */
  async clickAddTokenForDefaultBody(): Promise<void> {
    const addTokenBtns = this.bodyCopySection.getByTestId('add-token-btn')
    await addTokenBtns.first().click()
  }

  /**
   * Check if Add Token button is visible in the CTA copy section
   */
  async isAddTokenButtonVisibleInCtaSection(): Promise<boolean> {
    const addTokenBtn = this.ctaCopySection.getByTestId('add-token-btn').first()
    return await addTokenBtn.isVisible().catch(() => {
      return false
    })
  }

  /**
   * Click the Add Token button for the default CTA copy
   */
  async clickAddTokenForDefaultCta(): Promise<void> {
    const addTokenBtns = this.ctaCopySection.getByTestId('add-token-btn')
    await addTokenBtns.first().click()
  }

  // ==================== Style Modal - Additional Fields ====================

  /**
   * Get the Left position value from a style section
   */
  async getStyleSectionLeft(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<string> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Left") input.ant-input')
    return (await input.inputValue()) || ''
  }

  /**
   * Fill the Left position value in a style section
   */
  async fillStyleSectionLeft(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy',
    value: string
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Left") input.ant-input')
    await input.fill(value)
    await input.blur()
  }

  /**
   * Get the Width value from a style section
   */
  async getStyleSectionWidth(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<string> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Width") input.ant-input')
    return (await input.inputValue()) || ''
  }

  /**
   * Fill the Width value in a style section
   */
  async fillStyleSectionWidth(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy',
    value: string
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Width") input.ant-input')
    await input.fill(value)
    await input.blur()
  }

  /**
   * Get the Appear Animation value from a style section
   */
  async getStyleSectionAppearAnimationValue(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<string> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const select = sectionLocator.locator('.ant-form-item:has-text("Appear Animation") .ant-select-selection-item')
    return (await select.textContent()) || ''
  }

  /**
   * Select an Appear Animation value in a style section
   */
  async selectStyleSectionAppearAnimationValue(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy',
    value: string
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const select = sectionLocator.locator('.ant-form-item:has-text("Appear Animation") .ant-select')
    await select.click()
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item', { hasText: value }).click()
  }

  /**
   * Get the Appear Time value from a style section (seconds from scene start)
   */
  async getStyleSectionAppearTime(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<string> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Appear Time") input')
    return (await input.inputValue()) || ''
  }

  /**
   * Fill the Appear Time value in a style section
   */
  async fillStyleSectionAppearTime(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy',
    value: string
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Appear Time") input')
    await input.fill(value)
    await input.blur()
  }

  /**
   * Get the Exit Animation value from a style section
   */
  async getStyleSectionExitAnimation(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<string> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const select = sectionLocator.locator('.ant-form-item:has-text("Exit Animation") .ant-select-selection-item')
    return (await select.textContent()) || ''
  }

  /**
   * Select an Exit Animation value in a style section
   */
  async selectStyleSectionExitAnimation(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy',
    value: string
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const select = sectionLocator.locator('.ant-form-item:has-text("Exit Animation") .ant-select')
    await select.click()
    await this.page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item', { hasText: value }).click()
  }

  /**
   * Get the Exit Time value from a style section (seconds from appear)
   */
  async getStyleSectionExitTime(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy'
  ): Promise<string> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Exit Time") input')
    return (await input.inputValue()) || ''
  }

  /**
   * Fill the Exit Time value in a style section
   */
  async fillStyleSectionExitTime(
    section: 'headline' | 'sub-headline' | 'body-copy' | 'cta-copy' | 'legal-copy',
    value: string
  ): Promise<void> {
    const sectionLocator = this.page.getByTestId(`${section}-style-section`)
    const input = sectionLocator.locator('.ant-form-item:has-text("Exit Time") input')
    await input.fill(value)
    await input.blur()
  }
}
