#!/bin/bash

# Script to download Noto Sans fonts for PDF generation
# Run this from the project root: bash scripts/download-fonts.sh

mkdir -p public/fonts

echo "Downloading Noto Sans fonts with Cyrillic support..."

# Get the CSS file to extract TTF URLs
CSS_CONTENT=$(curl -s -L "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap" -H "User-Agent: Mozilla/5.0")

# Extract TTF URLs from CSS
REGULAR_URL=$(echo "$CSS_CONTENT" | grep -oP 'url\(https://[^)]+\.ttf\)' | head -1 | sed 's/url(//;s/)//')
BOLD_URL=$(echo "$CSS_CONTENT" | grep -oP 'url\(https://[^)]+\.ttf\)' | tail -1 | sed 's/url(//;s/)//')

if [ -z "$REGULAR_URL" ] || [ -z "$BOLD_URL" ]; then
  echo "Error: Could not extract font URLs from CSS"
  echo "Using fallback URLs..."
  REGULAR_URL="https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99d.ttf"
  BOLD_URL="https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyAaBN9d.ttf"
fi

echo "Downloading Regular font from: $REGULAR_URL"
curl -L "$REGULAR_URL" -o public/fonts/NotoSans-Regular.ttf

echo "Downloading Bold font from: $BOLD_URL"
curl -L "$BOLD_URL" -o public/fonts/NotoSans-Bold.ttf

echo ""
echo "Fonts downloaded to public/fonts/"
ls -lh public/fonts/

# Verify they are actual TTF files
echo ""
echo "Verifying font files..."
file public/fonts/NotoSans-Regular.ttf
file public/fonts/NotoSans-Bold.ttf
