from selenium.webdriver.common.by import By
import time
def run_test(driver):
    driver.get("https://www.google.com")
    time.sleep(2)
    assert "Google" in driver.title
    print("Alpha test passed")
    return True
