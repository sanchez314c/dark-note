#!/usr/bin/env python3
"""
Convert PNG icons to platform-specific formats.
"""

import os
from PIL import Image

# Create ICO file for Windows (multi-resolution)
def create_ico():
    """Create Windows ICO file with multiple resolutions."""
    # Load the main icon and create multiple sizes for ICO
    main_icon = Image.open('assets/icon.png')
    
    # Windows ICO requires 256x256 as the largest size
    sizes = [256, 128, 64, 48, 32, 16]
    images = []
    
    for size in sizes:
        img = main_icon.resize((size, size), Image.Resampling.LANCZOS)
        # Ensure RGBA format
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        images.append(img)
    
    # Save as ICO
    if images:
        images[0].save('assets/icon.ico', format='ICO', sizes=[(img.width, img.height) for img in images])
        print("Created: assets/icon.ico")

# Create ICNS file for macOS using iconutil (macOS built-in)
def create_icns():
    """Create macOS ICNS file."""
    # Create iconset directory
    iconset_dir = 'assets/icon.iconset'
    os.makedirs(iconset_dir, exist_ok=True)
    
    # Required sizes for macOS icons
    sizes = {
        'icon_16x16.png': 16,
        'icon_16x16@2x.png': 32,
        'icon_32x32.png': 32,
        'icon_32x32@2x.png': 64,
        'icon_128x128.png': 128,
        'icon_128x128@2x.png': 256,
        'icon_256x256.png': 256,
        'icon_256x256@2x.png': 512,
        'icon_512x512.png': 512,
        'icon_512x512@2x.png': 1024
    }
    
    # Create properly named files for iconutil
    main_icon = Image.open('assets/icon.png')
    for filename, size in sizes.items():
        img = main_icon.resize((size, size), Image.Resampling.LANCZOS)
        img.save(os.path.join(iconset_dir, filename))
    
    print(f"Created iconset directory: {iconset_dir}")
    return iconset_dir

# Main execution
print("Converting icons to platform-specific formats...")

# Create ICO for Windows
create_ico()

# Create ICNS for macOS
iconset_dir = create_icns()

print("\nIcon conversion complete!")
print("\nTo create the macOS .icns file, run:")
print(f"iconutil -c icns {iconset_dir} -o assets/icon.icns")