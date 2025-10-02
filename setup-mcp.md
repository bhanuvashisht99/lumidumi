# Supabase MCP Setup Guide

## What is MCP?

Model Context Protocol (MCP) allows Claude to directly interact with external services like Supabase, enabling direct database operations without writing API calls.

## Setup Instructions

### 1. Copy Configuration File

Copy `claude_desktop_config.json` to your Claude Desktop config directory:

**macOS:**
```bash
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/
```

**Windows:**
```bash
copy claude_desktop_config.json %APPDATA%\Claude\
```

**Linux:**
```bash
cp claude_desktop_config.json ~/.config/Claude/
```

### 2. Update with Your Supabase Credentials

Edit the copied file and replace:
- `your_supabase_project_url` with your actual Supabase URL
- `your_supabase_service_role_key` with your actual service role key

### 3. Restart Claude Desktop

After updating the configuration, restart Claude Desktop completely for the MCP server to load.

### 4. Verify MCP Integration

Once MCP is set up, Claude will be able to:

- **Query Database**: Run SQL queries directly on your Supabase database
- **Insert Data**: Add new products, orders, customers directly
- **Update Records**: Modify existing data without API calls
- **Real-time Operations**: Perform database operations in real-time

## Example MCP Operations

With MCP enabled, you can ask Claude to:

```
"Add a new product called 'Rose Garden' with price ₹850 to the database"
```

```
"Show me all orders from the last week"
```

```
"Update the stock for 'Vanilla Dreams' to 20 units"
```

## Benefits of MCP Integration

1. **Direct Database Access**: No need to write API endpoints
2. **Real-time Data**: Instant database operations
3. **Simplified Development**: Claude can manage data directly
4. **Better Debugging**: Direct SQL query execution
5. **Faster Prototyping**: Immediate data manipulation

## Security Note

The service role key has elevated permissions. Only use MCP in development or with proper security measures in production.

## Alternative: Manual Supabase Integration

If you prefer not to use MCP, you can continue using the manual Supabase client integration already set up in the project (`src/lib/supabase.ts`).