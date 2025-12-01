#!/usr/bin/env python3
"""
Browser manager for initializing and managing Chrome/Firefox instances
"""
import logging
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService

logger = logging.getLogger(__name__)


class BrowserManager:
    def __init__(self, browser_type: str = "chrome", headless: bool = False):
        self.browser_type = browser_type.lower()
        self.headless = headless
        self.driver = None
    
    def initialize_chrome(self) -> webdriver.Chrome:
        """Initialize Chrome browser"""
        options = ChromeOptions()
        
        if self.headless:
            options.add_argument("--headless")
        
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-blink-features=AutomationControlled")
        
        # Set download directory
        prefs = {
            "download.default_directory": "./output/downloads",
            "download.prompt_for_download": False,
        }
        options.add_experimental_option("prefs", prefs)
        
        try:
            driver = webdriver.Chrome(options=options)
            logger.info("Chrome browser initialized")
            return driver
        except Exception as e:
            logger.error(f"Failed to initialize Chrome: {e}")
            raise
    
    def initialize_firefox(self) -> webdriver.Firefox:
        """Initialize Firefox browser"""
        options = FirefoxOptions()
        
        if self.headless:
            options.add_argument("--headless")
        
        options.add_argument("--width=1920")
        options.add_argument("--height=1080")
        
        try:
            driver = webdriver.Firefox(options=options)
            logger.info("Firefox browser initialized")
            return driver
        except Exception as e:
            logger.error(f"Failed to initialize Firefox: {e}")
            raise
    
    def get_driver(self):
        """Get WebDriver instance"""
        if self.driver is None:
            if self.browser_type == "chrome":
                self.driver = self.initialize_chrome()
            elif self.browser_type == "firefox":
                self.driver = self.initialize_firefox()
            else:
                raise ValueError(f"Unsupported browser type: {self.browser_type}")
        
        return self.driver
    
    def quit(self):
        """Close and quit the browser"""
        if self.driver:
            try:
                self.driver.quit()
                logger.info("Browser closed")
            except Exception as e:
                logger.error(f"Error closing browser: {e}")
            finally:
                self.driver = None
