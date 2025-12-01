#!/usr/bin/env python3
"""
Video recorder module using ffmpeg to record browser sessions
"""
import logging
import subprocess
import os
from datetime import datetime

logger = logging.getLogger(__name__)


class VideoRecorder:
    def __init__(self, output_dir: str = "./output/videos"):
        self.output_dir = output_dir
        self.process = None
        self.current_file = None
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
    
    def start_recording(self, test_id: str, display: str = ":99") -> str:
        """Start recording the display"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{test_id}_{timestamp}.mp4"
        self.current_file = os.path.join(self.output_dir, filename)
        
        try:
            # FFmpeg command to record X11 display
            cmd = [
                "ffmpeg",
                "-video_size", "1920x1080",
                "-framerate", "25",
                "-f", "x11grab",
                "-i", display,
                "-c:v", "libx264",
                "-preset", "ultrafast",
                "-y",  # Overwrite output file
                self.current_file
            ]
            
            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            logger.info(f"Started recording to {self.current_file}")
            return self.current_file
            
        except Exception as e:
            logger.error(f"Failed to start recording: {e}")
            return None
    
    def stop_recording(self) -> str:
        """Stop the recording and return the file path"""
        if self.process:
            try:
                self.process.terminate()
                self.process.wait(timeout=10)
                logger.info(f"Stopped recording: {self.current_file}")
                return self.current_file
            except Exception as e:
                logger.error(f"Error stopping recording: {e}")
                self.process.kill()
        
        return self.current_file
    
    def is_recording(self) -> bool:
        """Check if currently recording"""
        return self.process is not None and self.process.poll() is None
