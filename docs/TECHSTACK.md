# Technology Stack

## 🚀 Overview

Dark Sticky Notes is a cross-platform desktop application built with Electron, enabling users to create and manage sticky notes across Windows, macOS, and Linux platforms. The application emphasizes simplicity, performance, and native OS integration.

## 📋 Core Technologies

### Framework & Runtime
- **Electron v37.4.0** - Cross-platform desktop application framework
- **Node.js v20+** - JavaScript runtime (CI requirement)
- **CommonJS** - Module system specification

### Frontend Technologies
- **HTML5** - Semantic markup with modern standards
- **CSS3** - Modern styling with custom properties and flexbox
- **Vanilla JavaScript (ES2018+)** - No external frontend frameworks
- **CSS-in-HTML** - Inline styles for component isolation

### Backend/Main Process
- **Node.js Built-ins**:
  - `fs` - File system operations for data persistence
  - `path` - Cross-platform path handling
  - `electron` - Main process APIs

### Data Management
- **JSON File Storage** - Simple, human-readable data persistence
- **File-based Database** - Custom implementation using `notes.json`
- **UUID v4** - Unique identifier generation for notes

## 🏗️ Architecture

### Application Structure
```
Electron Multi-Process Architecture:
├── Main Process (main.js)
│   ├── Window Management
│   ├── Menu System
│   ├── IPC Coordination
│   └── Data Persistence
├── Renderer Process (note.html + renderer.js)
│   ├── User Interface
│   ├── Event Handling
│   └── Real-time Updates
└── Preload Script (preload.js)
    └── Secure IPC Bridge
```

### Communication Pattern
- **IPC (Inter-Process Communication)** - Secure main ↔ renderer communication
- **Context Bridge** - Isolated API exposure to renderer process
- **Event-Driven Architecture** - Reactive UI updates and state management

## 🔧 Development Tools

### Build System
- **electron-builder v26.0.12** - Multi-platform packaging and distribution
- **npm scripts** - Build automation and task management

### Code Quality
- **EditorConfig** - Consistent code formatting across editors
  - 2-space indentation (JS, CSS, HTML, JSON)
  - 4-space indentation (Python scripts)
  - LF line endings
  - UTF-8 encoding

### Asset Management
- **Python Scripts** - Icon generation and conversion utilities
  - `create_icon.py` - Icon creation automation
  - `convert_icons.py` - Multi-format icon conversion

## 📦 Distribution Targets

### macOS
- **DMG** - Disk Image (.dmg) for Intel (x64) and Apple Silicon (arm64)
- **ZIP** - Archive format (.zip) for both architectures
- **App Bundle** - Native macOS application format
- **Icon Format** - ICNS for macOS integration

### Windows
- **NSIS Installer** - Traditional Windows installer (.exe)
- **Portable Executable** - Standalone application (.exe)
- **ZIP Archive** - Compressed distribution (.zip)
- **Architectures** - x64 and x86 (ia32) support
- **Icon Format** - ICO for Windows integration

### Linux
- **AppImage** - Universal Linux application format
- **Debian Package** - APT-compatible (.deb) packages
- **RPM Package** - Red Hat-compatible (.rpm) packages
- **TAR.GZ Archive** - Compressed source distribution
- **Architectures** - x64 and ARM64 support
- **Icon Format** - PNG for Linux desktop environments

## 🔒 Security Features

### Electron Security
- **Context Isolation** - Renderer process security boundary
- **Node Integration Disabled** - Renderer process hardening
- **Preload Script** - Controlled API exposure
- **CSP Ready** - Content Security Policy compatible

### Data Security
- **Local Storage** - No cloud dependencies or data transmission
- **User Data Directory** - OS-appropriate data storage location
- **File Permissions** - Standard OS file security model

## 🎨 UI/UX Technologies

### Design System
- **System Fonts** - Native OS font stack integration
- **CSS Custom Properties** - Dynamic theming support
- **Flexbox Layout** - Modern, responsive layout system
- **CSS Grid** - Where applicable for complex layouts

### Accessibility
- **Semantic HTML** - Screen reader compatible markup
- **Keyboard Navigation** - Full keyboard accessibility
- **Focus Management** - Proper focus indication and flow
- **High Contrast Support** - System theme integration

### Platform Integration
- **macOS**:
  - Native window controls
  - System menu integration
  - Drag and drop support
  - Keyboard shortcuts (Cmd+key)

- **Windows/Linux**:
  - Platform-specific keyboard shortcuts
  - Native window behavior
  - System notification integration

## 📊 Performance Characteristics

### Resource Optimization
- **Memory Efficient** - Minimal RAM footprint per note
- **CPU Optimized** - Event-driven, non-blocking operations
- **Disk I/O** - Efficient JSON serialization/deserialization
- **Startup Time** - Fast application initialization

### Scalability
- **Multiple Windows** - Independent note window management
- **State Persistence** - Automatic save and restore functionality
- **Session Management** - Window position and size memory

## 🧪 Testing & CI/CD

### Continuous Integration
- **GitHub Actions** - Automated testing and validation
- **Node.js v20** - Standardized runtime environment
- **Ubuntu Latest** - Linux-based CI environment
- **npm ci** - Clean, reproducible dependency installation

### Build Validation
- **Cross-platform Builds** - Automated multi-OS packaging
- **Asset Validation** - Icon and resource integrity checks
- **Distribution Testing** - Package installation verification

## 📚 Dependencies

### Production Dependencies
- **uuid v11.1.0** - RFC4122 compliant unique identifier generation

### Development Dependencies
- **electron v37.4.0** - Main application framework
- **electron-builder v26.0.12** - Build and packaging system

### Zero External Runtime Dependencies
- No jQuery, React, Vue, or other frontend frameworks
- No external CSS libraries or preprocessors
- No runtime dependencies beyond Electron and Node.js built-ins

## 🔄 Version Control & Collaboration

### Git Configuration
- **EditorConfig** - Consistent formatting across contributors
- **Comprehensive .gitignore** - Proper exclusion of build artifacts
- **Pull Request Templates** - Structured contribution workflow

### Project Standards
- **MIT License** - Open source, permissive licensing
- **Semantic Versioning** - Version 1.0.0 current release
- **Changelog Maintenance** - Documented version history
- **Security Policy** - Responsible disclosure guidelines

## 🎯 Key Design Decisions

### Technology Choices
1. **Electron over Native** - Cross-platform compatibility with web technologies
2. **Vanilla JavaScript over Frameworks** - Reduced complexity and bundle size
3. **JSON Storage over Database** - Simplicity and human-readable data format
4. **File-based Persistence over Cloud** - Privacy and offline functionality
5. **IPC over Direct Access** - Security and process isolation

### Performance Trade-offs
- **Memory vs Features** - Lightweight architecture prioritized
- **Security vs Convenience** - Context isolation enforced
- **Simplicity vs Extensibility** - Core functionality focus
- **Bundle Size vs Dependencies** - Minimal external dependencies

## 📈 Future Compatibility

### Upgrade Path
- **Electron LTS Support** - Long-term stability commitment
- **Node.js Compatibility** - Current LTS version targeting
- **OS Version Support** - Modern OS version requirements
- **API Evolution** - Backwards-compatible API design

### Extensibility
- **Plugin Architecture Ready** - IPC framework supports extensions
- **Theme System** - Color customization infrastructure
- **Localization Ready** - String externalization prepared
- **Cloud Integration Capable** - Architecture supports future enhancements