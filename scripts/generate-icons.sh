#!/bin/bash
# Generate PWA icons from SVG logo

set -e

ASSETS_DIR="/app/frontend/src/assets"
SVG_FILE="$ASSETS_DIR/logo.svg"

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "Installing ImageMagick..."
    apk add --no-cache imagemagick
fi

# Icon sizes for PWA
SIZES=(72 96 128 144 152 192 384 512)

echo "Generating PWA icons..."
for size in "${SIZES[@]}"; do
    echo "  Creating icon-${size}x${size}.png"
    convert -background none -resize "${size}x${size}" "$SVG_FILE" "$ASSETS_DIR/icon-${size}x${size}.png"
done

# Generate favicon sizes
echo "Generating favicons..."
convert -background none -resize 32x32 "$SVG_FILE" "$ASSETS_DIR/favicon-32x32.png"
convert -background none -resize 16x16 "$SVG_FILE" "$ASSETS_DIR/favicon-16x16.png"

# Apple touch icon (180x180)
echo "Generating Apple touch icon..."
convert -background none -resize 180x180 "$SVG_FILE" "$ASSETS_DIR/apple-touch-icon.png"

# Shortcut icons
echo "Generating shortcut icons..."
# Wallet icon (using the base logo for now)
convert -background none -resize 96x96 "$SVG_FILE" "$ASSETS_DIR/icon-wallet.png"
convert -background none -resize 96x96 "$SVG_FILE" "$ASSETS_DIR/icon-pay.png"
convert -background none -resize 96x96 "$SVG_FILE" "$ASSETS_DIR/icon-merchant.png"

# OpenGraph image (1200x630) - create with padding
echo "Generating OpenGraph image..."
convert -background "#0f172a" -gravity center -resize 400x400 -extent 1200x630 "$SVG_FILE" "$ASSETS_DIR/og-image.png"

# Add text to OG image if we have the font
if convert -list font | grep -q "Inter"; then
    convert "$ASSETS_DIR/og-image.png" \
        -gravity south \
        -fill white \
        -font "Inter" \
        -pointsize 48 \
        -annotate +0+100 "Zero-Fee Payments" \
        "$ASSETS_DIR/og-image.png"
fi

echo "All icons generated successfully!"
ls -la "$ASSETS_DIR"/*.png 2>/dev/null || echo "PNG files created"

