FROM python:3.11-slim

# Install system dependencies
# - curl: needed for Grid Hub API queries (video_recorder.py uses urllib, but curl useful for debugging)
# - Docker CLI: needed for 'docker exec' into Grid node containers (video recording via ffmpeg)
# - ffmpeg is NOT needed here — it runs inside the Selenium node containers
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Docker CLI (needed for docker exec to Selenium Grid node containers)
RUN curl -fsSL https://get.docker.com -o get-docker.sh \
    && sh get-docker.sh \
    && rm get-docker.sh \
    && rm -rf /var/lib/apt/lists/*

# NOTE: Chrome/ChromeDriver are NOT installed locally.
# The runner uses Remote WebDriver to connect to Selenium Grid Hub,
# which routes requests to Chrome/Firefox node containers.

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/
COPY testscripts/ ./testscripts/

# Create output directories
RUN mkdir -p logs output/screenshots output/reports output/videos

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV SELENIUM_HUB_URL=http://selenium-hub:4444

# Default command — just run the runner (no Xvfb needed, browsers run in Grid nodes)
CMD ["python", "src/runner.py"]
