#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2023-2026 NukeHub Developers
# SPDX-License-Identifier: BSD-2-Clause

# Bump the nukehub-docs-kit version.
#
# The git tag (vX.Y.Z) is the release source of truth; this script updates the
# checked-in version source so a release is one command:
#
#   scripts/bump-version.sh 0.2.0
#
# Updates:
#   package.json  - version field
#   CHANGELOG.md  - stamps [Unreleased] with the new version + date
#
# The script never commits or tags; it prints the follow-up git commands.
# Re-running with the same version is a no-op.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

die() {
    echo "error: $*" >&2
    exit 1
}

_version="${1:-}"
[[ "$_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] \
    || die "usage: scripts/bump-version.sh <X.Y.Z>  (e.g. scripts/bump-version.sh 0.2.0)"

_date="$(date +%F)"

# package.json: update version only if it differs.
_package_json="$DIR/package.json"
_current_version="$(node -p "require('$_package_json').version")"
if [[ "$_current_version" == "$_version" ]]; then
    echo "note: package.json already at $_version; left unchanged"
else
    node -e "
        const fs = require('fs');
        const path = '$_package_json';
        const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
        pkg.version = '$_version';
        fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
    "
    echo "  package.json -> $_version"
fi

# CHANGELOG: stamp [Unreleased] with the new version and date (skip when the
# version heading already exists, so re-runs stay idempotent).
_changelog="$DIR/CHANGELOG.md"
if grep -q "^## \[$_version\]" "$_changelog"; then
    echo "note: CHANGELOG.md already has [$_version]; left unchanged"
elif grep -q '^## \[Unreleased\]' "$_changelog"; then
    # Insert the new release heading immediately after the [Unreleased] heading.
    sed -i "0,/^## \[Unreleased\]$/s//## [Unreleased]\n\n## [$_version] - $_date/" "$_changelog"
    echo "  CHANGELOG.md -> [$_version] - $_date"
else
    echo "warning: no [Unreleased] section in CHANGELOG.md; left unchanged" >&2
fi

echo
echo "Bumped to $_version."
echo
echo "Next steps:"
echo "  git diff package.json CHANGELOG.md"
echo "  git add package.json CHANGELOG.md"
echo "  git commit -m \"chore: bump version to $_version\""
echo "  git tag v$_version"
echo "  git push origin main --tags   # CI publishes to npm from the tag"
