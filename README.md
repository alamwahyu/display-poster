# Poster & Banner Display Management

Browser-based digital signage app built with Next.js, Prisma, PostgreSQL, Tailwind CSS, local uploads, admin auth, display playlists, scheduling, fullscreen mode, and polling refresh.

## Main Routes

- `/display` uses the default active display.
- `/display/:slug` opens a specific display such as `/display/lobby`.
- `/display?fullscreen=true` attempts fullscreen and shows a click overlay when the browser requires a gesture.
- `/display/lobby?fit=cover&debug=true` overrides fit mode and shows display diagnostics.
- `/admin/login` signs in admins.
- `/admin/dashboard`, `/admin/posters`, `/admin/displays`, `/admin/settings/display`, `/admin/users` are protected.

## Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run create-admin
npm run dev
```

Use a PostgreSQL database in `DATABASE_URL`. Uploaded originals and thumbnails are stored in `public/uploads` by default. The upload logic is isolated in `lib/upload.ts` so it can later be replaced with S3 or Cloudinary while keeping the API surface stable.

## Production On Ubuntu 24

Target directory:

```bash
sudo mkdir -p /var/www/poster-display
sudo chown -R $USER:$USER /var/www/poster-display
```

Install Node.js 20.19+ or 22 LTS, PostgreSQL, Nginx, and PM2:

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib
npm install -g pm2
```

Deploy app files to `/var/www/poster-display`, then:

```bash
cd /var/www/poster-display
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run build
pm2 start ecosystem.config.js
pm2 save
```

Create the first admin:

```bash
npm run create-admin
```

Copy `nginx/poster-display.conf` to `/etc/nginx/sites-available/poster-display`, symlink it into `sites-enabled`, test, and reload:

```bash
sudo ln -s /etc/nginx/sites-available/poster-display /etc/nginx/sites-enabled/poster-display
sudo nginx -t
sudo systemctl reload nginx
```

For HTTPS, install Certbot and issue a certificate for `poster.awhdigital.my.id`.

## API

Auth:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Posters:

- `GET /api/admin/posters`
- `POST /api/admin/posters`
- `GET /api/admin/posters/:id`
- `PUT /api/admin/posters/:id`
- `DELETE /api/admin/posters/:id`
- `PUT /api/admin/posters/reorder`

Displays:

- `GET /api/admin/displays`
- `POST /api/admin/displays`
- `GET /api/admin/displays/:id`
- `PUT /api/admin/displays/:id`
- `DELETE /api/admin/displays/:id`
- `GET /api/admin/displays/:id/settings`
- `PUT /api/admin/displays/:id/settings`

Public:

- `GET /api/display`
- `GET /api/display/posters`
- `GET /api/display/:slug`
- `GET /api/display/:slug/posters`
- `GET /api/health`

## Display Behavior

The public display surface has no header, navbar, footer, margin, or browser padding. It uses `100vw x 100vh`, black background, `overflow: hidden`, and `object-fit: contain` by default. It supports contain, cover, and stretch. Playlists poll the API using the display setting interval and retain the previous playlist in `localStorage` if the API is temporarily unavailable.
# display-poster
