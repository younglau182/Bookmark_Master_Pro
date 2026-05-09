#!/usr/bin/env bash
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "error: git is required to locate the repository root" >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

if ! command -v gh >/dev/null 2>&1; then
  echo "error: GitHub CLI (gh) is required. Install gh and run 'gh auth login' locally before using this script." >&2
  exit 1
fi

DOCS_DIR="docs/phase-1.5"
if [[ ! -d "$DOCS_DIR" ]]; then
  echo "error: $DOCS_DIR does not exist. Run this script from the Bookmark Master Pro repository after adding Phase 1.5 docs." >&2
  exit 1
fi

created_urls=()

ensure_label_exists() {
  local label="$1"
  local color="$2"
  local description="$3"

  if gh label view "$label" >/dev/null 2>&1; then
    echo "label exists: $label"
    return 0
  fi

  gh label create "$label" --color "$color" --description "$description" >/dev/null
  echo "label created: $label"
}

ensure_required_labels() {
  ensure_label_exists "phase-1.5" "5319e7" "Phase 1.5 backlog issue"
  ensure_label_exists "ci" "0e8a16" "Continuous integration work"
  ensure_label_exists "test" "1d76db" "Testing and validation work"
  ensure_label_exists "docs" "0075ca" "Documentation work"
  ensure_label_exists "chore" "fef2c0" "Maintenance and cleanup work"
  ensure_label_exists "ux" "fbca04" "User experience work"
}

extract_title() {
  local file="$1"
  local title

  title="$(awk '/^Title: / { sub(/^Title: /, ""); print; exit }' "$file")"
  if [[ -z "$title" ]]; then
    title="$(awk '/^# / { sub(/^# /, ""); print; exit }' "$file")"
  fi

  if [[ -z "$title" ]]; then
    echo "error: unable to extract issue title from $file" >&2
    return 1
  fi

  printf '%s\n' "$title"
}

write_body_without_title() {
  local file="$1"
  local body_file="$2"

  awk '
    BEGIN { skipped = 0 }
    /^Title: / && skipped == 0 { skipped = 1; next }
    /^# / && skipped == 0 { skipped = 1; next }
    { print }
  ' "$file" > "$body_file"
}

create_issue_from_spec() {
  local file="$1"
  local label="$2"
  local title
  local existing
  local body_file
  local issue_url

  title="$(extract_title "$file")"
  echo "Checking: $title"

  existing="$(gh issue list --state all --search "$title in:title" --limit 1 --json url --jq '.[0].url // ""')"
  if [[ -n "$existing" ]]; then
    echo "exists: $title ($existing)"
    return 0
  fi

  body_file="$(mktemp)"
  trap 'rm -f "$body_file"' RETURN
  write_body_without_title "$file" "$body_file"

  issue_url="$(gh issue create --title "$title" --body-file "$body_file" --label "phase-1.5" --label "$label")"
  created_urls+=("$issue_url")
  echo "created: $issue_url"
}

ensure_required_labels

create_issue_from_spec "$DOCS_DIR/01-ci.md" "ci"
create_issue_from_spec "$DOCS_DIR/02-e2e-smoke.md" "test"
create_issue_from_spec "$DOCS_DIR/03-readme-safety-contract.md" "docs"
create_issue_from_spec "$DOCS_DIR/04-logger-levels.md" "chore"
create_issue_from_spec "$DOCS_DIR/05-task-ui-refresh.md" "ux"

echo
if [[ "${#created_urls[@]}" -eq 0 ]]; then
  echo "No new issues created."
else
  echo "Created issue URLs:"
  printf '%s\n' "${created_urls[@]}"
fi
