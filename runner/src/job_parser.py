#!/usr/bin/env python3
"""
Job parser to parse and validate job JSON from Redis queue
"""
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class JobParser:
    @staticmethod
    def parse(job_data: str) -> Optional[Dict[str, Any]]:
        """Parse job JSON string"""
        try:
            job = json.loads(job_data)
            return JobParser.validate(job)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse job JSON: {e}")
            return None
    
    @staticmethod
    def validate(job: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Validate job structure"""
        required_fields = ["test_id", "script"]
        
        for field in required_fields:
            if field not in job:
                logger.error(f"Missing required field: {field}")
                return None
        
        # Set default values
        job.setdefault("browser", "chrome")
        job.setdefault("headless", False)
        job.setdefault("timeout", 300)  # 5 minutes default
        job.setdefault("user_id", "unknown")
        
        return job
    
    @staticmethod
    def extract_script(job: Dict[str, Any]) -> str:
        """Extract test script from job"""
        return job.get("script", "")
    
    @staticmethod
    def extract_config(job: Dict[str, Any]) -> Dict[str, Any]:
        """Extract configuration from job"""
        return {
            "browser": job.get("browser", "chrome"),
            "headless": job.get("headless", False),
            "timeout": job.get("timeout", 300),
            "test_id": job.get("test_id"),
            "user_id": job.get("user_id", "unknown")
        }
