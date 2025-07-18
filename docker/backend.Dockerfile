FROM node:lts-slim

# Update package list and install dependencies for wkhtmltopdf
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fontconfig \
  libfreetype6 \
  libjpeg62-turbo \
  libpng16-16 \
  libx11-6 \
  libxcb1 \
  libxext6 \
  libxrender1 \
  xfonts-75dpi \
  xfonts-base \
  libjpeg-dev \
  libssl-dev \
  && rm -rf /var/lib/apt/lists/*

# Download and install wkhtmltopdf with proper error handling
RUN wget -q https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-3/wkhtmltox_0.12.6.1-3.bookworm_amd64.deb \
  && apt-get update \
  && dpkg -i wkhtmltox_0.12.6.1-3.bookworm_amd64.deb || true \
  && apt-get install -f -y \
  && ln -sf /usr/local/bin/wkhtmltopdf /usr/bin/wkhtmltopdf \
  && ln -sf /usr/local/bin/wkhtmltoimage /usr/bin/wkhtmltoimage \
  && rm wkhtmltox_0.12.6.1-3.bookworm_amd64.deb \
  && wkhtmltopdf --version