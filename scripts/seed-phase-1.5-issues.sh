#!/usr/bin/env bash
set -euo pipefail

# 检查依赖
command -v git >/dev/null 2>&1 || { echo "git not found"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "gh not found"; exit 1; }

# 仓库根目录
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

# Docs 目录
DOCS_DIR=docs/phase-1.5
[[ ! -d "$DOCS_DIR" ]] && echo "Docs directory not found: $DOCS_DIR" && exit 1

# 存储创建的 issue URL
created_urls=()

# ------------------------------
# 函数：确保 label 存在
# ------------------------------
ensure_label_exists() {
    local label="$1"
    local color="$2"
    local description="$3"

    if gh label view "$label" >/dev/null 2>&1; then
        echo "label exists: $label"
    else
        gh label create "$label" --color "$color" --description "$description"
        echo "label created: $label"
    fi
}

# ------------------------------
# 确保所有必需 label 存在
# ------------------------------
ensure_required_labels() {
    ensure_label_exists "phase-1.5" 5319e7 "Phase 1.5 backlog issue"
    ensure_label_exists "ci" 0e8a16 "Continuous integration work"
    ensure_label_exists "test" bfdadc "Test-related work"
    ensure_label_exists "docs" 5319e7 "Documentation"
    ensure_label_exists "chore" f9d0c4 "Chore / maintenance"
    ensure_label_exists "ux" ffeeba "UX / frontend"
}

ensure_required_labels

# ------------------------------
# 遍历 markdown 文件，创建 backlog issue
# ------------------------------
for md_file in "$DOCS_DIR"/*.md; do
    # 提取 Title
    title=$(grep -m1 -E '^Title: |^# ' "$md_file" | sed 's/^Title: //; s/^# //')
    # 提取 Body
    body=$(sed -n '/^Title: /{n;:a;p;n;ba}' "$md_file")

    # 检查是否已有相同 title 的 issue（包括 closed issue）
    existing=$(gh issue list --state all --search "$title in:title" --limit 1 --json url --jq '.[0].url // ""')
    if [[ -n "$existing" ]]; then
        echo "exists: $title ($existing)"
        continue
    fi

    # 根据文件名分配 label
    case $(basename "$md_file") in
        01-ci.md) label="ci" ;;
        02-e2e-smoke.md) label="test" ;;
        03-readme-safety-contract.md) label="docs" ;;
        04-logger-levels.md) label="chore" ;;
        05-task-ui-refresh.md) label="ux" ;;
        *) label="phase-1.5" ;;
    esac

    # 创建 issue
    url=$(gh issue create \
        --title "$title" \
        --body "$body" \
        --label "phase-1.5,$label" \
        --json url --jq '.url')

    created_urls+=("$url")
    echo "created: $url"
done

# 打印所有创建的 issue URL
echo "All created issue URLs:"
for url in "${created_urls[@]}"; do
    echo "$url"
done
