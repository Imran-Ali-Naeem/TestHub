from selenium.webdriver.common.by import By
import time
def run_test(driver):
    driver.get("https://www.wikipedia.org")
    time.sleep(2)
    assert "Wikipedia" in driver.title
    print("Beta test passed")
    return True
