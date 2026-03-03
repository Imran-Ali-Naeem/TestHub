#!/usr/bin/env python3
"""
Browser manager for initializing and managing Chrome/Firefox instances via Selenium Grid Hub.
Both browsers connect to the single Hub URL — the Hub routes requests to the correct node
based on browser capabilities (ChromeOptions vs FirefoxOptions).
"""
import logging
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions

logger = logging.getLogger(__name__)


class BrowserManager:
    def __init__(self, browser_type: str = "chrome", headless: bool = False, use_grid: bool = True):
        self.browser_type = browser_type.lower()
        self.headless = headless
        self.use_grid = use_grid
        self.driver = None
        self.session_id = None  # Exposed for video recorder to find the correct node container
        
        # Single Selenium Grid Hub URL — Hub routes to correct node automatically
        self.hub_url = os.environ.get("SELENIUM_HUB_URL", "http://selenium-hub:4444")
    
    def initialize_chrome(self) -> webdriver.Remote:
        """Initialize Chrome browser via Selenium Grid Hub"""
        options = ChromeOptions()
        
        # Keep headless option (though Grid containers already use Xvfb)
        if self.headless:
            options.add_argument("--headless")
        
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-blink-features=AutomationControlled")
        
        # Set download directory
        prefs = {
            "download.default_directory": "/app/output/downloads",
            "download.prompt_for_download": False,
        }
        options.add_experimental_option("prefs", prefs)
        
        try:
            if self.use_grid:
                # Connect to Selenium Grid Hub — Hub routes to a Chrome node
                driver = webdriver.Remote(
                    command_executor=self.hub_url,
                    options=options
                )
                logger.info(f"Chrome browser initialized via Hub at {self.hub_url} (session: {driver.session_id})")
            else:
                # Fallback to local Chrome (for backward compatibility)
                driver = webdriver.Chrome(options=options)
                logger.info("Chrome browser initialized locally")
            
            return driver
        except Exception as e:
            logger.error(f"Failed to initialize Chrome: {e}")
            raise
    
    def initialize_firefox(self) -> webdriver.Remote:
        """Initialize Firefox browser via Selenium Grid Hub"""
        options = FirefoxOptions()
        
        if self.headless:
            options.add_argument("--headless")
        
        options.add_argument("--width=1920")
        options.add_argument("--height=1080")
        
        try:
            if self.use_grid:
                # Connect to Selenium Grid Hub — Hub routes to a Firefox node
                driver = webdriver.Remote(
                    command_executor=self.hub_url,
                    options=options
                )
                logger.info(f"Firefox browser initialized via Hub at {self.hub_url} (session: {driver.session_id})")
            else:
                # Fallback to local Firefox (for backward compatibility)
                driver = webdriver.Firefox(options=options)
                logger.info("Firefox browser initialized locally")
            
            return driver
        except Exception as e:
            logger.error(f"Failed to initialize Firefox: {e}")
            raise
    
    def get_driver(self):
        """Get WebDriver instance and store session_id for video tracking"""
        if self.driver is None:
            if self.browser_type == "chrome":
                self.driver = self.initialize_chrome()
            elif self.browser_type == "firefox":
                self.driver = self.initialize_firefox()
            else:
                raise ValueError(f"Unsupported browser type: {self.browser_type}")
            
            # Store session_id — used by VideoRecorder to find the exact node container
            self.session_id = self.driver.session_id
            logger.info(f"WebDriver session ID: {self.session_id}")
        
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
