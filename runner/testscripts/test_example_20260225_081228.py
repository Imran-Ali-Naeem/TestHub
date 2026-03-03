from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def test_google_search():
    options = webdriver.ChromeOptions()
    driver = webdriver.Remote(command_executor="http://selenium-hub:4444/wd/hub", options=options)
    try:
        driver.get("https://www.google.com")
        assert "Google" in driver.title
        print("Test passed: Google title verified")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_google_search()
