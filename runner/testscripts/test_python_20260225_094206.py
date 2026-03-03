#!/usr/bin/env python3
"""
Python.org Website Test - Navigates through multiple pages
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


def run_test(driver):
    """
    Test: Python.org Homepage and Navigation
    This test verifies homepage load, navigation menu links, and page transitions.
    """
    try:
        print("🚀 Starting Python.org Website Navigation Test...")

        # Open Website
        print("📍 Navigating to python.org")
        driver.get("https://www.python.org")

        # Wait for page to load
        print("⏳ Waiting for page to load...")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(1)

        # Verify Title
        title = driver.title
        print(f"📄 Page title: {title}")
        assert "Python" in title, "❌ Title does not contain 'Python'"
        print("✅ Python.org homepage loaded")

        # Scroll a bit
        print("📜 Scrolling page...")
        driver.execute_script("window.scrollTo(0, 400);")
        time.sleep(1)
        driver.execute_script("window.scrollTo(0, 800);")
        time.sleep(1)
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(1)

        # -----------------------------
        # 🔗 NAVIGATION THROUGH PAGES
        # -----------------------------
        print("\n🔗 Starting navigation through menu links...")

        pages_to_test = [
            ("Downloads", "downloads"),
            ("Documentation", "doc"),
            ("Community", "community"),
            ("About", "about"),
        ]

        for page_name, expected_url_part in pages_to_test:
            print(f"\n➡️ Navigating to: {page_name}")

            # Click navigation link
            link = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.LINK_TEXT, page_name))
            )
            link.click()

            # Wait for navigation
            time.sleep(2)

            # Verify URL contains expected section
            current_url = driver.current_url
            print(f"🔗 URL after navigation: {current_url}")

            assert expected_url_part.lower() in current_url.lower(), (
                f"❌ Expected '{expected_url_part}' in URL"
            )
            print(f"✅ Navigation to {page_name} page successful")

        print("\n🎉 TEST PASSED: Python.org navigation test completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
