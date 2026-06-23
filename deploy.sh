#!/usr/bin/env bash
#
# deploy.sh <repo-name> <visibility>
#
# Commits pending changes, creates the GitHub repo (if needed), pushes main,
# and prints the expected GitHub Pages URLs. Enabling Pages + the deploy
# workflow is handled separately (see README / the deploy steps).
#
# Examples:
#   ./deploy.sh task-mining-adoption public
#   ./deploy.sh my-dashboard private

set -euo pipefail

REPO="${1:-task-mining-adoption}"
VISIBILITY="${2:-public}"

if [[ "$VISIBILITY" != "public" && "$VISIBILITY" != "private" && "$VISIBILITY" != "internal" ]]; then
  echo "error: visibility must be 'public', 'private', or 'internal' (got '$VISIBILITY')" >&2
  exit 1
fi

# Resolve the authenticated GitHub owner.
if ! OWNER="$(gh api user --jq .login 2>/dev/null)"; then
  echo "error: not authenticated with GitHub CLI. Run: gh auth login" >&2
  exit 1
fi

echo "Owner:      $OWNER"
echo "Repo:       $REPO"
echo "Visibility: $VISIBILITY"
echo

# Ensure a valid git repository exists (the workspace .git was incomplete).
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Initializing git repository..."
  rm -rf .git
  git init -q
fi

# Work on main.
git checkout -q -B main

# Commit any pending changes.
git add -A
if git diff --cached --quiet; then
  echo "No pending changes to commit."
  if ! git rev-parse HEAD >/dev/null 2>&1; then
    git commit -q --allow-empty -m "$(cat <<'EOF'
Initial commit: Task Mining adoption dashboard

Includes-AI-Code: true
EOF
)"
  fi
else
  git commit -q -m "$(cat <<'EOF'
Set up GitHub Pages deploy for Task Mining adoption dashboard

Add static-export basePath, Pages Actions workflow, and deploy script.

Includes-AI-Code: true
EOF
)"
  echo "Committed pending changes."
fi

# Create the repo if it doesn't already exist; otherwise just wire up the remote.
if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  echo "Repo $OWNER/$REPO already exists; reusing it."
  if ! git remote get-url origin >/dev/null 2>&1; then
    git remote add origin "https://github.com/$OWNER/$REPO.git"
  fi
else
  echo "Creating repo $OWNER/$REPO ($VISIBILITY)..."
  gh repo create "$OWNER/$REPO" "--$VISIBILITY" --source=. --remote=origin
fi

echo "Pushing main..."
git push -u origin main

echo
echo "Done. Expected GitHub Pages URLs (live once the workflow finishes):"
echo "  Main dashboard: https://$OWNER.github.io/$REPO/"
