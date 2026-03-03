#!/usr/bin/env python3
"""
Video Recorder - Records test execution as video using Selenium Grid Hub.

Strategy:
  1. Query Grid Hub API at /status to get all nodes and their active sessions
  2. Match driver.session_id → find the node URI (e.g., http://172.20.0.5:5555)
  3. Resolve that node IP → Docker container ID via 'docker ps'
  4. docker exec <container_id> ffmpeg -f x11grab ... into the exact node
  5. Each recording tracks its own container_id + ffmpeg PID for clean parallel operation
"""
from datetime import datetime
from pathlib import Path
import subprocess
import time
import os
import json
import urllib.request
import urllib.error
from logger import setup_logger

logger = setup_logger("video_recorder")


class VideoRecorder:
    """Records screen during test execution using Selenium Grid Hub containers"""
    
    def __init__(self, output_dir: str = "/app/output/videos"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.recording = False
        self.video_filename = None
        self.container_id = None   # Docker container ID (resolved dynamically)
        self.browser = None
        self.ffmpeg_pid = None     # Track specific ffmpeg PID for parallel safety
        self.session_id = None     # WebDriver session ID used to find the node
        
        # Grid Hub URL — same as browser_manager
        self.hub_url = os.environ.get("SELENIUM_HUB_URL", "http://selenium-hub:4444")
    
    def _resolve_container_from_session(self, session_id: str) -> str:
        """
        Query Grid Hub API to find which node is running a given session,
        then resolve that node to a Docker container ID.
        
        Flow: session_id → Grid /status API → node URI → node IP → docker container ID
        
        Args:
            session_id: The WebDriver session ID from driver.session_id
            
        Returns:
            Docker container ID (short form, 12 chars) or None
        """
        try:
            # Step 1: Query Grid Hub /status endpoint
            status_url = f"{self.hub_url}/status"
            logger.info(f"🔍 Querying Grid Hub: {status_url}")
            
            req = urllib.request.Request(status_url)
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())
            
            if not data.get("value", {}).get("ready"):
                logger.warning("⚠️ Grid Hub reports not ready")
            
            # Step 2: Find the node that has our session
            nodes = data.get("value", {}).get("nodes", [])
            target_node_uri = None
            
            for node in nodes:
                node_uri = node.get("uri", "")
                slots = node.get("slots", [])
                
                for slot in slots:
                    slot_session = slot.get("session")
                    if slot_session and slot_session.get("sessionId") == session_id:
                        target_node_uri = node_uri
                        logger.info(f"✅ Session {session_id[:12]}... found on node: {node_uri}")
                        break
                
                if target_node_uri:
                    break
            
            if not target_node_uri:
                logger.error(f"❌ Session {session_id} not found on any Grid node!")
                logger.info(f"📊 Grid has {len(nodes)} node(s)")
                for node in nodes:
                    slots = node.get("slots", [])
                    active = sum(1 for s in slots if s.get("session"))
                    logger.info(f"   Node {node.get('uri')}: {active}/{len(slots)} slots active")
                return None
            
            # Step 3: Extract the IP/hostname from node URI (e.g., "http://172.20.0.5:5555")
            # Parse hostname from URI
            from urllib.parse import urlparse
            parsed = urlparse(target_node_uri)
            node_host = parsed.hostname  # e.g., "172.20.0.5" or "thex-chrome-node-1"
            
            logger.info(f"🔍 Resolving node host '{node_host}' to Docker container...")
            
            # Step 4: Find Docker container by matching the node's IP or hostname
            container_id = self._resolve_container_id(node_host)
            
            if container_id:
                logger.info(f"✅ Resolved to container: {container_id}")
            else:
                logger.error(f"❌ Could not resolve node host '{node_host}' to a container")
            
            return container_id
            
        except urllib.error.URLError as e:
            logger.error(f"❌ Failed to reach Grid Hub at {self.hub_url}: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ Failed to resolve container from session: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _resolve_container_id(self, node_host: str) -> str:
        """
        Resolve a node hostname/IP to a Docker container ID.
        
        Tries multiple strategies:
          1. Match by container IP in the docker network
          2. Match by container hostname/name
          
        Args:
            node_host: IP address or hostname from the Grid node URI
            
        Returns:
            Docker container ID (short form) or None
        """
        try:
            # Strategy 1: Use 'docker ps' with format to get all container IDs and names,
            # then use 'docker inspect' to match by IP
            # Get all running containers on the testops-network
            ps_cmd = [
                "docker", "ps", "--format", "{{.ID}}\t{{.Names}}\t{{.Image}}",
                "--filter", "status=running"
            ]
            ps_result = subprocess.run(ps_cmd, capture_output=True, text=True, timeout=10)
            
            if ps_result.returncode != 0:
                logger.error(f"docker ps failed: {ps_result.stderr}")
                return None
            
            # Parse running containers - look for selenium node containers
            candidates = []
            for line in ps_result.stdout.strip().split("\n"):
                if not line:
                    continue
                parts = line.split("\t")
                if len(parts) >= 3:
                    cid, name, image = parts[0], parts[1], parts[2]
                    # Only consider Selenium node containers
                    if "selenium/node" in image or "node-chrome" in image or "node-firefox" in image:
                        candidates.append((cid, name))
            
            if not candidates:
                logger.error("❌ No Selenium node containers found running!")
                return None
            
            logger.info(f"🔍 Found {len(candidates)} Selenium node container(s)")
            
            # Check each candidate's IP address
            for cid, name in candidates:
                inspect_cmd = [
                    "docker", "inspect", "--format",
                    "{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}",
                    cid
                ]
                inspect_result = subprocess.run(inspect_cmd, capture_output=True, text=True, timeout=10)
                
                if inspect_result.returncode == 0:
                    container_ips = inspect_result.stdout.strip().split()
                    if node_host in container_ips:
                        logger.info(f"✅ Matched container '{name}' (ID: {cid}) by IP {node_host}")
                        return cid
            
            # Strategy 2: Try matching by hostname (container name might contain it)
            for cid, name in candidates:
                # Check container's hostname
                hostname_cmd = [
                    "docker", "inspect", "--format", "{{.Config.Hostname}}", cid
                ]
                hostname_result = subprocess.run(hostname_cmd, capture_output=True, text=True, timeout=10)
                if hostname_result.returncode == 0:
                    container_hostname = hostname_result.stdout.strip()
                    if node_host == container_hostname or node_host in name:
                        logger.info(f"✅ Matched container '{name}' (ID: {cid}) by hostname")
                        return cid
            
            logger.error(f"❌ No container matched for node host: {node_host}")
            logger.info(f"   Candidates were: {[(c, n) for c, n in candidates]}")
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to resolve container ID: {e}")
            return None
        
    def start_recording(self, test_name: str, browser: str = "chrome", session_id: str = None):
        """
        Start recording using FFmpeg inside the Selenium Grid node container.
        
        Uses session_id to query Grid Hub API and find the exact container
        where this session is running, then starts ffmpeg inside that container.
        
        Args:
            test_name: Name of the test being recorded
            browser: Browser type ("chrome" or "firefox")
            session_id: WebDriver session ID (from driver.session_id) — REQUIRED for Grid
        """
        try:
            # Store for stop_recording
            self.browser = browser.lower()
            self.session_id = session_id
            
            # Create timestamped filename with microseconds to ensure uniqueness in parallel runs
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            microseconds = datetime.now().microsecond
            self.video_filename = f"{self.browser}_{test_name}_{timestamp}_{microseconds}.mp4"
            
            # Resolve which container to exec into using Grid Hub API
            if session_id:
                self.container_id = self._resolve_container_from_session(session_id)
            else:
                logger.warning("⚠️ No session_id provided — cannot resolve node container")
                self.container_id = None
            
            if not self.container_id:
                logger.error("❌ Could not determine target container — video recording skipped")
                self.recording = False
                return None
            
            # Build ffmpeg command to run INSIDE the resolved Selenium node container
            cmd = [
                "docker", "exec", "-d", self.container_id,
                "ffmpeg",
                "-video_size", "1920x1080",
                "-framerate", "25",
                "-f", "x11grab",
                "-i", ":99.0",      # Xvfb display inside Selenium container
                "-c:v", "libx264",
                "-preset", "ultrafast",
                "-pix_fmt", "yuv420p",
                f"/videos/{self.video_filename}"  # Saved to volume mount
            ]
            
            # Execute command (detached mode — runs in background inside container)
            logger.info(f"🎬 Starting ffmpeg in container {self.container_id[:12]}...")
            result = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            # Wait for ffmpeg to initialize
            time.sleep(2)
            
            # Check if ffmpeg is running and store PID for specific termination
            check_cmd = ["docker", "exec", self.container_id, "pgrep", "-f", self.video_filename]
            check_result = subprocess.run(check_cmd, capture_output=True, text=True, timeout=10)
            
            if check_result.returncode == 0:
                self.ffmpeg_pid = check_result.stdout.strip().split()[0]  # Get first PID
                logger.info(f"✅ FFmpeg running in container {self.container_id[:12]} (PID: {self.ffmpeg_pid})")
                self.recording = True
            else:
                logger.warning("⚠️ FFmpeg process not found in container!")
                # Check if ffmpeg is available in the container
                test_cmd = ["docker", "exec", self.container_id, "ffmpeg", "-version"]
                test_result = subprocess.run(test_cmd, capture_output=True, text=True, timeout=10)
                if test_result.returncode != 0:
                    logger.error(f"FFmpeg not available in container: {test_result.stderr}")
                self.recording = False
            
            logger.info(f"🎥 Recording: {self.video_filename}")
            
            # Return path on host filesystem
            return str(self.output_dir / self.video_filename)
            
        except Exception as e:
            logger.error(f"❌ Failed to start video recording: {e}")
            import traceback
            traceback.print_exc()
            self.recording = False
            return None
    
    def stop_recording(self):
        """
        Stop the recording by killing ffmpeg inside the resolved Selenium node container.
        Uses the stored container_id and ffmpeg PID for precise termination.
        Safe for parallel recordings — only kills this specific ffmpeg process.
        """
        if not self.recording or not self.container_id:
            return None
            
        try:
            # Kill ONLY this specific ffmpeg process to avoid stopping other parallel tests
            if self.ffmpeg_pid:
                # Kill by specific PID — safe for parallel runs
                subprocess.run(
                    ["docker", "exec", self.container_id, "kill", self.ffmpeg_pid],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=10
                )
                logger.info(f"🛑 Recording stopped in container {self.container_id[:12]} (PID: {self.ffmpeg_pid})")
            else:
                # Fallback: kill by filename pattern (still parallel-safe since filename is unique)
                subprocess.run(
                    ["docker", "exec", self.container_id, "pkill", "-f", self.video_filename],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=10
                )
                logger.info(f"🛑 Recording stopped in container {self.container_id[:12]}")
            
            # CRITICAL: Wait 3 seconds for ffmpeg to finalize the video file
            # Without this, video will be corrupted or incomplete
            time.sleep(3)
            
            self.recording = False
            
            # Check if video file exists and get size
            video_path = self.output_dir / self.video_filename
            if video_path.exists():
                file_size = video_path.stat().st_size
                size_mb = file_size / (1024 * 1024)
                logger.info(f"📹 Video: {self.video_filename} ({size_mb:.2f} MB)")
                return str(video_path)
            else:
                logger.warning(f"⚠️ Video file not found: {self.video_filename}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Failed to stop video recording: {e}")
            return None
        finally:
            # Reset state for next recording
            self.container_id = None
            self.video_filename = None
            self.browser = None
            self.ffmpeg_pid = None
            self.session_id = None
    
    def is_recording(self):
        """Check if currently recording"""
        return self.recording
