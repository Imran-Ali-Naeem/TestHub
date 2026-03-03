#!/usr/bin/env python3
"""
Heroku Login Test - Verifies login functionality
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def run_test(driver):
    """
    Test: Heroku Login
    Verifies:
    - Page loads correctly
    - Valid login works
    - Success message appears
    """
    try:
        print("🚀 Starting Heroku Login Test...")

        # Open Website
        print("📍 Navigating to login page")
        driver.get("https://the-internet.herokuapp.com/login")

        # Wait for login form
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "login"))
        )

        # Verify title
        title = driver.title
        print(f"📄 Page title: {title}")
        assert "The Internet" in title, "❌ Page title incorrect"

        print("✅ Login page loaded successfully")

        # Enter credentials
        driver.find_element(By.ID, "username").send_keys("tomsmith")
        driver.find_element(By.ID, "password").send_keys("SuperSecretPassword!")

        # Click login
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        # Wait for success message
        success_msg = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "flash"))
        )

        print(f"📢 Message displayed: {success_msg.text}")
        assert "You logged into a secure area!" in success_msg.text

        print("🎉 TEST PASSED: Heroku login successful")
        return True

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False