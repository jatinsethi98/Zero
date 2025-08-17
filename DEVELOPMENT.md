# Development Guide

## Development Server Behavior

When running `pnpm dev`, the development environment starts two concurrent processes:

1. **Mail App** (`apps/mail`): React Router dev server on port 3000
2. **Server App** (`apps/server`): Wrangler dev server on port 8787

### Current Issue: Non-Terminating Error Handling

**Problem**: Both dev servers are configured as persistent processes that continue running even when errors occur. This means:

- Errors are logged to the console but don't cause the process to terminate
- You need to manually monitor console output to catch errors
- The process appears to "hang" when waiting for it to terminate after errors
- No automatic error detection or process termination

### Current Configuration

**Root `turbo.json`**:
```json
{
  "dev": {
    "persistent": true,
    "cache": false
  }
}
```

**Mail App** (`apps/mail/package.json`):
```json
{
  "dev": "react-router dev"
}
```

**Server App** (`apps/server/package.json`):
```json
{
  "dev": "wrangler dev --port 8787 --show-interactive-dev-session=false --experimental-vectorize-bind-to-prod --env local"
}
```

## Solutions

### Option 1: Add Error Monitoring Scripts

Create wrapper scripts that monitor for errors and terminate appropriately:

```bash
# Add to root package.json scripts
"dev:monitored": "turbo run dev --parallel --continue",
"dev:mail": "pnpm --filter=@zero/mail dev",
"dev:server": "pnpm --filter=@zero/server dev"
```

### Option 2: Use Process Managers

Use tools like `concurrently` with error handling:

```json
{
  "dev:concurrent": "concurrently --kill-others-on-fail --prefix-colors \"blue.bold,green.bold\" --names \"MAIL,SERVER\" \"pnpm --filter=@zero/mail dev\" \"pnpm --filter=@zero/server dev\""
}
```

### Option 3: Add Error Detection to Individual Apps

Modify the dev scripts to include error detection:

**For Mail App**:
```json
{
  "dev": "react-router dev --on-error-exit"
}
```

**For Server App**:
```json
{
  "dev": "wrangler dev --port 8787 --show-interactive-dev-session=false --experimental-vectorize-bind-to-prod --env local --on-error-exit"
}
```

### Option 4: Use Development Tools

Consider using development tools that provide better error handling:

- **PM2**: Process manager with restart policies
- **nodemon**: File watching with error handling
- **tsx**: TypeScript execution with error handling

## Recommended Approach

1. **For immediate use**: Run individual apps separately to isolate errors:
   ```bash
   # Terminal 1
   pnpm --filter=@zero/server dev
   
   # Terminal 2  
   pnpm --filter=@zero/mail dev
   ```

2. **For long-term**: Implement Option 2 with `concurrently` for better error handling and process management.

## Monitoring Tips

- Use `--verbose` flags when available to get more detailed error information
- Set up log aggregation to capture errors from both processes
- Consider using development tools that provide better error reporting
- Monitor both terminal outputs simultaneously or use a tool like `tmux` for split-screen development
