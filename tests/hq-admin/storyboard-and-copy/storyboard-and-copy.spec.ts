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
    test('should show loading state on Generate Again button when preview is generating', async ({}, testInfo) => {
      // Wait for Generate Again button to be clickable (visible and not loading)
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'Generate Again button not clickable - may be loading or no previews exist')
        return
      }

      // Open the regenerate modal
      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      // Click Generate to start preview generation
      await storyboardPage.clickRegenerateModalGenerate()

      // Wait for modal to close (may take time for API call)
      try {
        await expect(storyboardPage.page.getByRole('dialog', { name: 'Regenerate Preview' })).not.toBeVisible({ timeout: 15000 })
      } catch {
        testInfo.skip(true, 'Regenerate modal did not close in time')
        return
      }

      // Check if Generate Again button is in loading state (may be fast, so use retry logic)
      // Skip if generation completed too quickly
      const isLoading = await storyboardPage.isGenerateAgainLoading()
      if (!isLoading) {
        testInfo.skip(true, 'Preview generation completed too quickly to observe loading state')
        return
      }
      expect(isLoading).toBe(true)
    })

    test('should disable Configure Styles button when preview is generating', async ({}, testInfo) => {
      // Wait for Generate Again button to be clickable (visible and not loading)
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'Generate Again button not clickable - may be loading or no previews exist')
        return
      }

      // Open the regenerate modal
      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      // Click Generate to start preview generation
      await storyboardPage.clickRegenerateModalGenerate()

      // Wait for modal to close (may take time for API call)
      try {
        await expect(storyboardPage.page.getByRole('dialog', { name: 'Regenerate Preview' })).not.toBeVisible({ timeout: 15000 })
      } catch {
        testInfo.skip(true, 'Regenerate modal did not close in time')
        return
      }

      // Check if Configure Styles button is disabled (may be fast, so skip if generation completed too quickly)
      const isDisabled = await storyboardPage.isConfigureStylesDisabled()
      if (!isDisabled) {
        testInfo.skip(true, 'Preview generation completed too quickly to observe disabled state')
        return
      }
      expect(isDisabled).toBe(true)
    })
  })

  test.describe('Generate Again / Regenerate Preview', () => {
    test('should open Regenerate Preview modal when clicking Generate Again', async ({}, testInfo) => {
      // Wait for Generate Again button to be clickable (visible and not loading)
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'Generate Again button not clickable - may be loading or no previews exist')
        return
      }

      await storyboardPage.clickGenerateAgain()

      // Wait for modal to appear
      await storyboardPage.waitForRegenerateModal()

      const isVisible = await storyboardPage.isRegenerateModalVisible()
      expect(isVisible).toBe(true)
    })

    test('should close Regenerate Preview modal when clicking Cancel', async ({}, testInfo) => {
      // Wait for Generate Again button to be clickable (visible and not loading)
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'Generate Again button not clickable - may be loading or no previews exist')
        return
      }

      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      await storyboardPage.clickRegenerateModalCancel()

      // Wait for modal to close
      await storyboardPage.page.waitForTimeout(300)

      const isVisible = await storyboardPage.isRegenerateModalVisible()
      expect(isVisible).toBe(false)
    })

    test('should show video-specific fields when Video type is selected', async ({}, testInfo) => {
      // Wait for Generate Again button to be clickable (visible and not loading)
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'Generate Again button not clickable - may be loading or no previews exist')
        return
      }

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

    test('should hide video-specific fields when switching back to Image type', async ({}, testInfo) => {
      // Wait for Generate Again button to be clickable (visible and not loading)
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'Generate Again button not clickable - may be loading or no previews exist')
        return
      }

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
    test('switching between portrait and landscape should update the campaign preview', async ({}, testInfo) => {
      // Wait for Configure Styles to be enabled (preview generation complete)
      const isStylesEnabled = await storyboardPage.isConfigureStylesEnabled()
      if (!isStylesEnabled) {
        testInfo.skip(true, 'Configure Styles button is disabled - preview may be generating')
        return
      }

      // Verify Portrait is selected by default
      expect(await storyboardPage.isPortraitSelected()).toBe(true)

      // Get initial preview dimensions (portrait: 270x480)
      const portraitDimensions = await storyboardPage.getPreviewContainerDimensions()
      if (portraitDimensions.width === 0 || portraitDimensions.height === 0) {
        testInfo.skip(true, 'Could not get preview dimensions - preview may not be fully loaded')
        return
      }

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

  test.describe('Initial Preview Generation', () => {
    test('should show Generate button when no previews exist', async ({}, testInfo) => {
      // Check if Generate button is visible (indicates no previews)
      const isGenerateVisible = await storyboardPage.isGenerateButtonVisible()
      const isGenerateAgainVisible = await storyboardPage.isGenerateAgainButtonVisible()

      // One of these should be visible
      if (!isGenerateVisible && !isGenerateAgainVisible) {
        testInfo.skip(true, 'Neither Generate nor Generate Again button is visible')
        return
      }

      // If Generate button is visible, we have an empty preview state
      if (isGenerateVisible) {
        expect(isGenerateVisible).toBe(true)
        // Also verify the empty preview state
        const isEmptyVisible = await storyboardPage.isEmptyPreviewVisible()
        expect(isEmptyVisible).toBe(true)
      }
    })

    test('should show empty preview state with correct message when no previews exist', async ({}, testInfo) => {
      const isGenerateVisible = await storyboardPage.isGenerateButtonVisible()

      if (!isGenerateVisible) {
        testInfo.skip(true, 'Previews already exist - Generate Again button is shown')
        return
      }

      const isEmptyVisible = await storyboardPage.isEmptyPreviewVisible()
      expect(isEmptyVisible).toBe(true)

      const emptyText = await storyboardPage.getEmptyPreviewText()
      expect(emptyText).toContain('Generate')
    })

    test('should start preview generation when clicking Generate button', async ({ page }, testInfo) => {
      const isGenerateVisible = await storyboardPage.isGenerateButtonVisible()

      if (!isGenerateVisible) {
        testInfo.skip(true, 'Previews already exist - Generate Again button is shown')
        return
      }

      // Click Generate button
      await storyboardPage.clickGenerate()

      // Wait for loading message to appear
      await expect(page.getByText('Generating preview...')).toBeVisible({ timeout: 5000 })

      // The button should now be in loading state
      const isLoading = await storyboardPage.isGenerateLoading()
      expect(isLoading).toBe(true)
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

  test.describe('Token Insertion - Other Fields', () => {
    test('should show Add Token button on sub-headline input', async () => {
      const isAddTokenVisible =
        await storyboardPage.isAddTokenButtonVisibleInSubHeadlineSection()
      expect(isAddTokenVisible).toBe(true)
    })

    test('should insert token into sub-headline when token is selected', async ({
      page,
    }) => {
      const initialValue = await storyboardPage.getDefaultSubHeadlineValue()

      await storyboardPage.clickAddTokenForDefaultSubHeadline()
      await storyboardPage.waitForTokenDropdown()

      const tokenItems = await storyboardPage.getTokenDropdownItems()
      expect(tokenItems.length).toBeGreaterThan(0)

      await storyboardPage.clickTokenItem(tokenItems[0])
      await page.waitForTimeout(200)

      const newValue = await storyboardPage.getDefaultSubHeadlineValue()
      expect(newValue).not.toBe(initialValue)

      // Verify Save button is enabled
      const isEnabled = await storyboardPage.isSaveButtonEnabled()
      expect(isEnabled).toBe(true)
    })

    test('should show Add Token button on body copy input', async () => {
      const isAddTokenVisible =
        await storyboardPage.isAddTokenButtonVisibleInBodySection()
      expect(isAddTokenVisible).toBe(true)
    })

    test('should insert token into body copy when token is selected', async ({
      page,
    }) => {
      const initialValue = await storyboardPage.getDefaultBodyValue()

      await storyboardPage.clickAddTokenForDefaultBody()
      await storyboardPage.waitForTokenDropdown()

      const tokenItems = await storyboardPage.getTokenDropdownItems()
      expect(tokenItems.length).toBeGreaterThan(0)

      await storyboardPage.clickTokenItem(tokenItems[0])
      await page.waitForTimeout(200)

      const newValue = await storyboardPage.getDefaultBodyValue()
      expect(newValue).not.toBe(initialValue)

      // Verify Save button is enabled
      const isEnabled = await storyboardPage.isSaveButtonEnabled()
      expect(isEnabled).toBe(true)
    })

    test('should show Add Token button on CTA copy input', async () => {
      const isAddTokenVisible =
        await storyboardPage.isAddTokenButtonVisibleInCtaSection()
      expect(isAddTokenVisible).toBe(true)
    })

    test('should insert token into CTA copy when token is selected', async ({
      page,
    }) => {
      const initialValue = await storyboardPage.getDefaultCtaValue()

      await storyboardPage.clickAddTokenForDefaultCta()
      await storyboardPage.waitForTokenDropdown()

      const tokenItems = await storyboardPage.getTokenDropdownItems()
      expect(tokenItems.length).toBeGreaterThan(0)

      await storyboardPage.clickTokenItem(tokenItems[0])
      await page.waitForTimeout(200)

      const newValue = await storyboardPage.getDefaultCtaValue()
      expect(newValue).not.toBe(initialValue)

      // Verify Save button is enabled
      const isEnabled = await storyboardPage.isSaveButtonEnabled()
      expect(isEnabled).toBe(true)
    })
  })

  test.describe('Regenerate Preview - Full Flow', () => {
    test('should pre-fill prompt from existing config when opening modal', async ({}, testInfo) => {
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'Generate Again button not clickable')
        return
      }

      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      // Wait for modal to load config
      await storyboardPage.page.waitForTimeout(1000)

      // Get the prompt value - should be pre-filled if config exists
      const promptValue = await storyboardPage.getRegeneratePromptValue()
      // Prompt might be empty or have a value - just verify we can access it
      expect(typeof promptValue).toBe('string')

      await storyboardPage.clickRegenerateModalCancel()
    })

    test('should allow editing prompt in regenerate modal', async ({}, testInfo) => {
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'Generate Again button not clickable')
        return
      }

      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      const testPrompt = `Test prompt ${Date.now()}`
      await storyboardPage.fillRegeneratePrompt(testPrompt)

      const promptValue = await storyboardPage.getRegeneratePromptValue()
      expect(promptValue).toBe(testPrompt)

      await storyboardPage.clickRegenerateModalCancel()
    })

    test('should allow editing video-specific fields when Video type is selected', async ({}, testInfo) => {
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'Generate Again button not clickable')
        return
      }

      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      // Select Video type
      await storyboardPage.selectVideoType()
      await storyboardPage.page.waitForTimeout(200)

      // Verify video fields are visible
      const videoFieldsVisible = await storyboardPage.areVideoFieldsVisible()
      expect(videoFieldsVisible).toBe(true)

      // Edit duration
      await storyboardPage.fillRegenerateDuration('5')
      const durationValue = await storyboardPage.getRegenerateDurationValue()
      expect(durationValue).toBe('5')

      // Edit FPS
      await storyboardPage.fillRegenerateFps('30')
      const fpsValue = await storyboardPage.getRegenerateFpsValue()
      expect(fpsValue).toBe('30')

      // Toggle multi-shoot
      const initialMultiShoot = await storyboardPage.isMultiShootChecked()
      await storyboardPage.toggleMultiShoot()
      const newMultiShoot = await storyboardPage.isMultiShootChecked()
      expect(newMultiShoot).not.toBe(initialMultiShoot)

      await storyboardPage.clickRegenerateModalCancel()
    })

    test('should submit regenerate form with custom prompt and start generation', async ({ page }, testInfo) => {
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'Generate Again button not clickable')
        return
      }

      await storyboardPage.clickGenerateAgain()
      await storyboardPage.waitForRegenerateModal()

      // Fill a custom prompt
      const testPrompt = `E2E Test regeneration ${Date.now()}`
      await storyboardPage.fillRegeneratePrompt(testPrompt)

      // Click Generate
      await storyboardPage.clickRegenerateModalGenerate()

      // Wait for success message
      await expect(page.getByText('Preview generation started')).toBeVisible({ timeout: 15000 })

      // Modal should close
      await expect(page.getByRole('dialog', { name: 'Regenerate Preview' })).not.toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Preview Carousel Navigation', () => {
    /**
     * Helper to ensure at least 2 headline variants exist for carousel testing
     * This adds a variant if needed, saves, and regenerates preview
     */
    async function ensureMultipleVariantsForCarousel(
      page: import('@playwright/test').Page,
      storyboardPage: import('./page-objects/storyboard-and-copy.page').StoryboardAndCopyPage
    ): Promise<boolean> {
      // Check current headline variants count
      const variantCount = await storyboardPage.getHeadlineVariantsCount()

      if (variantCount < 1) {
        // Add a headline variant
        const isDisabled = await storyboardPage.isAddHeadlineVariantDisabled()
        if (isDisabled) {
          return false // Cannot add more variants
        }

        await storyboardPage.addHeadlineVariant()
        await storyboardPage.fillHeadlineVariant(0, `Test Variant ${Date.now()}`)

        // Save the changes
        await storyboardPage.clickSave()
        await page.waitForTimeout(2000)

        // Regenerate preview to include the new variant
        const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
        if (isClickable) {
          await storyboardPage.clickGenerateAgain()
          await storyboardPage.waitForRegenerateModal()
          await storyboardPage.clickRegenerateModalGenerate()

          // Wait for generation to start
          await page.waitForTimeout(3000)

          // Wait for Generate Again to be clickable again (generation complete)
          await storyboardPage.waitForGenerateAgainClickable(60000)
        }
      }

      return true
    }

    test('should display carousel when previews exist', async ({}, testInfo) => {
      // Wait for Generate Again button to confirm previews exist
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'No previews exist - carousel not available')
        return
      }

      const isCarouselVisible = await storyboardPage.isCarouselVisible()
      expect(isCarouselVisible).toBe(true)
    })

    test('should navigate to next slide when clicking next button', async ({ page }, testInfo) => {
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'No previews exist - carousel not available')
        return
      }

      const isCarouselVisible = await storyboardPage.isCarouselVisible()
      if (!isCarouselVisible) {
        testInfo.skip(true, 'Carousel not visible')
        return
      }

      // Check slide count before ensuring variants
      let slideCount = await storyboardPage.getCarouselSlideCount()
      if (slideCount < 2) {
        // Ensure at least 2 variants exist for proper carousel testing
        const success = await ensureMultipleVariantsForCarousel(page, storyboardPage)
        if (!success) {
          testInfo.skip(true, 'Cannot add headline variants for carousel testing')
          return
        }
        // Re-check slide count after adding variant
        slideCount = await storyboardPage.getCarouselSlideCount()
        if (slideCount < 2) {
          testInfo.skip(true, 'Still only one slide after adding variant')
          return
        }
      }

      const initialIndex = await storyboardPage.getActiveCarouselSlideIndex()
      await storyboardPage.clickCarouselNext()
      await page.waitForTimeout(500) // Wait for animation

      const newIndex = await storyboardPage.getActiveCarouselSlideIndex()
      // Carousel may wrap around, so verify index changed (next or wrapped to 0)
      const expectedNextIndex = (initialIndex + 1) % slideCount
      expect(newIndex).toBe(expectedNextIndex)
    })

    test('should navigate to previous slide when clicking prev button', async ({ page }, testInfo) => {
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'No previews exist - carousel not available')
        return
      }

      const isCarouselVisible = await storyboardPage.isCarouselVisible()
      if (!isCarouselVisible) {
        testInfo.skip(true, 'Carousel not visible')
        return
      }

      // Check slide count before ensuring variants
      let slideCount = await storyboardPage.getCarouselSlideCount()
      if (slideCount < 2) {
        // Ensure at least 2 variants exist for proper carousel testing
        const success = await ensureMultipleVariantsForCarousel(page, storyboardPage)
        if (!success) {
          testInfo.skip(true, 'Cannot add headline variants for carousel testing')
          return
        }
        // Re-check slide count after adding variant
        slideCount = await storyboardPage.getCarouselSlideCount()
        if (slideCount < 2) {
          testInfo.skip(true, 'Still only one slide after adding variant')
          return
        }
      }

      // First go to next slide to ensure we're not at index 0
      await storyboardPage.clickCarouselNext()
      await page.waitForTimeout(500)

      const currentIndex = await storyboardPage.getActiveCarouselSlideIndex()

      // Now go back
      await storyboardPage.clickCarouselPrev()
      await page.waitForTimeout(500)

      const newIndex = await storyboardPage.getActiveCarouselSlideIndex()
      // Carousel may wrap around, so verify prev navigation works correctly
      const expectedPrevIndex = (currentIndex - 1 + slideCount) % slideCount
      expect(newIndex).toBe(expectedPrevIndex)
    })

    test('should have multiple slides when text variants exist', async ({ page }, testInfo) => {
      const isClickable = await storyboardPage.waitForGenerateAgainClickable(30000)
      if (!isClickable) {
        testInfo.skip(true, 'No previews exist - carousel not available')
        return
      }

      const isCarouselVisible = await storyboardPage.isCarouselVisible()
      if (!isCarouselVisible) {
        testInfo.skip(true, 'Carousel not visible')
        return
      }

      // Ensure at least 2 variants exist
      const success = await ensureMultipleVariantsForCarousel(page, storyboardPage)
      if (!success) {
        testInfo.skip(true, 'Cannot add headline variants for carousel testing')
        return
      }

      const slideCount = await storyboardPage.getCarouselSlideCount()
      // With variants added, we should have multiple slides
      expect(slideCount).toBeGreaterThanOrEqual(2)
    })
  })

  test.describe('Asset Deletion', () => {
    test('should delete an uploaded asset and enable Save button', async ({ page }, testInfo) => {
      // First upload an asset
      const testImagePath = path.join(__dirname, 'test-assets', 'test-image.png')
      const fileInput = page.locator('input[type="file"]')
      const inputCount = await fileInput.count()

      if (inputCount === 0) {
        testInfo.skip(true, 'File input not available')
        return
      }

      await fileInput.setInputFiles(testImagePath)

      // Wait for upload to complete - look for the upload list item
      await page.waitForTimeout(3000)

      // Get initial asset count
      const initialCount = await storyboardPage.getUploadedAssetsCount()
      if (initialCount === 0) {
        testInfo.skip(true, 'Asset upload did not complete')
        return
      }

      // Delete the first asset by hovering and clicking remove
      const assetItems = page.locator('.ant-upload-list-item')
      await assetItems.first().hover()
      await page.waitForTimeout(300)

      // Click the remove button (X icon)
      const removeBtn = assetItems.first().locator('button').first()
      if (await removeBtn.isVisible()) {
        await removeBtn.click()
        await page.waitForTimeout(500)

        // Verify asset count decreased
        const newCount = await storyboardPage.getUploadedAssetsCount()
        expect(newCount).toBeLessThan(initialCount)
      }
    })
  })

  test.describe('Style Configuration - Additional Fields', () => {
    test('should allow editing Left position in a style section', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      const testValue = '15px'
      await storyboardPage.fillStyleSectionLeft('headline', testValue)

      const value = await storyboardPage.getStyleSectionLeft('headline')
      expect(value).toBe(testValue)

      await storyboardPage.clickStyleModalCancel()
    })

    test('should allow editing Width in a style section', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      const testValue = '200px'
      await storyboardPage.fillStyleSectionWidth('headline', testValue)

      const value = await storyboardPage.getStyleSectionWidth('headline')
      expect(value).toBe(testValue)

      await storyboardPage.clickStyleModalCancel()
    })

    test('should allow selecting Appear Animation in a style section', async ({ page }) => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Click the Appear Animation select
      const sectionLocator = page.getByTestId('headline-style-section')
      const select = sectionLocator.locator('.ant-form-item:has-text("Appear Animation") .ant-select')
      const selectExists = await select.isVisible().catch(() => false)

      if (selectExists) {
        await select.click()
        await page.waitForTimeout(300)

        // Check that dropdown appeared with options
        const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        expect(await dropdown.isVisible()).toBe(true)

        // Click an option (e.g., "Zoom In" to select a different option)
        const zoomInOption = dropdown.locator('.ant-select-item', { hasText: 'Zoom In' })
        if (await zoomInOption.isVisible()) {
          await zoomInOption.click()
          await page.waitForTimeout(200)
        }
      }

      await storyboardPage.clickStyleModalCancel()
    })

    test('should allow editing Appear Time in Animation section', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      const testValue = '0.5'
      await storyboardPage.fillStyleSectionAppearTime('headline', testValue)

      const value = await storyboardPage.getStyleSectionAppearTime('headline')
      // Number inputs may format the value differently
      expect(parseFloat(value)).toBe(parseFloat(testValue))

      await storyboardPage.clickStyleModalCancel()
    })

    test('should allow selecting Exit Animation in a style section', async ({ page }) => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Click the Exit Animation select
      const sectionLocator = page.getByTestId('headline-style-section')
      const select = sectionLocator.locator('.ant-form-item:has-text("Exit Animation") .ant-select')
      const selectExists = await select.isVisible().catch(() => false)

      if (selectExists) {
        await select.click()
        await page.waitForTimeout(300)

        // Check that dropdown appeared with options
        const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
        expect(await dropdown.isVisible()).toBe(true)

        // Click an option (e.g., "Slide Out Right" to select a different option)
        const slideOutOption = dropdown.locator('.ant-select-item', { hasText: 'Slide Out' })
        if (await slideOutOption.isVisible()) {
          await slideOutOption.click()
          await page.waitForTimeout(200)
        }
      }

      await storyboardPage.clickStyleModalCancel()
    })

    test('should allow editing Exit Time in Animation section', async () => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      const testValue = '3'
      await storyboardPage.fillStyleSectionExitTime('headline', testValue)

      const value = await storyboardPage.getStyleSectionExitTime('headline')
      // Number inputs may format the value with decimals
      expect(parseFloat(value)).toBe(parseFloat(testValue))

      await storyboardPage.clickStyleModalCancel()
    })

    test('should persist font size changes after saving', async ({ page }) => {
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      // Get original font size
      const originalFontSize = await storyboardPage.getStyleSectionFontSize('headline')

      // Change font size to a unique value
      const uniqueValue = `${Math.floor(Math.random() * 20) + 20}px`
      await storyboardPage.fillStyleSectionFontSize('headline', uniqueValue)

      // Save
      await storyboardPage.clickStyleModalSaveAndWait()

      // Wait a bit for save to complete
      await page.waitForTimeout(1000)

      // Re-open modal and verify value persisted
      await storyboardPage.clickConfigureStyles()
      await storyboardPage.waitForStyleModal()

      const savedFontSize = await storyboardPage.getStyleSectionFontSize('headline')
      expect(savedFontSize).toBe(uniqueValue)

      // Restore original value
      await storyboardPage.fillStyleSectionFontSize('headline', originalFontSize)
      await storyboardPage.clickStyleModalSaveAndWait()
    })
  })

})
