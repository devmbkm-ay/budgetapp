# ============================================================
# TEMPLATE: bunfig.toml (Apps level - e.g., apps/api/bunfig.toml)
# This file configures Bun's behavior for individual apps within the monorepo
# ============================================================

[resolve]
# Reference the root node_modules from the app directory
root = "/app"

# Module aliases for imports
alias = { 
  "@/*" = "/app/packages/",
  "@db/*" = "/app/packages/database/",
  "@lib/*" = "/app/lib/"
}

# Allow relative imports to parent packages
allowRelativeImports = true

[define]
# Define environment variables that are injected at build time
__APP_NAME__ = "\"api\""
__APP_VERSION__ = "\"1.0.0\""
