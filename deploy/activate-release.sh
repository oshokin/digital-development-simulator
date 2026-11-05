#!/usr/bin/env bash
set -euo pipefail
root=${DDS_RELEASE_ROOT:-/srv/digital-development-simulator}
release_id=${1:?release ID is required}
[[ $release_id =~ ^[a-f0-9]{40}-[0-9]+-[0-9]+$ ]] || exit 2
mkdir -p "$root/releases"

if [[ ${2:-} == --rollback ]]; then
  previous=$(readlink "$root/previous")
  [[ $previous == releases/* && -f "$root/$previous/index.html" && -f "$root/$previous/play/index.html" ]] || exit 1
  ln -s "$previous" "$root/.next-$release_id"
  mv -Tf "$root/.next-$release_id" "$root/current"
  exit
fi

release="$root/releases/$release_id"
archive="$root/incoming/$release_id.tar.gz"
mkdir -p "$release"
tar -xzf "$archive" -C "$release"
rm -f "$archive"
test -f "$release/index.html"
test -f "$release/play/index.html"
test -f "$release/deploy-id.txt"
old=$(readlink "$root/current" 2>/dev/null || true)
if [[ $old == releases/* && -f $root/$old/index.html ]]; then
  ln -s "$old" "$root/.previous-$release_id"
  mv -Tf "$root/.previous-$release_id" "$root/previous"
fi
ln -s "releases/$release_id" "$root/.next-$release_id"
mv -Tf "$root/.next-$release_id" "$root/current"
