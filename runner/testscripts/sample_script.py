#!/usr/bin/env python3
"""
Sample Selenium test script
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


def run_test(driver):
    """Sample test execution"""
    try:
        # Navigate to a website
        driver.get("https://www.example.com")
        
        # Wait for page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "h1"))
        )
        
        # Get page title
        title = driver.title
        print(f"Page title: {title}")
        
        # Assert title
        assert "Example" in title, "Title does not contain 'Example'"
        
        # Wait a bit
        time.sleep(2)
        
        return True
        
    except Exception as e:
        print(f"Test failed: {e}")
        return False


if __name__ == "__main__":
    from selenium.webdriver.chrome.options import Options
    
    options = Options()
    options.add_argument("--headless")
    
    driver = webdriver.Chrome(options=options)
    
    try:
        success = run_test(driver)
        print("Test passed!" if success else "Test failed!")
    finally:
        driver.quit()
