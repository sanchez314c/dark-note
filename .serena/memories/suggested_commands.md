# Dark Sticky Notes - Essential Commands

## Development Commands

### SWARM Framework Execution
```bash
# Navigate to framework
cd SWARM

# Make scripts executable
chmod +x scripts/monitoring/*.sh
chmod +x scripts/workflows/*.py

# Execute complete autonomous workflow
./scripts/monitoring/master-dashboard.sh "[APP_IDEA]"

# Execute with enhanced monitoring
./scripts/monitoring/swarm-launcher.sh "[APP_IDEA]" --with-visual-testing
```

### Build Commands by Platform
```bash
# Electron (cross-platform desktop)
npm run build:mac      # macOS Intel + ARM
npm run build:win      # Windows x64 + x86  
npm run build:linux    # Linux x64 + ARM

# Swift (native macOS/iOS)
swift build --configuration release
xcodebuild -scheme AppName -configuration Release

# Python (standalone)
python -m build
pyinstaller --onefile --windowed main.py

# Web (optimized)
npm run build:prod
npm run dev  # Development mode
```

### Testing & Quality
```bash
npm test           # Run tests
npm run lint       # Code linting
npm run typecheck  # TypeScript validation
```

### System Utilities (macOS)
```bash
ls, cd, grep, find     # Standard Unix commands
git                    # Version control
screencapture          # Screenshots for visual testing
```