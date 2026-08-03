# ==========================================================
# VeriFace AI
# Development Commands
# ==========================================================

.PHONY: check backend frontend clean

# ----------------------------------------------------------
# Verify Entire Project
# ----------------------------------------------------------

check:
	./scripts/check_project.sh

# ----------------------------------------------------------
# Verify Backend Only
# ----------------------------------------------------------

backend:
	./scripts/check_backend.sh

# ----------------------------------------------------------
# Verify Frontend Only
# ----------------------------------------------------------

frontend:
	cd frontend && npm run verify

# ----------------------------------------------------------
# Cleanup
# ----------------------------------------------------------

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +
	find . -type d -name "dist" -exec rm -rf {} +
	find . -type d -name "node_modules/.vite" -exec rm -rf {} +