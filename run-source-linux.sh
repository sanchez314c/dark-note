#!/bin/bash
#
# Dark Sticky Notes - Linux Source Runner
# Clean start script with port management
#

set -e

# ============================================
# PORT CONFIGURATION (Random High Ports)
# ============================================
ELECTRON_DEBUG_PORT=56532
ELECTRON_INSPECT_PORT=60119
ELECTRON_PORT=53715

# ============================================
# COLORS
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# ============================================
# FUNCTIONS
# ============================================

print_header() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║          Dark Sticky Notes - Linux Source Runner               ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_and_kill_port() {
    local port=$1
    local name=$2
    local pid
    pid=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}[CLEANUP]${NC} Killing process on port $port ($name) - PID: $pid"
        kill -9 "$pid" 2>/dev/null || true
        sleep 0.5
    fi
}

kill_zombie_electrons() {
    echo -e "${BLUE}[CLEANUP]${NC} Checking for orphaned Electron processes..."
    local pids
    pids=$(pgrep -f "electron.*$(basename "$(pwd)")" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}[CLEANUP]${NC} Killing orphaned Electron processes: $pids"
        echo "$pids" | xargs -r kill -9 2>/dev/null || true
        sleep 1
    fi
    local dir_pids
    dir_pids=$(pgrep -f "electron $(pwd)" 2>/dev/null || true)
    if [ -n "$dir_pids" ]; then
        echo -e "${YELLOW}[CLEANUP]${NC} Killing Electron processes in project dir: $dir_pids"
        echo "$dir_pids" | xargs -r kill -9 2>/dev/null || true
        sleep 1
    fi
}

check_dependencies() {
    echo -e "${BLUE}[CHECK]${NC} Verifying dependencies..."
    if ! command -v node &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Node.js is not installed!"
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} Node.js $(node --version)"
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} npm is not installed!"
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} npm $(npm --version)"
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}[SETUP]${NC} Installing dependencies..."
        npm install
    fi
}

fix_linux_sandbox() {
    echo -e "${BLUE}[FIX]${NC} Checking Linux sandbox configuration..."
    local current
    current=$(cat /proc/sys/kernel/unprivileged_userns_clone 2>/dev/null || echo "1")
    if [ "$current" = "0" ]; then
        echo -e "${YELLOW}[FIX]${NC} Enabling unprivileged user namespaces for Electron..."
        # Prompt for sudo normally — never embed passwords in scripts
        sudo sysctl -w kernel.unprivileged_userns_clone=1 2>/dev/null || true
    fi
    echo -e "${GREEN}[OK]${NC} Sandbox configuration ready"
}

# ============================================
# MAIN EXECUTION
# ============================================

cd "$(dirname "${BASH_SOURCE[0]}")"

print_header

echo -e "${BLUE}[INFO]${NC} Working directory: $(pwd)"
echo -e "${BLUE}[INFO]${NC} Configured ports:"
echo "  - Electron Debug:    $ELECTRON_DEBUG_PORT"
echo "  - Electron Inspect:  $ELECTRON_INSPECT_PORT"
echo "  - Electron Fallback: $ELECTRON_PORT"
echo ""

echo -e "${CYAN}━━━ CLEANUP PHASE ━━━${NC}"
kill_zombie_electrons
check_and_kill_port "$ELECTRON_DEBUG_PORT" "Electron Debug"
check_and_kill_port "$ELECTRON_INSPECT_PORT" "Electron Inspect"
check_and_kill_port "$ELECTRON_PORT" "Electron Fallback"
echo ""

echo -e "${CYAN}━━━ VERIFICATION PHASE ━━━${NC}"
check_dependencies
fix_linux_sandbox
echo ""

echo -e "${CYAN}━━━ LAUNCH PHASE ━━━${NC}"
echo -e "${GREEN}[START]${NC} Launching Dark Sticky Notes..."
echo -e "${BLUE}[NOTE]${NC} Transparency/GPU flags handled in main.js (works in packaged builds too)"
echo ""

export ELECTRON_DEBUG_PORT=$ELECTRON_DEBUG_PORT
export ELECTRON_INSPECT_PORT=$ELECTRON_INSPECT_PORT
export ELECTRON_PORT=$ELECTRON_PORT
export ELECTRON_FORCE_WINDOW_MENU_BAR=1
export ELECTRON_TRASH=gio

if [ "$1" = "--dev" ] || [ "$1" = "-d" ]; then
    echo -e "${MAGENTA}[MODE]${NC} Development mode with DevTools"
    NODE_ENV=development npx electron . --no-sandbox --remote-debugging-port="$ELECTRON_DEBUG_PORT" --inspect="$ELECTRON_INSPECT_PORT"
else
    echo -e "${GREEN}[MODE]${NC} Standard mode"
    npm run dev
fi
