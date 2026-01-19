# PWA Icons

This directory should contain the following PWA icons:

- `icon-192x192.png` - 192x192px app icon
- `icon-512x512.png` - 512x512px app icon

## Generate Icons

You can generate these from the `icon.svg` file using:

```bash
# Install ImageMagick if needed
brew install imagemagick

# Generate icons
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 512x512 icon-512x512.png
```

Or use online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

The current `icon.svg` is a placeholder. Replace with your actual app icon.
