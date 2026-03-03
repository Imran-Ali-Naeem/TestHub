#!/usr/bin/env python3
"""
DemoQA Practice Form Test - Verifies form submission
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def run_test(driver):
    """
    Test: DemoQA Form Submission
    Verifies:
    - Page loads correctly
    - Form fields can be filled
    - Form submission works
    """
    try:
        print("🚀 Starting DemoQA Form Test...")

        # Open Website
        print("📍 Navigating to DemoQA form")
        driver.get("https://demoqa.com/automation-practice-form")

        # Wait for form
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "firstName"))
        )

        print("✅ Form page loaded")

        # Fill form
        driver.find_element(By.ID, "firstName").send_keys("Inshal")
        driver.find_element(By.ID, "lastName").send_keys("Khan")
        driver.find_element(By.ID, "userEmail").send_keys("inshal@test.com")

        # Select gender
        driver.find_element(By.XPATH, "//label[text()='Male']").click()

        driver.find_element(By.ID, "userNumber").send_keys("03123456789")

        # Scroll down to submit
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

        # Click submit
        driver.find_element(By.ID, "submit").click()

        # Wait for confirmation modal
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "modal-content"))
        )

        print("🎉 TEST PASSED: Form submitted successfully")
        return True

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False