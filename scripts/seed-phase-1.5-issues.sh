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
shopt -s nullglob

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
# 遍历 numbered markdown spec files，创建 backlog issue
# ------------------------------
spec_files=("$DOCS_DIR"/[0-9][0-9]-*.md)
if ((${#spec_files[@]} == 0)); then
    echo "No phase 1.5 spec files found in: $DOCS_DIR" >&2
    exit 1
fi

for md_file in "${spec_files[@]}"; do
    # 提取 Title 与 Body，支持 `Title:` front matter 或一级 Markdown 标题。
    title_line_num=$(grep -n -m1 -E '^(Title: |# )' "$md_file" | cut -d: -f1 || true)
    if [[ -z "$title_line_num" ]]; then
        echo "Missing title in $md_file. Expected a line starting with 'Title: ' or '# '." >&2
        exit 1
    fi

    title_line=$(sed -n "${title_line_num}p" "$md_file")
    title=${title_line#Title: }
    title=${title#\# }
    body=$(tail -n +$((title_line_num + 1)) "$md_file")

    if [[ -z "$title" || -z "$body" ]]; then
        echo "Invalid issue content in $md_file: title and body are required." >&2
        exit 1
    fi

    # 检查是否已有完全相同 title 的 issue（包括 closed issue）
    search_title=${title//\"/ }
    existing=$(
        gh issue list \
            --state all \
            --search "\"$search_title\" in:title" \
            --limit 20 \
            --json title,url \
            --template '{{range .}}{{printf "%s\t%s\n" .title .url}}{{end}}' |
            while IFS=$'\t' read -r candidate_title candidate_url; do
                if [[ "$candidate_title" == "$title" ]]; then
                    printf '%s\n' "$candidate_url"
                    break
                fi
            done
    )
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

    labels="phase-1.5"
    if [[ "$label" != "phase-1.5" ]]; then
        labels="$labels,$label"
    fi

    # 创建 issue
    url=$(gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        --json url --jq '.url')

    created_urls+=("$url")
    echo "created: $url"
done

# 打印所有创建的 issue URL
echo "All created issue URLs:"
for url in "${created_urls[@]}"; do
    echo "$url"
done
