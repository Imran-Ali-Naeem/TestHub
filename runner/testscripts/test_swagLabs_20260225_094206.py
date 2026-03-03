#!/usr/bin/env python3
"""
Swag Labs Login Test - Verifies login functionality
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


def run_test(driver):
    """
    Test: Swag Labs Login Functionality
    This test verifies:
    - Website loads correctly
    - Login works with valid credentials
    - Inventory page loads successfully
    """
    try:
        print("🚀 Starting Swag Labs Login Test...")

        # Open Website
        print("📍 Navigating to Swag Labs")
        driver.get("https://www.saucedemo.com/")

        # Wait for login page to load
        print("⏳ Waiting for login page...")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "login-button"))
        )

        # Verify page title
        title = driver.title
        print(f"📄 Page title: {title}")
        assert "Swag Labs" in title, "❌ Title does not contain 'Swag Labs'"
        print("✅ Login page loaded successfully")

        # Enter username
        print("✏️ Entering username")
        driver.find_element(By.ID, "user-name").send_keys("standard_user")

        # Enter password
        print("✏️ Entering password")
        driver.find_element(By.ID, "password").send_keys("secret_sauce")

        # Click login
        print("🔐 Clicking login button")
        driver.find_element(By.ID, "login-button").click()

        # Wait for inventory page
        print("⏳ Waiting for inventory page...")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "inventory_list"))
        )

        # Validate URL
        current_url = driver.current_url
        print(f"🔗 Current URL: {current_url}")
        assert "inventory" in current_url, "❌ Did not navigate to inventory page"

        print("✅ Login successful - Inventory page loaded")

        print("\n🎉 TEST PASSED: Swag Labs login test completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    from selenium import webdriver

    print("🔧 Setting up WebDriver...")

    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")

    driver = webdriver.Chrome(options=options)

    result = run_test(driver)

    print("\n🧹 Closing browser...")
    time.sleep(2)
    driver.quit()

    if result:
        print("✅ Script finished successfully.")
    else:
        print("❌ Script finished with errors.")