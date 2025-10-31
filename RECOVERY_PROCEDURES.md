# Recovery Procedures & Crash Resilience

## Overview
This document provides comprehensive recovery procedures for handling development interruptions, including VS Code crashes, system failures, and workflow recovery protocols.

## State Recovery System

### Development State Tracking

#### Project State Checkpoint
Create automatic project state tracking to recover from crashes:

```json
// .development-state.json (Auto-generated)
{
  "lastActivity": "2023-10-23T14:30:00Z",
  "currentTask": "implementing-product-catalog",
  "activeFiles": [
    "src/components/ProductCard.tsx",
    "src/hooks/useProducts.ts",
    "src/app/products/page.tsx"
  ],
  "todoStatus": {
    "completed": ["setup-database", "create-auth"],
    "inProgress": ["implement-product-catalog"],
    "pending": ["add-cart-functionality", "payment-integration"]
  },
  "environmentState": {
    "database": "connected",
    "servers": ["dev-server-running"],
    "dependencies": "installed"
  },
  "lastCommit": "abc123",
  "unstageChanges": true,
  "workingBranch": "feature/product-catalog"
}
```

#### Recovery State Script
```bash
#!/bin/bash
# save-development-state.sh

# Save current development state
echo "Saving development state..."

# Get current git status
git status --porcelain > .git-status.backup
git stash push -m "Auto-stash before crash - $(date)"

# Save VS Code workspace state
cp .vscode/settings.json .vscode/settings.backup.json 2>/dev/null || true

# Save current terminal sessions
if command -v tmux &> /dev/null; then
    tmux list-sessions > .tmux-sessions.backup 2>/dev/null || true
fi

# Save current npm/node processes
ps aux | grep -E "(node|npm)" > .node-processes.backup

# Save environment variables
env | grep -E "(NEXT_|SUPABASE_|RAZORPAY_)" > .env.backup

echo "Development state saved successfully"
```

#### Recovery Script
```bash
#!/bin/bash
# recover-development-state.sh

echo "Starting development recovery..."

# Check for git stashes
STASH_COUNT=$(git stash list | wc -l)
if [ $STASH_COUNT -gt 0 ]; then
    echo "Found git stashes. Latest stash:"
    git stash list | head -1
    read -p "Restore latest stash? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash pop
    fi
fi

# Restore VS Code settings
if [ -f .vscode/settings.backup.json ]; then
    cp .vscode/settings.backup.json .vscode/settings.json
    echo "VS Code settings restored"
fi

# Check and restore development servers
if [ -f package.json ]; then
    echo "Installing dependencies..."
    npm install

    echo "Starting development server..."
    npm run dev &
    DEV_PID=$!
    echo "Development server started (PID: $DEV_PID)"
fi

# Restore environment
if [ -f .env.backup ]; then
    echo "Environment variables backup found"
    echo "Please verify .env.local matches .env.backup"
fi

echo "Recovery completed. Development environment ready."
```

### VS Code Recovery Procedures

#### Automatic Workspace Recovery
Create `.vscode/tasks.json` for automated recovery:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Save Development State",
      "type": "shell",
      "command": "./scripts/save-development-state.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Recover Development State",
      "type": "shell",
      "command": "./scripts/recover-development-state.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": true,
        "panel": "shared"
      }
    },
    {
      "label": "Quick Setup",
      "type": "shell",
      "command": "npm install && npm run dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

#### Auto-save Configuration
Configure `.vscode/settings.json` for maximum crash resilience:

```json
{
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "editor.formatOnSave": true,
  "git.autofetch": true,
  "git.autoStash": true,
  "terminal.integrated.persistentSessionReviveProcess": "onExit",
  "workbench.settings.enableNaturalLanguageSearch": false,
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "extensions.autoUpdate": true,
  "files.exclude": {
    "**/.git": false,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/*.backup": false
  }
}
```

## Task Recovery System

### TodoWrite Recovery Integration
Enhanced TodoWrite system with crash recovery:

```typescript
// lib/todo-recovery.ts
interface TodoRecoveryState {
  todos: Todo[];
  lastUpdate: string;
  sessionId: string;
  backupCount: number;
}

export class TodoRecoveryManager {
  private static readonly STORAGE_KEY = 'lumidumi-todo-recovery';
  private static readonly MAX_BACKUPS = 10;

  static saveTodoState(todos: Todo[]): void {
    const recovery: TodoRecoveryState = {
      todos,
      lastUpdate: new Date().toISOString(),
      sessionId: this.getSessionId(),
      backupCount: this.getBackupCount() + 1
    };

    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recovery));

    // Save to file system (if in development)
    if (process.env.NODE_ENV === 'development') {
      this.saveToFile(recovery);
    }
  }

  static recoverTodoState(): Todo[] | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const recovery: TodoRecoveryState = JSON.parse(stored);

      // Check if recovery is recent (within last hour)
      const lastUpdate = new Date(recovery.lastUpdate);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 1) {
        return recovery.todos;
      }
    } catch (error) {
      console.error('Failed to recover todo state:', error);
    }
    return null;
  }

  private static saveToFile(recovery: TodoRecoveryState): void {
    const fs = require('fs').promises;
    const path = require('path');

    const backupDir = path.join(process.cwd(), '.recovery');
    const filename = `todos-${recovery.sessionId}.json`;

    fs.mkdir(backupDir, { recursive: true })
      .then(() => fs.writeFile(path.join(backupDir, filename), JSON.stringify(recovery, null, 2)))
      .catch(console.error);
  }
}
```

### Development Session Recovery

#### Session Management
```typescript
// lib/session-manager.ts
export class DevelopmentSession {
  private static SESSION_KEY = 'lumidumi-dev-session';

  static startSession(task: string): string {
    const sessionId = Date.now().toString();
    const session = {
      id: sessionId,
      startTime: new Date().toISOString(),
      currentTask: task,
      status: 'active'
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return sessionId;
  }

  static endSession(): void {
    const session = this.getCurrentSession();
    if (session) {
      session.endTime = new Date().toISOString();
      session.status = 'completed';
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
  }

  static recoverSession(): any | null {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored);
      if (session.status === 'active') {
        return session;
      }
    } catch (error) {
      console.error('Failed to recover session:', error);
    }
    return null;
  }
}
```

## Database Recovery

### Connection Recovery
```typescript
// lib/db-recovery.ts
export class DatabaseRecovery {
  private static retryAttempts = 3;
  private static retryDelay = 1000;

  static async ensureConnection(supabase: SupabaseClient): Promise<boolean> {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id')
          .limit(1);

        if (!error) {
          console.log('Database connection verified');
          return true;
        }

        console.warn(`Database connection attempt ${attempt} failed:`, error);
      } catch (error) {
        console.error(`Database connection attempt ${attempt} error:`, error);
      }

      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }

    console.error('Failed to establish database connection after all attempts');
    return false;
  }

  static async recoverQueries(failedQueries: any[]): Promise<void> {
    console.log('Attempting to recover failed queries...');

    for (const query of failedQueries) {
      try {
        // Implement query retry logic based on query type
        await this.retryQuery(query);
      } catch (error) {
        console.error('Failed to recover query:', query, error);
      }
    }
  }
}
```

## Development Workflow Recovery

### Step-by-Step Recovery Process

#### 1. Initial Assessment
```bash
#!/bin/bash
# assess-crash-state.sh

echo "=== CRASH RECOVERY ASSESSMENT ==="
echo "Time: $(date)"
echo

# Check git status
echo "Git Status:"
git status --short
echo

# Check for uncommitted changes
UNCOMMITTED=$(git diff --cached --name-only | wc -l)
if [ $UNCOMMITTED -gt 0 ]; then
    echo "⚠️  Found $UNCOMMITTED staged files"
    git diff --cached --name-only
fi

# Check for unstaged changes
UNSTAGED=$(git diff --name-only | wc -l)
if [ $UNSTAGED -gt 0 ]; then
    echo "⚠️  Found $UNSTAGED unstaged files"
    git diff --name-only
fi

# Check for stashes
STASHES=$(git stash list | wc -l)
if [ $STASHES -gt 0 ]; then
    echo "📦 Found $STASHES stash(es)"
    git stash list
fi

# Check running processes
echo
echo "Node.js processes:"
ps aux | grep -E "(node|npm)" | grep -v grep || echo "No Node.js processes running"

# Check ports
echo
echo "Port usage:"
lsof -i :3000 || echo "Port 3000 is free"
lsof -i :3001 || echo "Port 3001 is free"
```

#### 2. Environment Recovery
```bash
#!/bin/bash
# recover-environment.sh

echo "=== ENVIRONMENT RECOVERY ==="

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check environment variables
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found"
    if [ -f ".env.backup" ]; then
        echo "Restoring from backup..."
        cp .env.backup .env.local
    else
        echo "Please create .env.local with required variables"
    fi
fi

# Verify database connection
npm run db:check 2>/dev/null || echo "Database check failed - please verify connection"

# Start development server
echo "Starting development server..."
npm run dev &
DEV_PID=$!
echo "Development server PID: $DEV_PID"

# Save PID for cleanup
echo $DEV_PID > .dev-server.pid
```

#### 3. Code Recovery
```bash
#!/bin/bash
# recover-code-state.sh

echo "=== CODE STATE RECOVERY ==="

# Show recent commits
echo "Recent commits:"
git log --oneline -5

# Show current branch
echo "Current branch: $(git branch --show-current)"

# Check for backup files
echo
echo "Backup files found:"
find . -name "*.backup.*" -o -name "*-backup.*" | head -10

# Check for auto-saved files
if [ -d ".vscode" ]; then
    echo
    echo "VS Code workspace files:"
    ls -la .vscode/
fi

# Offer recovery options
echo
echo "Recovery options:"
echo "1. Continue from current state"
echo "2. Restore from latest stash"
echo "3. Reset to last commit"
echo "4. Manual review needed"
```

### Agent Coordination Recovery

#### Multi-Agent State Recovery
```typescript
// lib/agent-recovery.ts
interface AgentState {
  agentType: string;
  currentTask: string;
  completedTasks: string[];
  nextTasks: string[];
  lastActivity: string;
  status: 'active' | 'idle' | 'error' | 'recovering';
}

export class AgentRecoveryManager {
  private static RECOVERY_KEY = 'lumidumi-agent-recovery';

  static saveAgentStates(agents: AgentState[]): void {
    const recovery = {
      agents,
      timestamp: new Date().toISOString(),
      projectPhase: this.getCurrentPhase()
    };

    localStorage.setItem(this.RECOVERY_KEY, JSON.stringify(recovery));
  }

  static recoverAgentStates(): AgentState[] | null {
    try {
      const stored = localStorage.getItem(this.RECOVERY_KEY);
      if (!stored) return null;

      const recovery = JSON.parse(stored);

      // Validate recovery data is recent
      const timestamp = new Date(recovery.timestamp);
      const now = new Date();
      const hoursAgo = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

      if (hoursAgo < 2) { // Recovery valid for 2 hours
        return recovery.agents;
      }
    } catch (error) {
      console.error('Failed to recover agent states:', error);
    }
    return null;
  }

  static getCurrentPhase(): string {
    // Determine current development phase based on project state
    if (!require('fs').existsSync('src/app')) return 'setup';
    if (!require('fs').existsSync('src/components')) return 'foundation';
    if (!require('fs').existsSync('src/hooks')) return 'development';
    return 'integration';
  }
}
```

## File Recovery Procedures

### Auto-backup System
```bash
#!/bin/bash
# setup-auto-backup.sh

# Create backup directory
mkdir -p .backups

# Setup git hooks for auto-backup
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Auto-backup before commit

BACKUP_DIR=".backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup staged files
git diff --cached --name-only | while read file; do
    if [ -f "$file" ]; then
        mkdir -p "$BACKUP_DIR/$(dirname "$file")"
        cp "$file" "$BACKUP_DIR/$file"
    fi
done

echo "Pre-commit backup created: $BACKUP_DIR"
EOF

chmod +x .git/hooks/pre-commit

# Setup periodic backup cron job (optional)
echo "0 */2 * * * cd $(pwd) && ./scripts/create-backup.sh" | crontab -
```

### Recovery Point Creation
```bash
#!/bin/bash
# create-recovery-point.sh

RECOVERY_POINT="recovery-$(date +%Y%m%d_%H%M%S)"

echo "Creating recovery point: $RECOVERY_POINT"

# Create recovery branch
git checkout -b "$RECOVERY_POINT"

# Commit current state
git add .
git commit -m "Recovery point: $RECOVERY_POINT

Auto-generated recovery point including:
- All current changes
- Development state
- Configuration files"

# Return to original branch
git checkout -

echo "Recovery point created: $RECOVERY_POINT"
echo "To restore: git checkout $RECOVERY_POINT"
```

## Emergency Recovery Checklist

### Immediate Actions (First 5 minutes)
- [ ] Save any open files immediately
- [ ] Check git status for uncommitted changes
- [ ] Stash changes if needed: `git stash push -m "emergency stash"`
- [ ] Note current task and progress
- [ ] Check if development server is still running

### Assessment Phase (Next 10 minutes)
- [ ] Run crash assessment script
- [ ] Check for backup files and recovery points
- [ ] Verify database connectivity
- [ ] Review todo list state
- [ ] Identify last known good state

### Recovery Phase (Next 15 minutes)
- [ ] Restore environment variables
- [ ] Reinstall dependencies if needed
- [ ] Recover code from stash/backup
- [ ] Restart development servers
- [ ] Verify application functionality

### Continuation Phase
- [ ] Update project documentation with current state
- [ ] Commit recovered changes
- [ ] Resume development from last checkpoint
- [ ] Update team on recovery status

## Prevention Strategies

### Automated Safeguards
```json
// package.json scripts
{
  "scripts": {
    "dev": "npm run save-state && next dev",
    "build": "npm run save-state && next build",
    "save-state": "node scripts/save-development-state.js",
    "recover": "node scripts/recover-development-state.js",
    "backup": "bash scripts/create-backup.sh",
    "emergency-save": "git add . && git stash push -m 'Emergency save $(date)'"
  }
}
```

### Monitoring Setup
```typescript
// lib/crash-detection.ts
export class CrashDetection {
  static setupCrashDetection(): void {
    // Detect unhandled errors
    window.addEventListener('error', this.handleError);
    window.addEventListener('unhandledrejection', this.handleRejection);

    // Periodic state saving
    setInterval(() => {
      this.saveCurrentState();
    }, 30000); // Every 30 seconds

    // Before unload protection
    window.addEventListener('beforeunload', (e) => {
      this.saveCurrentState();
      e.returnValue = 'Are you sure you want to leave? Unsaved changes may be lost.';
    });
  }

  private static handleError(error: ErrorEvent): void {
    console.error('Unhandled error detected:', error);
    this.saveEmergencyState();
  }

  private static saveEmergencyState(): void {
    // Save current application state for recovery
    const state = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      // Add more context as needed
    };

    localStorage.setItem('emergency-recovery', JSON.stringify(state));
  }
}
```

This comprehensive recovery system ensures that development can be resumed quickly from any point of failure, maintaining productivity and preventing loss of work.