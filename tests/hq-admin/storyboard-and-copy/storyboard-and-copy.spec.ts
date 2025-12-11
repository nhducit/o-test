import { test, expect } from '@playwright/test'
import { StoryboardAndCopyPage } from './page-objects/storyboard-and-copy.page'
import path from 'path'

const CAMPAIGN_ID = '7482'

test.describe('Storyboard and Copy Page', () => {
  let storyboardPage: StoryboardAndCopyPage

  test.beforeEach(async ({ page }) => {
    storyboardPage = new StoryboardAndCopyPage(page, CAMPAIGN_ID)
    await storyboardPage.navigateToPage()
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

  test.describe('Add Token Feature', () => {
    test('should show Add Token button when variant is added', async ({ page }) => {
      const addVariantButton = page.getByTestId('add-headline-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        // Add a headline variant
        await storyboardPage.addHeadlineVariant()

        // Wait for the variant to appear
        await page.waitForTimeout(300)

        // Check if Add Token button is visible
        const isAddTokenVisible =
          await storyboardPage.isAddTokenButtonVisibleForHeadlineVariant(0)
        expect(isAddTokenVisible).toBe(true)
      }
    })

    test('should open token dropdown when clicking Add Token button', async ({
      page,
    }) => {
      const addVariantButton = page.getByTestId('add-headline-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        // Add a headline variant
        await storyboardPage.addHeadlineVariant()
        await page.waitForTimeout(300)

        // Click the Add Token button
        await storyboardPage.clickAddTokenForHeadlineVariant(0)

        // Wait for dropdown and verify it's visible
        await storyboardPage.waitForTokenDropdown()
        const isDropdownVisible = await storyboardPage.isTokenDropdownVisible()
        expect(isDropdownVisible).toBe(true)
      }
    })

    test('should have token items in the dropdown', async ({ page }) => {
      const addVariantButton = page.getByTestId('add-headline-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        // Add a headline variant
        await storyboardPage.addHeadlineVariant()
        await page.waitForTimeout(300)

        // Click the Add Token button
        await storyboardPage.clickAddTokenForHeadlineVariant(0)

        // Get token items
        const tokenItems = await storyboardPage.getTokenDropdownItems()

        // Verify there are token items available
        expect(tokenItems.length).toBeGreaterThan(0)
      }
    })

    test('should insert token into input field when token is selected', async ({
      page,
    }) => {
      const addVariantButton = page.getByTestId('add-headline-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        // Add a headline variant
        await storyboardPage.addHeadlineVariant()
        await page.waitForTimeout(300)

        // Get initial value (should be empty)
        const initialValue = await storyboardPage.getHeadlineVariantValue(0)
        expect(initialValue).toBe('')

        // Click the Add Token button
        await storyboardPage.clickAddTokenForHeadlineVariant(0)

        // Get the first token from dropdown
        const tokenItems = await storyboardPage.getTokenDropdownItems()
        expect(tokenItems.length).toBeGreaterThan(0)

        // Click the first token
        await storyboardPage.clickTokenItem(tokenItems[0])

        // Wait for the token to be inserted
        await page.waitForTimeout(200)

        // Verify the token was inserted into the input
        const newValue = await storyboardPage.getHeadlineVariantValue(0)
        expect(newValue.length).toBeGreaterThan(0)
      }
    })

    test('should enable Save button after inserting a token', async ({
      page,
    }) => {
      const addVariantButton = page.getByTestId('add-headline-variant-btn')
      const buttonExists = await addVariantButton.isVisible().catch(() => {
        return false
      })

      if (buttonExists) {
        // Add a headline variant
        await storyboardPage.addHeadlineVariant()
        await page.waitForTimeout(300)

        // Click the Add Token button
        await storyboardPage.clickAddTokenForHeadlineVariant(0)

        // Get and click the first token
        const tokenItems = await storyboardPage.getTokenDropdownItems()
        await storyboardPage.clickTokenItem(tokenItems[0])

        // Wait for the token to be inserted
        await page.waitForTimeout(200)

        // Verify Save button is enabled
        const isEnabled = await storyboardPage.isSaveButtonEnabled()
        expect(isEnabled).toBe(true)
      }
    })
  })

})
