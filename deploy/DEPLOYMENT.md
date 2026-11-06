# Deploy to two independent servers

The archive serves `index.html` at `/` and `play/index.html` at `/play/`. Portfolio modules and styles live in `site/`, game code in `play/`, and shared tokens, preferences, and year in `shared/`. Build TypeScript locally or in CI with `npm run build` before packaging `dist/` (`task build` also validates it). Keep the archive root as the web root; deployment requires no compilation, Node.js, or new routing rules.

`Check` runs on pull requests and pushes to `master`. Run `Deploy` manually through Actions → Deploy → Run workflow; select `ruweb`, `itgarage`, or `both`. Both servers receive the same checked archive and keep independent releases. Neither Node.js nor Git is required on the servers.

Both workflows wait for healthy Docker nginx, run `nginx -t`, and verify HTTP
delivery before packaging. The shared action uses a unique Compose project and
port 18088, prints logs on failure, and always removes its stack; the local
preview on port 8088 is unaffected. `npm run check` builds once and runs static
checks and unit tests; standalone `npm test` still builds first.

## Local Docker verification

From the repository root (requires Docker Compose and installed npm dependencies):

```bash
npm run check
docker compose -f deploy/compose.local.yml up -d --wait
docker compose -f deploy/compose.local.yml exec -T nginx nginx -t
node scripts/check-http.mjs
```

Open http://127.0.0.1:8088/ or http://127.0.0.1:8088/play/. The dedicated
container uses a pinned official stable Nginx image, the exact deployment
server/limit configurations, and read-only `dist/`; it binds only to loopback.
Set `DDS_PORT=8089` before the Compose command to change the port, and pass
`http://127.0.0.1:8089/` to the HTTP checker. Rebuild after source changes.
The HTTP checker validates every built file (including all localized scenes,
sprites and audio), headers, routing and range requests; it does not test visual
rendering or browser interaction.

Stop and remove only this local stack:

```bash
docker compose -f deploy/compose.local.yml down
```

## VPS setup

Repeat for each server:

1. Create a dedicated unprivileged SSH user, such as `ddsdeploy`. Add the deployment public key to `~ddsdeploy/.ssh/authorized_keys`. Do not use root or a personal key.
2. Create the deployment directories:

   ```bash
   sudo install -d -m 755 -o ddsdeploy -g ddsdeploy /srv/digital-development-simulator
   sudo -u ddsdeploy mkdir -p /srv/digital-development-simulator/{incoming,releases}
   ```

3. Set `root /srv/digital-development-simulator/current;` in the site's Nginx server block. Keep existing HTTPS settings. Use `deploy/nginx-olegshokin.conf` as a reference; `deploy/nginx-http-limits.conf` belongs in the `http` context. Use each server's own address and `server_name`. The first deployment creates `current`.
4. Preserve the reference config's regex order: hidden-file denial precedes static routing, and `/play/` must not use `^~`. Static code/asset trees (including unknown extensions) and recognized static extensions return 404 when missing, bypass page rate limits, and cache successful responses for seven days. Pages retain HTML fallback and rate limits.
5. Validate and reload Nginx: `sudo nginx -t && sudo systemctl reload nginx`. Content deployments do not require a reload.
6. Verify the server's SSH host public key through a trusted VPS console: `sudo cat /etc/ssh/ssh_host_ed25519_key.pub`. This is not the deployment user's key.

## GitHub settings

Create environments named `ruweb` and `itgarage` under Settings → Environments. Set these secrets separately in each environment:

- `DEPLOY_HOST`: that server's IP address or DNS name.
- `DEPLOY_USER`: SSH user, such as `ddsdeploy`.
- `DEPLOY_SSH_KEY`: deployment user's private key.
- `DEPLOY_HOST_PUBLIC_KEY`: verified host public key, formatted as `ssh-ed25519 AAAA...`.

Set these environment variables:

- `SITE_URL`: `https://olegshokin.com` for RU-WEB; the public HTTP or HTTPS URL for IT-GARAGE.
- `DEPLOY_PORT` (optional): SSH port; defaults to 22.

When a server address changes, update `DEPLOY_HOST` and `SITE_URL`. Update `DEPLOY_HOST_PUBLIC_KEY` if the host key changes. Deployments are restricted to `master`. Add environment protection rules if approval is required.

Generate a dedicated Actions key locally:

```bash
ssh-keygen -t ed25519 -f ./dds-deploy-key -C dds-deploy
```

Install its public key on the VPS and store its private key in the environment secret. Never commit either generated key file. GitHub-hosted runners must be able to reach SSH and `SITE_URL`.

## Release

Push the project to `master` and confirm that `Check` passes. Run `Deploy` for one or both servers.

The workflow uploads the archive to `releases/<commit>-<run>` and atomically switches the `current` symlink. The old release remains in `previous`. Public checks request `/`, `/play/`, and `/deploy-id.txt`. On failure, the workflow reports an error and attempts to restore `previous`; the first deployment has no previous release.

## Rollback

On the affected VPS, as `ddsdeploy`:

```bash
cd /srv/digital-development-simulator
readlink previous             # Confirm this is the intended release
ln -s "$(readlink previous)" .rollback-next
mv -Tf .rollback-next current
```

Releases are not pruned automatically. Monitor disk space and remove unused releases, keeping the targets of `current` and `previous`. Back up and validate Nginx changes separately from content deployments.
