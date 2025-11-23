# Task Completion Workflow for Dark Sticky Notes

## When Task is Complete

### 1. Code Quality Checks
```bash
# Run available quality tools
npm run lint       # If available
npm run typecheck  # If TypeScript
npm test          # Run test suite
```

### 2. Build Verification
```bash
# Platform-specific builds
npm run build     # Web/Electron builds
swift build       # Swift applications
python -m build   # Python applications
```

### 3. Visual Testing (SWARM Framework)
```bash
# Automated visual testing
./scripts/monitoring/visual-testing-agent.sh test-app "dist/AppName"
```

### 4. Final Validation
- Check outputs directory for deliverables
- Verify logs for any errors
- Ensure screenshots show success states
- Validate application launches successfully

### 5. Documentation Update
- Update relevant documentation
- Log important decisions made
- Record any new patterns discovered

## Quality Standards
- ✅ Code passes syntax validation
- ✅ Visual tests show no error dialogs  
- ✅ Performance meets <3s load time
- ✅ Memory usage stays <500MB
- ✅ All target platforms build successfully