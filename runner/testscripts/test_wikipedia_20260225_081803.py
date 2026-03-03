#!/usr/bin/env python3
"""
Wikipedia Search Test - Cross-browser compatible (Chrome + Firefox)
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


def run_test(driver):
    """
    Test: Wikipedia Search and Navigation
    Cross-browser compatible with fallback locator strategy
    """
    try:
        print("🚀 Starting Wikipedia Search Test...")

        # Navigate to Wikipedia
        print("📍 Navigating to en.wikipedia.org")
        driver.get("https://en.wikipedia.org")

        # Wait for body to confirm page loaded
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(1)

        # Verify page title
        assert "Wikipedia" in driver.title, "Wikipedia page did not load"
        print("✅ Wikipedia homepage loaded")

        # -----------------------------------------------
        # 🔍 FIND SEARCH BOX - Multi-fallback strategy
        # -----------------------------------------------
        search_box = None
        selectors_to_try = [
            (By.NAME, "search"),                          # Classic skin / Firefox
            (By.CSS_SELECTOR, ".cdx-text-input__input"),  # Vector 2022 Chrome
            (By.CSS_SELECTOR, "input[type='search']"),    # Generic fallback
            (By.ID, "searchInput"),                        # Old skin fallback
        ]

        for by, selector in selectors_to_try:
            try:
                search_box = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((by, selector))
                )
                print(f"✅ Search box found using selector: '{selector}'")
                break
            except:
                print(f"⚠️ Selector not found, trying next: '{selector}'")
                continue

        if not search_box:
            raise Exception("❌ Could not locate search box with any known selector")

        # Search for article
        search_term = "Selenium (software)"
        print(f"🔍 Searching for: {search_term}")
        search_box.clear()
        search_box.send_keys(search_term)
        time.sleep(1)
        search_box.send_keys(Keys.RETURN)

        # Wait for results page to load
        print("⏳ Waiting for search results...")
        time.sleep(3)

        # -----------------------------------------------
        # 📄 HANDLE ARTICLE OR SEARCH RESULTS PAGE
        # -----------------------------------------------
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "firstHeading"))
            )
            heading_element = driver.find_element(By.ID, "firstHeading")
            heading = heading_element.text.strip()
            print(f"📄 Page heading found: {heading}")

            # If on search results page, click first result
            if not heading or "Search results" in heading:
                print("📋 On search results page, clicking first result...")
                first_result = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable(
                        (By.CSS_SELECTOR, ".mw-search-result-heading a")
                    )
                )
                first_result.click()
                time.sleep(2)
                heading = driver.find_element(By.ID, "firstHeading").text.strip()
                print(f"📄 Article heading after clicking result: {heading}")

        except Exception as inner_e:
            print(f"⚠️ Retrying heading detection... ({inner_e})")
            time.sleep(2)
            heading = driver.find_element(By.ID, "firstHeading").text.strip()
            print(f"📄 Article heading on retry: {heading}")

        # Validate correct article
        assert heading and "Selenium" in heading, f"❌ Wrong article loaded: '{heading}'"
        print("✅ Correct article loaded")

        # Verify content visible
        content = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, "mw-content-text"))
        )
        assert content.is_displayed(), "❌ Article content not visible"
        print("✅ Article content is visible")

        # Scroll through article
        print("📜 Scrolling through article...")
        driver.execute_script("window.scrollTo(0, 500);")
        time.sleep(1)
        driver.execute_script("window.scrollTo(0, 1000);")
        time.sleep(1)
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(1)

        # Click an internal article link
        try:
            internal_link = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable(
                    (By.CSS_SELECTOR, "#mw-content-text p a[href^='/wiki/']")
                )
            )
            link_text = internal_link.text
            print(f"🔗 Clicking internal link: '{link_text}'")
            internal_link.click()
            time.sleep(2)
            print(f"🔗 Navigated to: {driver.current_url}")
            print("✅ Internal link navigation successful")

            # Navigate back
            driver.back()
            time.sleep(2)
            print("✅ Navigated back successfully")

        except Exception as link_e:
            print(f"⚠️ Internal link click skipped: {link_e}")

        print("\n🎉 TEST PASSED: Wikipedia search and navigation completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False