"""Example test script for THEX platform.
Must contain a run_test(driver) function that returns True on success, False on failure.
"""
from selenium.webdriver.common.by import By
import time

def run_test(driver):
    """Test that Google homepage loads and title is correct."""
    driver.get("https://www.google.com")
    time.sleep(2)
    
    title = driver.title
    print(f"Page title: {title}")
    
    if "Google" in title:
        print("✅ Test passed: Google title verified")
        return True
    else:
        print("❌ Test failed: unexpected title")
        return False
