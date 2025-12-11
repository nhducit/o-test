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

    // Check if Storyboard & Copy tab exists
    const tabExists = await this.storyboardTab.isVisible().catch(() => {
      return false
    })

    if (!tabExists) {
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
   * Check if a section is expanded by checking for ant-collapse-item-active class
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
    // Check if the collapse item has the active class
    const collapseItem = sectionLocator.locator('.ant-collapse-item')
    const className = await collapseItem.getAttribute('class')
    return className?.includes('ant-collapse-item-active') ?? false
  }

  /**
   * Upload an asset file
   */
  async uploadAsset(filePath: string): Promise<void> {
    const fileInput = this.assetSection.locator('input[type="file"]')
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
}
