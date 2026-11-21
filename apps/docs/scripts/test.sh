#!/usr/bin/env bash
# The docs' tests: the node tests, then the kit's browser tests (Playwright).
#
# With CHANGED_BASE set to a git ref, the browser tests run per component: only the specs and
# glass contrast pages of the components changed since that base, plus the deploy check. A component's
# files are its src/<name>.tsx and styles/elements/<name>.css, its examples, docs page,
# spec and harness. Any other change (tokens, themes, a module several components
# share, the docs app, the test setup) or in a root file runs every browser test, as does
# `pnpm test` with no base.
#
# With TEST_SHARD=<n>/<total>, as a CI test matrix sets it, the browser tests run as that
# Playwright shard, and the node tests run in shard 1 only.
set -euo pipefail
cd "$(dirname "$0")/.."
top=$(git rev-parse --show-toplevel)

shard=()
if [ -n "${TEST_SHARD:-}" ]; then
  shard=(--shard="$TEST_SHARD")
  echo "Browser test shard $TEST_SHARD"
fi
case ${TEST_SHARD:-1/} in 1/*) node --test src/*.test.ts ;; esac

playwright install chromium

[ -n "${CHANGED_BASE:-}" ] || exec playwright test "${shard[@]}"

# Shared by every component, though each has a page of its own.
shared=" focus-ring "

# The modules of src that import this one, directly or through another, one per line.
importers() {
  local queue=("$1") seen=" $1 " module file name
  while [ ${#queue[@]} -gt 0 ]; do
    module=${queue[0]}
    queue=("${queue[@]:1}")
    for file in $(grep -lE "from \"\./$module\.tsx?\"" "$top"/src/*.ts "$top"/src/*.tsx 2>/dev/null); do
      name=${file##*/}
      name=${name%.*}
      [[ $seen == *" $name "* ]] && continue
      seen+="$name "
      queue+=("$name")
      echo "$name"
    done
  done
}

component() { [ -f "tests/$1.spec.ts" ] || [ -f "src/pages/$1.tsx" ]; }

all=
slugs=()
while IFS= read -r file; do
  [ -n "$file" ] || continue
  found=()
  case $file in
    *.md | docs/* | .claude/* | .gitignore) continue ;;
    src/styles/elements/*.css) name=${file##*/}; found=("${name%.css}") ;;
    src/*/*/* | apps/docs/*/*/*/*) ;; # nested deeper than any component's file
    src/*.tsx | src/*.ts)
      name=${file##*/}
      name=${name%.*}
      # A module counts for every component that uses it, such as menu.ts for Dropdown.
      mapfile -t found < <({ echo "$name"; importers "$name"; } | while read -r n; do component "$n" && echo "$n"; done)
      [[ $shared == *" $name "* ]] && found=()
      ;;
    apps/docs/examples/*/*.html | apps/docs/examples/*/*.tsx) name=${file#apps/docs/examples/}; found=("${name%%/*}") ;;
    apps/docs/src/pages/*.tsx) name=${file##*/}; found=("${name%.tsx}") ;;
    apps/docs/tests/harness/*) name=${file##*/}; found=("${name%.*}") ;;
    apps/docs/tests/*.spec.ts)
      name=${file##*/}
      name=${name%.spec.ts}
      # glass and pages test every page.
      [[ " glass pages " == *" $name "* ]] || found=("$name")
      ;;
  esac
  # A file of no one component's, or of one every component uses, runs everything.
  if [ ${#found[@]} -eq 0 ]; then
    all=$file
    break
  fi
  for name in "${found[@]}"; do
    component "$name" || { all=$file; break 2; }
    slugs+=("$name")
  done
done < <({ git -C "$top" -c core.quotePath=false diff --name-only --no-renames "$CHANGED_BASE"
           git -C "$top" -c core.quotePath=false ls-files --others --exclude-standard; } | sort -u)

if [ -n "$all" ]; then
  echo "Every browser test: $all is shared by the components."
  exec playwright test "${shard[@]}"
fi

mapfile -t slugs < <(printf '%s\n' "${slugs[@]}" | sed '/^$/d' | sort -u)
specs=(tests/pages.spec.ts)
paged=()
for slug in "${slugs[@]}"; do
  [ -f "tests/$slug.spec.ts" ] && specs+=("tests/$slug.spec.ts")
  [ -f "src/pages/$slug.tsx" ] && paged+=("$slug")
done
pages=$(IFS=,; echo "${paged[*]}")
[ -z "$pages" ] || specs+=(tests/glass.spec.ts)
if [ ${#slugs[@]} -gt 0 ]; then
  echo "Browser tests for: ${slugs[*]}"
else
  echo "No component changed: the deploy check only."
fi
DOCS_PAGES=$pages exec playwright test "${shard[@]}" "${specs[@]}"
