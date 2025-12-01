#!/usr/bin/env python3
"""
Screenshot utilities for capturing browser screenshots
"""
import logging
import os
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


class Screenshot:
    def __init__(self, output_dir: str = "./output/screenshots"):
        self.output_dir = output_dir
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
    
    def capture(self, driver, test_id: str, suffix: str = "screenshot") -> Optional[str]:
        """Capture a screenshot using Selenium WebDriver"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{test_id}_{suffix}_{timestamp}.png"
            filepath = os.path.join(self.output_dir, filename)
            
            driver.save_screenshot(filepath)
            logger.info(f"Screenshot saved: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Failed to capture screenshot: {e}")
            return None
    
    def capture_failure(self, driver, test_id: str) -> Optional[str]:
        """Capture screenshot on test failure"""
        return self.capture(driver, test_id, "failure")
    
    def capture_success(self, driver, test_id: str) -> Optional[str]:
        """Capture screenshot on test success"""
        return self.capture(driver, test_id, "success")
    
    def capture_step(self, driver, test_id: str, step_name: str) -> Optional[str]:
        """Capture screenshot for a specific test step"""
        return self.capture(driver, test_id, f"step_{step_name}")
