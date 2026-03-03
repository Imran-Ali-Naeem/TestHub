#!/usr/bin/env python3
"""
API Client for submitting test artifacts to backend

Updated for new schema:
- Screenshots, videos, logs use run_id_string (human-readable) and browser
- ObjectID references optional (run_object_id, result_id)
"""
import requests
import json
import base64
from datetime import datetime
from pathlib import Path
from logger import setup_logger

logger = setup_logger("api_client")


class BackendAPIClient:
    """Client for interacting with TestOps backend API"""
    
    def __init__(self, base_url="http://localhost:8080/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.run_id_string: str = None  # Human-readable run ID
        self.run_object_id: str = None  # MongoDB ObjectID as string
        self.result_id: str = None  # Current test result ObjectID
        self.browser: str = "chrome"  # Current browser
        logger.info(f"API Client initialized with base URL: {base_url}")
    
    def set_run_context(self, run_id_string: str, run_object_id: str = None, browser: str = "chrome"):
        """Set the current run context for artifact submission"""
        self.run_id_string = run_id_string
        self.run_object_id = run_object_id
        self.browser = browser
        logger.info(f"Run context set: {run_id_string} (browser: {browser})")
    
    def set_result_context(self, result_id: str):
        """Set the current test result context"""
        self.result_id = result_id
    
    def submit_screenshot(self, run_id: str, test_name: str, screenshot_path: str, 
                         step: str = "", browser: str = None):
        """
        Submit a screenshot to the backend
        
        Args:
            run_id: Human-readable run ID (e.g., 20260220_143052)
            test_name: Name of the test
            screenshot_path: Path to the screenshot file
            step: Test step name
            browser: Browser used (defaults to self.browser)
        """
        try:
            # Read screenshot and encode to base64
            with open(screenshot_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            
            filename = Path(screenshot_path).name
            
            payload = {
                "run_id": run_id or self.run_id_string,
                "test_name": test_name,
                "browser": browser or self.browser,
                "name": filename,
                "step": step,
                "image_data": image_data,
                "content_type": "image/png"
            }
            
            # Add optional ObjectID references
            if self.run_object_id:
                payload["run_object_id"] = self.run_object_id
            if self.result_id:
                payload["result_id"] = self.result_id
            
            response = self.session.post(
                f"{self.base_url}/artifacts/screenshots",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 201:
                logger.info(f"✅ Screenshot submitted: {filename}")
                return True
            else:
                logger.error(f"❌ Failed to submit screenshot: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error submitting screenshot: {e}")
            return False
    
    def submit_log(self, run_id: str, test_name: str, message: str, 
                   level: str = "info", browser: str = None):
        """
        Submit a log entry to the backend
        
        Args:
            run_id: Human-readable run ID
            test_name: Name of the test
            message: Log message
            level: Log level (info, warning, error)
            browser: Browser used
        """
        try:
            payload = {
                "run_id": run_id or self.run_id_string,
                "test_name": test_name,
                "browser": browser or self.browser,
                "level": level.lower(),
                "message": message
            }
            
            if self.run_object_id:
                payload["run_object_id"] = self.run_object_id
            if self.result_id:
                payload["result_id"] = self.result_id
            
            response = self.session.post(
                f"{self.base_url}/artifacts/logs",
                json=payload,
                timeout=5
            )
            
            if response.status_code == 201:
                return True
            else:
                logger.error(f"❌ Failed to submit log: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error submitting log: {e}")
            return False
    
    def submit_video(self, run_id: str, test_name: str, video_path: str,
                     duration_seconds: float = 0, browser: str = None, gridfs_id: str = None):
        """
        Submit a video to the backend
        
        Args:
            run_id: Human-readable run ID
            test_name: Name of the test
            video_path: Path to the video file
            duration_seconds: Video duration in seconds
            browser: Browser used
            gridfs_id: GridFS file ID if already uploaded
        """
        try:
            filename = Path(video_path).name
            size_bytes = 0
            
            if Path(video_path).exists():
                size_bytes = Path(video_path).stat().st_size
            
            payload = {
                "run_id": run_id or self.run_id_string,
                "test_name": test_name,
                "browser": browser or self.browser,
                "name": filename,
                "duration_seconds": duration_seconds,
                "size_bytes": size_bytes
            }
            
            if self.run_object_id:
                payload["run_object_id"] = self.run_object_id
            if self.result_id:
                payload["result_id"] = self.result_id
            if gridfs_id:
                payload["gridfs_id"] = gridfs_id
            
            response = self.session.post(
                f"{self.base_url}/artifacts/videos",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 201:
                logger.info(f"✅ Video submitted: {filename}")
                return True
            else:
                logger.error(f"❌ Failed to submit video: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error submitting video: {e}")
            return False
    
    def submit_batch_logs(self, run_id: str, test_name: str, log_entries: list, browser: str = None):
        """
        Submit multiple log entries at once
        
        Args:
            run_id: Human-readable run ID
            test_name: Name of the test
            log_entries: List of (message, level) tuples
            browser: Browser used
        """
        success_count = 0
        for message, level in log_entries:
            if self.submit_log(run_id, test_name, message, level, browser):
                success_count += 1
        
        logger.info(f"📊 Submitted {success_count}/{len(log_entries)} logs")
        return success_count
    
    # Legacy methods for backward compatibility
    def submit_screenshot_legacy(self, email: str, test_id: str, screenshot_path: str, step: str = ""):
        """Legacy method - redirects to new API"""
        return self.submit_screenshot(test_id, "test", screenshot_path, step)
    
    def submit_log_legacy(self, email: str, test_id: str, message: str, level: str = "info"):
        """Legacy method - redirects to new API"""
        return self.submit_log(test_id, "test", message, level)
    
    def submit_video_legacy(self, email: str, test_id: str, video_path: str, duration: str = "", size: str = ""):
        """Legacy method - redirects to new API"""
        try:
            duration_seconds = float(duration.replace("s", "")) if duration else 0
        except:
            duration_seconds = 0
        return self.submit_video(test_id, "test", video_path, duration_seconds)
