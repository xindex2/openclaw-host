#!/bin/bash
# OpenClaw Host Provisioning: Shared Core Architecture
# This script sets up a single, shared directory for Homebrew and Node.js
# to be mounted by all agent containers, saving 1.9TB of disk space for 1000 agents.

set -e

CORE_DIR="/opt/openclaw-core"
BREW_DIR="$CORE_DIR/linuxbrew"
NODE_DIR="$CORE_DIR/node"

echo "🚀 Starting Shared Core Provisioning..."

# 1. Create Core Directory and detect user
echo "🔍 Detecting user..."
REAL_USER=$USER
if [ "$EUID" -eq 0 ]; then
    REAL_USER="ubuntu" # Default to ubuntu on most VPS
    echo "⚠️ Running as root. Will use '$REAL_USER' for Homebrew."
fi

sudo mkdir -p "$CORE_DIR"
sudo chown -R "$REAL_USER":"$REAL_USER" "$CORE_DIR"

# 2. Install Homebrew (into shared dir)
if [ ! -d "$BREW_DIR" ]; then
    echo "📦 Installing Shared Homebrew..."
    if [ "$EUID" -eq 0 ]; then
        sudo -u "$REAL_USER" git clone https://github.com/Homebrew/brew "$BREW_DIR"
        # Setup environment
        export PATH="$BREW_DIR/bin:$PATH"
        sudo -u "$REAL_USER" bash -c "export PATH=$BREW_DIR/bin:\$PATH && brew update --force --quiet"
    else
        git clone https://github.com/Homebrew/brew "$BREW_DIR"
        export PATH="$BREW_DIR/bin:$PATH"
        brew update --force --quiet
    fi
else
    echo "✅ Shared Homebrew already exists."
fi

# 3. Install Node.js (into shared dir)
if [ ! -d "$NODE_DIR" ]; then
    echo "📦 Installing Shared Node.js 22..."
    mkdir -p "$NODE_DIR"
    curl -fsSL https://nodejs.org/dist/v22.13.1/node-v22.13.1-linux-x64.tar.xz | tar -xJ --strip-components=1 -C "$NODE_DIR"
else
    echo "✅ Shared Node.js already exists."
fi

# 4. Install OpenClaw CLI (into shared dir)
echo "📦 Installing Shared OpenClaw CLI..."
mkdir -p "$CORE_DIR/npm-global"
if [ "$EUID" -eq 0 ]; then
    sudo -u "$REAL_USER" bash -c "export PATH=$NODE_DIR/bin:\$PATH && $NODE_DIR/bin/npm install -g openclaw --prefix $CORE_DIR/npm-global"
else
    export PATH="$NODE_DIR/bin:$PATH"
    "$NODE_DIR/bin/npm" install -g openclaw --prefix "$CORE_DIR/npm-global"
fi

# 5. Create Unified Binary Directory
echo "🔗 Creating Unified Binary Links..."
mkdir -p "$CORE_DIR/bin"
ln -sf "$NODE_DIR/bin/node" "$CORE_DIR/bin/node"
ln -sf "$NODE_DIR/bin/npm" "$CORE_DIR/bin/npm"
ln -sf "$BREW_DIR/bin/brew" "$CORE_DIR/bin/brew"

# Safely find the openclaw binary (NPM prefix structure can vary)
echo "🔎 Locating openclaw binary..."
OC_BIN=$(find "$CORE_DIR/npm-global" -name openclaw -type f -executable | head -n 1 || true)

if [ -n "$OC_BIN" ]; then
    echo "  [FOUND] $OC_BIN"
    ln -sf "$OC_BIN" "$CORE_DIR/bin/openclaw"
else
    # Fallback/Retry without prefix if needed, or check common locations
    echo "  [RETRY] Manual search in $CORE_DIR/npm-global/bin/openclaw"
    if [ -f "$CORE_DIR/npm-global/bin/openclaw" ]; then
         ln -sf "$CORE_DIR/npm-global/bin/openclaw" "$CORE_DIR/bin/openclaw"
    fi
fi

# --- NEW: Base Dependencies & Common Skills ---
echo "📦 Pre-installing Base Dependencies (Ruby, etc.) and Common Skills..."
if [ "$EUID" -eq 0 ]; then
    # Install Ruby first
    sudo -u "$REAL_USER" bash -c "export PATH=$CORE_DIR/bin:\$PATH && brew install ruby"
    
    # Pre-install common skills in shared core (saves space and fixes RO issues)
    echo "  [SKILLS] Installing common OpenClaw skills..."
    sudo -u "$REAL_USER" bash -c "export PATH=$CORE_DIR/bin:\$PATH && export npm_config_prefix=$CORE_DIR/npm-global && \
        $CORE_DIR/bin/npm install -g himalaya \
        openai-image-gen \
        mcporter \
        model-usage \
        video-frames"
    
    # Pre-install base tools (uv, etc)
    sudo -u "$REAL_USER" bash -c "export PATH=$CORE_DIR/bin:\$PATH && brew install uv"
else
    export PATH="$CORE_DIR/bin:$PATH"
    brew install ruby
    
    echo "  [SKILLS] Installing common OpenClaw skills..."
    export npm_config_prefix="$CORE_DIR/npm-global"
    "$CORE_DIR/bin/npm" install -g himalaya \
        openai-image-gen \
        mcporter \
        model-usage \
        video-frames
        
    brew install uv
fi
ln -sf "$BREW_DIR/bin/ruby" "$CORE_DIR/bin/ruby"
ln -sf "$BREW_DIR/bin/uv" "$CORE_DIR/bin/uv"
# --------------------------------------------------

# 6. Fix Permissions for Mounting
echo "🔐 Setting final permissions..."
sudo chown -R 1000:1000 "$CORE_DIR"

echo ""
echo "✅ Shared Core Provisioned at: $CORE_DIR"
echo "--------------------------------------------------"
echo "🚀 VERIFICATION:"
if [ -f "$CORE_DIR/bin/openclaw" ]; then
    echo "  [OK] OpenClaw CLI ready at $CORE_DIR/bin/openclaw"
    # Ensure verification uses the internal path
    export PATH="$CORE_DIR/bin:$PATH"
    echo "  [CHECK] Node Version: $(node -v)"
    echo "  [CHECK] OpenClaw Version: $(openclaw --version)"
else
    echo "  [FAIL] OpenClaw CLI NOT found!"
    echo "  Contents of $CORE_DIR/bin:"
    ls -l "$CORE_DIR/bin"
fi

echo ""
echo "Next: RESTART your agents to pick up the new PATH."
