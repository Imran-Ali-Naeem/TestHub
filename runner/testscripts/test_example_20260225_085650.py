#!/usr/bin/env python3
"""
Example.com Basic Test - Demonstrates simple page load verification
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


def run_test(driver):
    """
    Test: Example.com Page Load
    This test verifies that example.com loads correctly (simple test)
    """
    try:
        print("🚀 Starting Example.com Test...")
        
        # Navigate to example.com
        print("📍 Navigating to example.com")
        driver.get("https://www.example.com")
        
        # Wait for page to load
        print("⏳ Waiting for page to load...")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
        
        # Get page title
        title = driver.title
        print(f"📄 Page title: {title}")
        
        # Verify title
        assert "Example" in title, f"Expected 'Example' in title, got: {title}"
        print("✅ Title verification passed")
        
        # Find and verify heading
        h1 = driver.find_element(By.TAG_NAME, "h1")
        heading_text = h1.text
        print(f"📝 Heading text: {heading_text}")
        
        assert "Example Domain" in heading_text, f"Unexpected heading: {heading_text}"
        print("✅ Heading verification passed")
        
        # Find and verify paragraph
        paragraphs = driver.find_elements(By.TAG_NAME, "p")
        assert len(paragraphs) > 0, "No paragraphs found"
        print(f"✅ Found {len(paragraphs)} paragraph(s)")
        
        # Find link
        links = driver.find_elements(By.TAG_NAME, "a")
        print(f"🔗 Found {len(links)} link(s)")
        
        # Get page source length
        page_source_length = len(driver.page_source)
        print(f"📏 Page source length: {page_source_length} characters")
        assert page_source_length > 100, "Page source too short"
        
        time.sleep(1)
        
        print("✅ TEST PASSED: Example.com test completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
