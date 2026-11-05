#!/usr/bin/env bash
set -euo pipefail
: "${DEPLOY_HOST:?Set DEPLOY_HOST in the selected GitHub environment}"
: "${DEPLOY_USER:?Set DEPLOY_USER in the selected GitHub environment}"
: "${DEPLOY_SSH_KEY:?Set DEPLOY_SSH_KEY in the selected GitHub environment}"
: "${DEPLOY_HOST_PUBLIC_KEY:?Set DEPLOY_HOST_PUBLIC_KEY in the selected GitHub environment}"
: "${SITE_URL:?Set SITE_URL in the selected GitHub environment}"
: "${RELEASE_ID:?Missing release ID}"
[[ $DEPLOY_HOST =~ ^[a-zA-Z0-9.:-]+$ ]] || { echo 'Invalid deploy host'; exit 2; }
[[ $DEPLOY_USER =~ ^[a-z_][a-z0-9_-]*$ ]] || { echo 'Invalid deploy user'; exit 2; }
[[ $DEPLOY_HOST_PUBLIC_KEY =~ ^(ssh-ed25519|ecdsa-sha2-nistp256|ssh-rsa)\ [A-Za-z0-9+/=]+$ ]] || { echo 'Invalid server public key'; exit 2; }
[[ $SITE_URL =~ ^https?://[a-zA-Z0-9.:-]+/?$ ]] || { echo 'Invalid site URL'; exit 2; }
port=${DEPLOY_PORT:-22}
[[ $port =~ ^[0-9]{1,5}$ ]] && (( port >= 1 && port <= 65535 )) || { echo 'Invalid port'; exit 2; }
root=/srv/digital-development-simulator
ssh_dir=$(mktemp -d)
trap 'rm -rf "$ssh_dir"' EXIT
chmod 700 "$ssh_dir"
printf '%s\n' "$DEPLOY_SSH_KEY" > "$ssh_dir/key"
printf 'dds-target %s\n' "$DEPLOY_HOST_PUBLIC_KEY" > "$ssh_dir/known_hosts"
chmod 600 "$ssh_dir/key" "$ssh_dir/known_hosts"
cat > "$ssh_dir/config" <<CONFIG
Host dds-target
  HostName $DEPLOY_HOST
  User $DEPLOY_USER
  Port $port
  HostKeyAlias dds-target
  IdentityFile $ssh_dir/key
  UserKnownHostsFile $ssh_dir/known_hosts
  StrictHostKeyChecking yes
  BatchMode yes
CONFIG
chmod 600 "$ssh_dir/config"
ssh -F "$ssh_dir/config" dds-target "mkdir -p '$root/incoming' '$root/releases'"
scp -F "$ssh_dir/config" site.tar.gz "dds-target:$root/incoming/$RELEASE_ID.tar.gz"
ssh -F "$ssh_dir/config" dds-target bash -s -- "$RELEASE_ID" < deploy/activate-release.sh
if ! curl --fail --silent --show-error --location --max-time 20 "${SITE_URL%/}/" -o /dev/null ||
   ! curl --fail --silent --show-error --location --max-time 20 "${SITE_URL%/}/play/" -o /dev/null ||
   [[ $(curl --fail --silent --show-error --location --max-time 20 "${SITE_URL%/}/deploy-id.txt") != "$RELEASE_ID" ]]; then
  echo 'Public smoke test failed; restoring the previous release.' >&2
  ssh -F "$ssh_dir/config" dds-target bash -s -- "$RELEASE_ID" --rollback < deploy/activate-release.sh || true
  exit 1
fi
printf 'Published %s to %s\n' "$RELEASE_ID" "$SITE_URL"
