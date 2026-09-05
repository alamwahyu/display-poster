CREATE TYPE "UserRole" AS ENUM ('ADMIN');
CREATE TYPE "PosterStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "DisplayStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "FitMode" AS ENUM ('CONTAIN', 'COVER', 'STRETCH');
CREATE TYPE "Orientation" AS ENUM ('PORTRAIT', 'LANDSCAPE', 'SQUARE');
CREATE TYPE "Transition" AS ENUM ('FADE', 'SLIDE', 'NONE');

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "posters" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "image_url" TEXT NOT NULL,
  "thumbnail_url" TEXT,
  "status" "PosterStatus" NOT NULL DEFAULT 'ACTIVE',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "duration" INTEGER NOT NULL DEFAULT 10,
  "fit_mode" "FitMode" NOT NULL DEFAULT 'CONTAIN',
  "orientation" "Orientation" NOT NULL DEFAULT 'LANDSCAPE',
  "start_date" TIMESTAMP(3),
  "end_date" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "posters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "displays" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "status" "DisplayStatus" NOT NULL DEFAULT 'ACTIVE',
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "displays_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "display_posters" (
  "id" TEXT NOT NULL,
  "display_id" TEXT NOT NULL,
  "poster_id" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "display_posters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "display_settings" (
  "id" TEXT NOT NULL,
  "display_id" TEXT NOT NULL,
  "default_duration" INTEGER NOT NULL DEFAULT 10,
  "transition" "Transition" NOT NULL DEFAULT 'FADE',
  "transition_duration" INTEGER NOT NULL DEFAULT 500,
  "background_color" TEXT NOT NULL DEFAULT '#000000',
  "default_fit_mode" "FitMode" NOT NULL DEFAULT 'CONTAIN',
  "polling_interval" INTEGER NOT NULL DEFAULT 15,
  "enable_fullscreen_button" BOOLEAN NOT NULL DEFAULT true,
  "hide_cursor" BOOLEAN NOT NULL DEFAULT true,
  "show_empty_message" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "display_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "posters_status_sort_order_idx" ON "posters"("status", "sort_order");
CREATE UNIQUE INDEX "displays_slug_key" ON "displays"("slug");
CREATE INDEX "displays_status_is_default_idx" ON "displays"("status", "is_default");
CREATE UNIQUE INDEX "display_posters_display_id_poster_id_key" ON "display_posters"("display_id", "poster_id");
CREATE INDEX "display_posters_display_id_sort_order_idx" ON "display_posters"("display_id", "sort_order");
CREATE INDEX "display_posters_poster_id_idx" ON "display_posters"("poster_id");
CREATE UNIQUE INDEX "display_settings_display_id_key" ON "display_settings"("display_id");

ALTER TABLE "display_posters"
  ADD CONSTRAINT "display_posters_display_id_fkey"
  FOREIGN KEY ("display_id") REFERENCES "displays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "display_posters"
  ADD CONSTRAINT "display_posters_poster_id_fkey"
  FOREIGN KEY ("poster_id") REFERENCES "posters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "display_settings"
  ADD CONSTRAINT "display_settings_display_id_fkey"
  FOREIGN KEY ("display_id") REFERENCES "displays"("id") ON DELETE CASCADE ON UPDATE CASCADE;
