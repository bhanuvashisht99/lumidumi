#!/bin/bash

# Lumidumi MCP Setup Script for macOS
echo "🕯️ Lumidumi MCP Setup for macOS"
echo "================================="

# Check if Claude directory exists
CLAUDE_DIR="$HOME/Library/Application Support/Claude"
if [ ! -d "$CLAUDE_DIR" ]; then
    echo "❌ Claude Desktop directory not found. Please install Claude Desktop first."
    exit 1
fi

echo "✅ Claude Desktop directory found"

# Check if config file exists
CONFIG_FILE="$CLAUDE_DIR/claude_desktop_config.json"
if [ -f "$CONFIG_FILE" ]; then
    echo "✅ MCP configuration file already exists"
    echo "📁 Location: $CONFIG_FILE"
else
    echo "❌ MCP configuration file not found"
    echo "Run: cp claude_desktop_config.json '$CLAUDE_DIR/'"
    exit 1
fi

# Verify Supabase MCP server can be installed
echo "🔍 Testing Supabase MCP server installation..."
npx -y @supabase/mcp-server-supabase@latest --version 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Supabase MCP server is accessible"
else
    echo "⚠️  Supabase MCP server installation may have issues"
fi

echo ""
echo "📋 Next Steps:"
echo "1. ✅ MCP config file is in place"
echo "2. 🔄 Restart Claude Desktop completely (Cmd+Q then reopen)"
echo "3. 🧪 Test MCP by asking Claude to query your database"
echo ""
echo "🧪 Test Commands to try in Claude:"
echo "• 'Show me all tables in my Supabase database'"
echo "• 'Query the products table'"
echo "• 'Insert a test product into the database'"
echo ""
echo "🎯 Your Supabase Project: https://krhzruqeoubnvuvbazmo.supabase.co"
echo ""
echo "Happy candle making! 🕯️✨"