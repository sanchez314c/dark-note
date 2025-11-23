# Dark Sticky Notes - Code Style & Conventions

## SWARM Framework Conventions
- **File Naming**: Descriptive, purpose-driven names
- **Directory Structure**: Organized by function (src/, scripts/, tools/, outputs/)
- **Script Standards**: Bash scripts with .sh extension, Python with .py
- **Output Organization**: Session-based outputs with timestamps
- **Logging**: Comprehensive logging with rotation
- **Documentation**: Markdown format with clear headers

## Command Patterns
- **Parallel Execution**: Use `&` and `wait` for concurrent operations
- **Error Handling**: Use `2>/dev/null || true` for optional operations
- **Permissions**: `chmod +x` for executable scripts
- **Claude Flags**: `--model sonnet --verbose --dangerously-skip-permissions -p`

## Build Standards
- Multi-platform support (macOS, Windows, Linux)
- Automated testing with visual validation
- Screenshot-based error detection
- Self-healing build processes