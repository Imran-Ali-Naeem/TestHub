#!/usr/bin/env python3
"""
Result uploader to send test results back to the Go backend
"""
import logging
import requests
import os
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class ResultUploader:
    def __init__(self, backend_url: str = "http://backend:8080"):
        self.backend_url = backend_url
        self.upload_endpoint = f"{backend_url}/api/results"
    
    def upload_result(
        self,
        test_id: str,
        status: str,
        video_path: Optional[str] = None,
        screenshot_path: Optional[str] = None,
        logs: str = "",
        duration: float = 0.0
    ) -> bool:
        """Upload test result to backend"""
        try:
            # Prepare result data
            result_data = {
                "test_id": test_id,
                "status": status,
                "logs": logs,
                "duration": duration
            }
            
            files = {}
            
            # Add video file if exists
            if video_path and os.path.exists(video_path):
                files['video'] = open(video_path, 'rb')
            
            # Add screenshot if exists
            if screenshot_path and os.path.exists(screenshot_path):
                files['screenshot'] = open(screenshot_path, 'rb')
            
            # Send POST request to backend
            response = requests.post(
                self.upload_endpoint,
                data=result_data,
                files=files,
                timeout=30
            )
            
            # Close file handles
            for file in files.values():
                file.close()
            
            if response.status_code == 200:
                logger.info(f"Successfully uploaded result for test {test_id}")
                return True
            else:
                logger.error(f"Failed to upload result: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error uploading result: {e}")
            return False
    
    def upload_failure(
        self,
        test_id: str,
        error_message: str,
        screenshot_path: Optional[str] = None
    ) -> bool:
        """Upload a failed test result"""
        return self.upload_result(
            test_id=test_id,
            status="failed",
            screenshot_path=screenshot_path,
            logs=error_message
        )
    
    def upload_success(
        self,
        test_id: str,
        video_path: Optional[str] = None,
        screenshot_path: Optional[str] = None,
        duration: float = 0.0
    ) -> bool:
        """Upload a successful test result"""
        return self.upload_result(
            test_id=test_id,
            status="success",
            video_path=video_path,
            screenshot_path=screenshot_path,
            duration=duration
        )
