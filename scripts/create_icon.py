#!/usr/bin/env python3
"""
Create a simple sticky note icon for the Dark Sticky Notes app.
Generates PNG, then we'll convert to other formats.
"""

import os
from PIL import Image, ImageDraw, ImageFont

def create_sticky_note_icon(size=1024):
    """Create a sticky note icon."""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate dimensions
    margin = size // 10
    note_size = size - (margin * 2)
    corner_fold = size // 8
    
    # Sticky note yellow color
    note_color = (255, 235, 59, 255)  # #FFEB3B
    shadow_color = (0, 0, 0, 60)
    fold_color = (230, 210, 40, 255)  # Darker yellow for fold
    
    # Draw shadow
    shadow_offset = size // 50
    shadow_points = [
        (margin + shadow_offset, margin + shadow_offset),
        (margin + note_size + shadow_offset, margin + shadow_offset),
        (margin + note_size + shadow_offset, margin + note_size - corner_fold + shadow_offset),
        (margin + note_size - corner_fold + shadow_offset, margin + note_size + shadow_offset),
        (margin + shadow_offset, margin + note_size + shadow_offset)
    ]
    draw.polygon(shadow_points, fill=shadow_color)
    
    # Draw main sticky note shape
    note_points = [
        (margin, margin),
        (margin + note_size, margin),
        (margin + note_size, margin + note_size - corner_fold),
        (margin + note_size - corner_fold, margin + note_size),
        (margin, margin + note_size)
    ]
    draw.polygon(note_points, fill=note_color)
    
    # Draw corner fold
    fold_points = [
        (margin + note_size - corner_fold, margin + note_size),
        (margin + note_size, margin + note_size - corner_fold),
        (margin + note_size - corner_fold, margin + note_size - corner_fold)
    ]
    draw.polygon(fold_points, fill=fold_color)
    
    # Add some text lines to represent content
    line_color = (180, 160, 20, 180)
    line_width = size // 40
    line_spacing = size // 8
    start_y = margin + size // 4
    
    for i in range(3):
        y = start_y + (i * line_spacing)
        line_start_x = margin + size // 6
        line_end_x = margin + note_size - size // 6 - (corner_fold if i == 2 else 0)
        
        draw.rounded_rectangle(
            [(line_start_x, y), (line_end_x, y + line_width)],
            radius=line_width // 2,
            fill=line_color
        )
    
    return img

# Create icons in different sizes
sizes = {
    'icon.png': 1024,          # High res master
    'icon_512.png': 512,       # Large
    'icon_256.png': 256,       # Medium
    'icon_128.png': 128,       # Small
    'icon_64.png': 64,         # Tiny
    'icon_32.png': 32,         # Mini
    'icon_16.png': 16          # Micro
}

# Create assets directory
os.makedirs('assets', exist_ok=True)

# Generate all sizes
for filename, size in sizes.items():
    icon = create_sticky_note_icon(size)
    icon.save(f'assets/{filename}', 'PNG')
    print(f"Created: assets/{filename} ({size}x{size})")

print("\nIcon files created successfully!")
print("\nNext steps:")
print("1. Convert icon.png to .icns for macOS")
print("2. Convert icon.png to .ico for Windows")
print("3. Use icon.png for Linux")