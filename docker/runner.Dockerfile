# Runner Dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    xvfb \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

RUN wget -O /tmp/chromedriver.zip https://edgedl.me.gstatic.com/edgedl/chrome/chrome-for-testing/120.0.6099.109/linux64/chromedriver-linux64.zip \
    && unzip /tmp/chromedriver.zip -d /tmp/ \
    && mv /tmp/chromedriver-linux64/chromedriver /usr/local/bin/ \
    && chmod +x /usr/local/bin/chromedriver \
    && rm -rf /tmp/chromedriver*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY testscripts/ ./testscripts/

RUN mkdir -p logs output/videos output/screenshots

ENV PYTHONUNBUFFERED=1
ENV DISPLAY=:99

CMD ["python", "src/runner.py"]
