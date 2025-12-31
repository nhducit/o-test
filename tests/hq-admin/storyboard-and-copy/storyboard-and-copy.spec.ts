import { test, expect } from '@playwright/test'
import { StoryboardAndCopyPage } from './page-objects/storyboard-and-copy.page'
import path from 'path'
import { env } from '../../../env'

// Use campaign ID from environment variable, skip tests if not set
const CAMPAIGN_ID = env.TEST_CAMPAIGN_ID

test.describe('Storyboard and Copy Page', () => {
  // Skip all tests in this suite if TEST_CAMPAIGN_ID is not set
  test.skip(!CAMPAIGN_ID, 'TEST_CAMPAIGN_ID environment variable is required')

  let storyboardPage: StoryboardAndCopyPage

  test.beforeEach(async ({ page }, testInfo) => {
    storyboardPage = new StoryboardAndCopyPage(page, CAMPAIGN_ID!)
    const success = await storyboardPage.navigateToPage()
    if (!success) {
      testInfo.skip(
        true,
        `Campaign ${CAMPAIGN_ID} does not exist or Storyboard & Copy tab is not available`
      )
    }
  })

  test.describe('Page Load', () => {
    test('should load the page successfully', async () => {
      await storyboardPage.verifySectionsVisible()
      await storyboardPage.verifyButtonsVisible()
    })

    test('should have Save button disabled initially when no changes made', async () => {
      const isDisabled = await storyboardPage.isSaveButtonDisabled()
      expect(isDisabled).toBe(true)
    })
  })

  test.describe('Form Interactions - Headline Section', () => {
    test('should enable Save button after editing default headline', async () => {
      const originalValue = await storyboardPage.getDefaultHeadlineValue()
      const newValue = `Test Headline ${Date.now()}`

      await storyboardPage.fillDefaultHeadline(newValue)

      const isEnabled = await storyboardPage.isSaveButtonEnabled()
      expect(isEnabled).toBe(true)

      // Restore original value for cleanup
      await storyboardPage.fillDefaultHeadline(originalValue)
    })

    test('should add a headline variant', async ({ page }) => {
      const addVariantButton = page.getByTestId('add-headline-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        const initialCount = await storyboardPage.getHeadlineVariantsCount()
        await storyboardPage.addHeadlineVariant()

        const newCount = await storyboardPage.getHeadlineVariantsCount()
        expect(newCount).toBe(initialCount + 1)
      }
    })

    test('should delete a headline variant', async ({ page }) => {
      const addVariantButton = page.getByTestId('add-headline-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        // First add a variant
        await storyboardPage.addHeadlineVariant()
        const countAfterAdd = await storyboardPage.getHeadlineVariantsCount()
        expect(countAfterAdd).toBeGreaterThan(0)

        // Now delete the first variant (index 0)
        await storyboardPage.deleteHeadlineVariant(0)

        const countAfterDelete = await storyboardPage.getHeadlineVariantsCount()
        expect(countAfterDelete).toBe(countAfterAdd - 1)
      }
    })

    test('should fill headline variant and enable save', async ({ page }) => {
      const addVariantButton = page.getByTestId('add-headline-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        await storyboardPage.addHeadlineVariant()
        const variantValue = `Variant Headline ${Date.now()}`
        await storyboardPage.fillHeadlineVariant(0, variantValue)

        const isEnabled = await storyboardPage.isSaveButtonEnabled()
        expect(isEnabled).toBe(true)
      }
    })
  })

  test.describe('Form Interactions - Sub Headline Section', () => {
    test('should enable Save button after editing default sub headline', async () => {
      const originalValue = await storyboardPage.getDefaultSubHeadlineValue()
      const newValue = `Test Sub Headline ${Date.now()}`

      await storyboardPage.fillDefaultSubHeadline(newValue)

      const isEnabled = await storyboardPage.isSaveButtonEnabled()
      expect(isEnabled).toBe(true)

      // Restore original value for cleanup
      await storyboardPage.fillDefaultSubHeadline(originalValue)
    })

    test('should add and delete a sub headline variant', async ({ page }) => {
      const addVariantButton = page.getByTestId('add-sub-headline-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        // Add variant
        const initialCount = await storyboardPage.getSubHeadlineVariantsCount()
        await storyboardPage.addSubHeadlineVariant()

        const countAfterAdd = await storyboardPage.getSubHeadlineVariantsCount()
        expect(countAfterAdd).toBe(initialCount + 1)

        // Delete variant
        await storyboardPage.deleteSubHeadlineVariant(0)

        const countAfterDelete =
          await storyboardPage.getSubHeadlineVariantsCount()
        expect(countAfterDelete).toBe(initialCount)
      }
    })
  })

  test.describe('Form Interactions - Body Copy Section', () => {
    test('should enable Save button after editing default body copy', async () => {
      const originalValue = await storyboardPage.getDefaultBodyValue()
      const newValue = `Test Body Copy ${Date.now()}`

      await storyboardPage.fillDefaultBody(newValue)

      const isEnabled = await storyboardPage.isSaveButtonEnabled()
      expect(isEnabled).toBe(true)

      // Restore original value for cleanup
      await storyboardPage.fillDefaultBody(originalValue)
    })

    test('should add and delete a body copy variant', async ({ page }) => {
      const addVariantButton = page.getByTestId('add-body-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        // Add variant
        const initialCount = await storyboardPage.getBodyVariantsCount()
        await storyboardPage.addBodyVariant()

        const countAfterAdd = await storyboardPage.getBodyVariantsCount()
        expect(countAfterAdd).toBe(initialCount + 1)

        // Delete variant
        await storyboardPage.deleteBodyVariant(0)

        const countAfterDelete = await storyboardPage.getBodyVariantsCount()
        expect(countAfterDelete).toBe(initialCount)
      }
    })
  })

  test.describe('Form Interactions - CTA Copy Section', () => {
    test('should enable Save button after editing default CTA copy', async () => {
      const originalValue = await storyboardPage.getDefaultCtaValue()
      const newValue = `Test CTA ${Date.now()}`

      await storyboardPage.fillDefaultCta(newValue)

      const isEnabled = await storyboardPage.isSaveButtonEnabled()
      expect(isEnabled).toBe(true)

      // Restore original value for cleanup
      await storyboardPage.fillDefaultCta(originalValue)
    })

    test('should add and delete a CTA variant', async ({ page }) => {
      const addVariantButton = page.getByTestId('add-cta-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        // Add variant
        const initialCount = await storyboardPage.getCtaVariantsCount()
        await storyboardPage.addCtaVariant()

        const countAfterAdd = await storyboardPage.getCtaVariantsCount()
        expect(countAfterAdd).toBe(initialCount + 1)

        // Delete variant
        await storyboardPage.deleteCtaVariant(0)

        const countAfterDelete = await storyboardPage.getCtaVariantsCount()
        expect(countAfterDelete).toBe(initialCount)
      }
    })
  })

  test.describe('Form Interactions - Legal Copy Section', () => {
    test('should enable Save button after editing legal copy', async () => {
      const originalValue = await storyboardPage.getLegalCopyValue()
      const newValue = `Test Legal Copy ${Date.now()}`

      await storyboardPage.fillLegalCopy(newValue)

      const isEnabled = await storyboardPage.isSaveButtonEnabled()
      expect(isEnabled).toBe(true)

      // Restore original value for cleanup
      await storyboardPage.fillLegalCopy(originalValue)
    })
  })

  test.describe('Variant Limit Validation', () => {
    test('should disable Add Variant button when 5 headline variants exist', async ({
      page,
    }) => {
      const addVariantButton = page.getByTestId('add-headline-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        // Add 5 variants
        for (let i = 0; i < 5; i++) {
          const isDisabled =
            await storyboardPage.isAddHeadlineVariantDisabled()
          if (!isDisabled) {
            await storyboardPage.addHeadlineVariant()
          }
        }

        // Check that Add Variant button is now disabled
        const isDisabled = await storyboardPage.isAddHeadlineVariantDisabled()
        expect(isDisabled).toBe(true)
      }
    })
  })

  test.describe('Collapse/Expand Sections', () => {
    test('should have all sections expanded by default', async () => {
      const sections = [
        'headline',
        'sub-headline',
        'body-copy',
        'cta-copy',
        'legal-copy',
        'asset',
      ] as const

      for (const section of sections) {
        const isExpanded = await storyboardPage.isSectionExpanded(section)
        expect(isExpanded).toBe(true)
      }
    })
  })

  test.describe('Form Submission', () => {
    test('should save changes successfully', async () => {
      const newValue = `E2E Test Headline ${Date.now()}`

      await storyboardPage.fillDefaultHeadline(newValue)

      // Verify save button is enabled
      expect(await storyboardPage.isSaveButtonEnabled()).toBe(true)

      // Click save and wait for the save to complete
      await storyboardPage.clickSaveAndWait()

      // Verify Save button is disabled after successful save
      const isDisabled = await storyboardPage.isSaveButtonDisabled()
      expect(isDisabled).toBe(true)
    })

    test('should reset form when Cancel is clicked', async () => {
      const originalValue = await storyboardPage.getDefaultHeadlineValue()
      const newValue = `Modified Headline ${Date.now()}`

      await storyboardPage.fillDefaultHeadline(newValue)

      // Verify save button is enabled (form is dirty)
      expect(await storyboardPage.isSaveButtonEnabled()).toBe(true)

      await storyboardPage.clickCancel()

      // Verify the value is reset to original
      const resetValue = await storyboardPage.getDefaultHeadlineValue()
      expect(resetValue).toBe(originalValue)

      // Verify save button is disabled again
      expect(await storyboardPage.isSaveButtonDisabled()).toBe(true)
    })
  })

  test.describe('Asset Upload', () => {
    test('should enable Save button after uploading an asset', async ({
      page,
    }) => {
      // Create a test image file
      const testImagePath = path.join(__dirname, 'test-assets', 'test-image.png')

      // Check if file input exists
      const fileInput = page.locator('input[type="file"]')
      const inputCount = await fileInput.count()

      if (inputCount > 0) {
        // Upload the test image
        await fileInput.setInputFiles(testImagePath)

        // Wait for upload to complete
        await page.waitForTimeout(2000)

        // Verify Save button is enabled
        const isEnabled = await storyboardPage.isSaveButtonEnabled()
        expect(isEnabled).toBe(true)
      }
    })
  })

  test.describe('Preview Orientation', () => {
    test('should have Portrait selected by default', async () => {
      const isPortrait = await storyboardPage.isPortraitSelected()
      expect(isPortrait).toBe(true)
    })

    test('should switch to Landscape preview', async () => {
      await storyboardPage.selectLandscapePreview()

      const isLandscape = await storyboardPage.isLandscapeSelected()
      expect(isLandscape).toBe(true)
    })

    test('should switch back to Portrait preview', async () => {
      // First switch to landscape
      await storyboardPage.selectLandscapePreview()
      expect(await storyboardPage.isLandscapeSelected()).toBe(true)

      // Switch back to portrait
      await storyboardPage.selectPortraitPreview()
      expect(await storyboardPage.isPortraitSelected()).toBe(true)
    })
  })

  test.describe('Preview Generation Loading States', () => {
    test('should show loading state on Generate Again button when preview is generating', async ({
      page,
    }) => {
      // Open the regenerate modal
      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      // Click Generate to start preview generation
      await storyboardPage.clickRegenerateModalGenerate()

      // Wait for modal to close and generation to start
      await page.waitForTimeout(500)

      // Check if Generate Again button is in loading state
      const isLoading = await storyboardPage.isGenerateAgainLoading()
      expect(isLoading).toBe(true)
    })

    test('should disable Configure Styles button when preview is generating', async ({
      page,
    }) => {
      // Open the regenerate modal
      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      // Click Generate to start preview generation
      await storyboardPage.clickRegenerateModalGenerate()

      // Wait for modal to close and generation to start
      await page.waitForTimeout(500)

      // Check if Configure Styles button is disabled
      const isDisabled = await storyboardPage.isConfigureStylesDisabled()
      expect(isDisabled).toBe(true)
    })
  })

  test.describe('Generate Again / Regenerate Preview', () => {
    test('should open Regenerate Preview modal when clicking Generate Again', async () => {
      await storyboardPage.clickGenerateAgain()

      // Wait for modal to appear
      await storyboardPage.waitForRegenerateModal()

      const isVisible = await storyboardPage.isRegenerateModalVisible()
      expect(isVisible).toBe(true)
    })

    test('should close Regenerate Preview modal when clicking Cancel', async () => {
      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      await storyboardPage.clickRegenerateModalCancel()

      // Wait for modal to close
      await storyboardPage.page.waitForTimeout(300)

      const isVisible = await storyboardPage.isRegenerateModalVisible()
      expect(isVisible).toBe(false)
    })

    test('should show video-specific fields when Video type is selected', async () => {
      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      // Video fields should not be visible initially (Image is default)
      let videoFieldsVisible = await storyboardPage.areVideoFieldsVisible()
      expect(videoFieldsVisible).toBe(false)

      // Select Video type
      await storyboardPage.selectVideoType()

      // Wait for fields to appear
      await storyboardPage.page.waitForTimeout(200)

      // Video fields should now be visible
      videoFieldsVisible = await storyboardPage.areVideoFieldsVisible()
      expect(videoFieldsVisible).toBe(true)

      // Close modal
      await storyboardPage.clickRegenerateModalCancel()
    })

    test('should hide video-specific fields when switching back to Image type', async () => {
      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      // Select Video type first
      await storyboardPage.selectVideoType()
      await storyboardPage.page.waitForTimeout(200)

      expect(await storyboardPage.areVideoFieldsVisible()).toBe(true)

      // Switch back to Image type
      await storyboardPage.selectImageType()
      await storyboardPage.page.waitForTimeout(200)

      expect(await storyboardPage.areVideoFieldsVisible()).toBe(false)

      // Close modal
      await storyboardPage.clickRegenerateModalCancel()
    })
  })

  test.describe('Campaign Style Settings Modal', () => {
    test('should open Campaign Style Settings modal when clicking Configure Styles', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      const isVisible = await storyboardPage.isStyleModalVisible()
      expect(isVisible).toBe(true)
    })

    test('should close Campaign Style Settings modal when clicking Cancel', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      await storyboardPage.clickStyleModalCancel()

      // Wait for modal to close
      await storyboardPage.page.waitForTimeout(300)

      const isVisible = await storyboardPage.isStyleModalVisible()
      expect(isVisible).toBe(false)
    })

    test('should display all 5 style sections in the modal', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      const sections = [
        'headline',
        'sub-headline',
        'body-copy',
        'cta-copy',
        'legal-copy',
      ] as const

      for (const section of sections) {
        const isVisible = await storyboardPage.isStyleSectionVisible(section)
        expect(isVisible).toBe(true)
      }

      await storyboardPage.clickStyleModalCancel()
    })

    test('should have Headline Style section expanded by default', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      const isExpanded = await storyboardPage.isStyleSectionExpanded('headline')
      expect(isExpanded).toBe(true)

      await storyboardPage.clickStyleModalCancel()
    })

    test('should have other style sections collapsed by default', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      const collapsedSections = [
        'sub-headline',
        'body-copy',
        'cta-copy',
        'legal-copy',
      ] as const

      for (const section of collapsedSections) {
        const isExpanded = await storyboardPage.isStyleSectionExpanded(section)
        expect(isExpanded).toBe(false)
      }

      await storyboardPage.clickStyleModalCancel()
    })

    test('should expand a collapsed style section when clicked', async ({
      page,
    }) => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Sub-headline should be collapsed by default
      let isExpanded = await storyboardPage.isStyleSectionExpanded('sub-headline')
      expect(isExpanded).toBe(false)

      // Scroll the section into view first
      const sectionLocator = page.getByTestId('sub-headline-style-section')
      await sectionLocator.scrollIntoViewIfNeeded()

      // Click to expand
      await storyboardPage.toggleStyleSection('sub-headline')

      // Wait for animation to complete
      await page.waitForTimeout(500)

      isExpanded = await storyboardPage.isStyleSectionExpanded('sub-headline')
      expect(isExpanded).toBe(true)

      await storyboardPage.clickStyleModalCancel()
    })

    test('should display Typography, Position & Dimensions, and Animation subsections when expanded', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Headline section is expanded by default
      const isTypographyVisible =
        await storyboardPage.isTypographySectionVisible('headline')
      const isPositionVisible =
        await storyboardPage.isPositionSectionVisible('headline')
      const isAnimationVisible =
        await storyboardPage.isAnimationSectionVisible('headline')

      expect(isTypographyVisible).toBe(true)
      expect(isPositionVisible).toBe(true)
      expect(isAnimationVisible).toBe(true)

      await storyboardPage.clickStyleModalCancel()
    })

    test('should allow editing Font Size in a style section', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      const testValue = '24px'
      await storyboardPage.fillStyleSectionFontSize('headline', testValue)

      const value = await storyboardPage.getStyleSectionFontSize('headline')
      expect(value).toBe(testValue)

      await storyboardPage.clickStyleModalCancel()
    })

    test('should allow editing Top position in a style section', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      const testValue = '10px'
      await storyboardPage.fillStyleSectionTop('headline', testValue)

      const value = await storyboardPage.getStyleSectionTop('headline')
      expect(value).toBe(testValue)

      await storyboardPage.clickStyleModalCancel()
    })

    test('should save style settings and close modal', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Make a change
      await storyboardPage.fillStyleSectionFontSize('headline', '32px')

      // Click save
      await storyboardPage.clickStyleModalSave()

      // Wait for modal to close
      await storyboardPage.page.waitForTimeout(300)

      const isVisible = await storyboardPage.isStyleModalVisible()
      expect(isVisible).toBe(false)
    })
  })

  test.describe('Campaign Preview Style Tests', () => {
    test('switching between portrait and landscape should update the campaign preview', async () => {
      // Verify Portrait is selected by default
      expect(await storyboardPage.isPortraitSelected()).toBe(true)

      // Get initial preview dimensions (portrait: 270x480)
      const portraitDimensions = await storyboardPage.getPreviewContainerDimensions()

      // Switch to Landscape
      await storyboardPage.selectLandscapePreview()
      await storyboardPage.waitForPreviewUpdate()

      // Verify Landscape is selected
      expect(await storyboardPage.isLandscapeSelected()).toBe(true)

      // Get landscape dimensions (landscape: 480x270)
      const landscapeDimensions = await storyboardPage.getPreviewContainerDimensions()

      // Verify dimensions changed - landscape should be wider than portrait
      expect(landscapeDimensions.width).toBeGreaterThan(portraitDimensions.width)
      expect(landscapeDimensions.height).toBeLessThan(portraitDimensions.height)

      // Switch back to Portrait
      await storyboardPage.selectPortraitPreview()
      await storyboardPage.waitForPreviewUpdate()

      // Verify Portrait is selected again
      expect(await storyboardPage.isPortraitSelected()).toBe(true)

      // Get final dimensions
      const finalDimensions = await storyboardPage.getPreviewContainerDimensions()

      // Verify dimensions match original portrait dimensions
      expect(finalDimensions.width).toBe(portraitDimensions.width)
      expect(finalDimensions.height).toBe(portraitDimensions.height)
    })

    test('portrait: clicking Configure Styles should open the modal', async () => {
      // Ensure Portrait is selected
      expect(await storyboardPage.isPortraitSelected()).toBe(true)

      // Click Configure Styles button
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Verify modal is visible
      const isVisible = await storyboardPage.isStyleModalVisible()
      expect(isVisible).toBe(true)

      // Close modal
      await storyboardPage.clickStyleModalCancel()
    })

    test('portrait: update form values, save changes, new text styles should be reflected', async ({
      page,
    }) => {
      // Ensure Portrait is selected
      expect(await storyboardPage.isPortraitSelected()).toBe(true)

      // Open Configure Styles modal
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Get original font size value
      const originalFontSize = await storyboardPage.getStyleSectionFontSize('headline')

      // Update the font size to a new value
      const newFontSize = originalFontSize === '24px' ? '32px' : '24px'
      await storyboardPage.fillStyleSectionFontSize('headline', newFontSize)

      // Save changes and wait for completion
      await storyboardPage.clickStyleModalSaveAndWait()

      // Wait for success message
      await expect(page.getByText('Styles saved successfully')).toBeVisible({ timeout: 5000 })

      // Wait for preview data to refetch
      await storyboardPage.waitForPreviewUpdate()

      // Re-open modal to verify the value was saved
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Verify the new value is reflected
      const savedFontSize = await storyboardPage.getStyleSectionFontSize('headline')
      expect(savedFontSize).toBe(newFontSize)

      // Restore original value
      await storyboardPage.fillStyleSectionFontSize('headline', originalFontSize)
      await storyboardPage.clickStyleModalSaveAndWait()
    })

    test('landscape: clicking Configure Styles should open the modal', async () => {
      // Switch to Landscape
      await storyboardPage.selectLandscapePreview()
      await storyboardPage.waitForPreviewUpdate()

      // Verify Landscape is selected
      expect(await storyboardPage.isLandscapeSelected()).toBe(true)

      // Click Configure Styles button
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Verify modal is visible
      const isVisible = await storyboardPage.isStyleModalVisible()
      expect(isVisible).toBe(true)

      // Close modal
      await storyboardPage.clickStyleModalCancel()
    })

    test('landscape: update form values, save changes, new text styles should be reflected', async ({
      page,
    }) => {
      // Switch to Landscape
      await storyboardPage.selectLandscapePreview()
      await storyboardPage.waitForPreviewUpdate()

      // Verify Landscape is selected
      expect(await storyboardPage.isLandscapeSelected()).toBe(true)

      // Open Configure Styles modal
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Get original font size value
      const originalFontSize = await storyboardPage.getStyleSectionFontSize('headline')

      // Update the font size to a new value
      const newFontSize = originalFontSize === '28px' ? '36px' : '28px'
      await storyboardPage.fillStyleSectionFontSize('headline', newFontSize)

      // Save changes and wait for completion
      await storyboardPage.clickStyleModalSaveAndWait()

      // Wait for success message
      await expect(page.getByText('Styles saved successfully')).toBeVisible({ timeout: 5000 })

      // Wait for preview data to refetch
      await storyboardPage.waitForPreviewUpdate()

      // Re-open modal to verify the value was saved
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Verify the new value is reflected
      const savedFontSize = await storyboardPage.getStyleSectionFontSize('headline')
      expect(savedFontSize).toBe(newFontSize)

      // Restore original value
      await storyboardPage.fillStyleSectionFontSize('headline', originalFontSize)
      await storyboardPage.clickStyleModalSaveAndWait()
    })
  })

  test.describe('Add Token Feature', () => {
    test('should show Add Token button on default headline input', async () => {
      // The Add Token button should now be visible on the default headline input
      const isAddTokenVisible =
        await storyboardPage.isAddTokenButtonVisibleInHeadlineSection()
      expect(isAddTokenVisible).toBe(true)
    })

    test('should open token dropdown when clicking Add Token button on default headline', async () => {
      // Click the Add Token button for default headline
      await storyboardPage.clickAddTokenForDefaultHeadline()

      // Wait for dropdown
      await storyboardPage.waitForTokenDropdown()

      // Get token items to verify dropdown has content
      const tokenItems = await storyboardPage.getTokenDropdownItems()
      expect(tokenItems.length).toBeGreaterThan(0)
    })

    test('should have token items in the dropdown', async () => {
      // Click the Add Token button for default headline
      await storyboardPage.clickAddTokenForDefaultHeadline()

      // Get token items
      const tokenItems = await storyboardPage.getTokenDropdownItems()

      // Verify there are token items available
      expect(tokenItems.length).toBeGreaterThan(0)
    })

    test('should insert token into default headline when token is selected', async ({
      page,
    }) => {
      // Get initial value of default headline
      const initialValue = await storyboardPage.getDefaultHeadlineValue()

      // Click the Add Token button for default headline
      await storyboardPage.clickAddTokenForDefaultHeadline()

      // Get the first token from dropdown
      const tokenItems = await storyboardPage.getTokenDropdownItems()
      expect(tokenItems.length).toBeGreaterThan(0)

      // Click the first token
      await storyboardPage.clickTokenItem(tokenItems[0])

      // Wait for the token to be inserted
      await page.waitForTimeout(200)

      // Verify the token was inserted into the input (value should be different)
      const newValue = await storyboardPage.getDefaultHeadlineValue()
      expect(newValue).not.toBe(initialValue)
    })

    test('should enable Save button after inserting a token into default headline', async ({
      page,
    }) => {
      // Click the Add Token button for default headline
      await storyboardPage.clickAddTokenForDefaultHeadline()

      // Get and click the first token
      const tokenItems = await storyboardPage.getTokenDropdownItems()
      await storyboardPage.clickTokenItem(tokenItems[0])

      // Wait for the token to be inserted
      await page.waitForTimeout(200)

      // Verify Save button is enabled
      const isEnabled = await storyboardPage.isSaveButtonEnabled()
      expect(isEnabled).toBe(true)
    })

    test('should have Add Token button count increase when variant is added', async ({
      page,
    }) => {
      // Get initial count of Add Token buttons (should be at least 1 for default headline)
      const initialCount =
        await storyboardPage.getAddTokenButtonCountInHeadlineSection()
      expect(initialCount).toBeGreaterThanOrEqual(1)

      // Add a headline variant if possible
      const addVariantButton = page.getByTestId('add-headline-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        await storyboardPage.addHeadlineVariant()
        await page.waitForTimeout(300)

        // Verify Add Token button count increased
        const newCount =
          await storyboardPage.getAddTokenButtonCountInHeadlineSection()
        expect(newCount).toBe(initialCount + 1)
      }
    })
  })

})
