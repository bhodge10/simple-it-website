# Cloudinary Media Library — Setup & Activation (TRIAL)

This branch wires the blog editor (`/admin`) to upload images to **Cloudinary**
instead of committing them into the GitHub repo. It's the fix for the recurring
"featured image won't display" problem: the editor stores each image's permanent
CDN URL, so the saved path can't drift away from the actual file the way it does
today.

Everything is in place **except your Cloudinary credentials.** Until you add
them (Step 2), the Featured Image uploader on this branch's deploy preview will
error when opened — that's expected.

---

## What changed on this branch

- `admin/config.yml` — added a `media_library: cloudinary` block (with two
  placeholder values to fill in).
- `netlify.toml` — updated the Content-Security-Policy so (a) Cloudinary images
  are allowed to display on the live site and (b) the Cloudinary upload widget
  can load inside `/admin`.
- `_includes/layouts/blog-post.njk` — the social/SEO image tags
  (`og:image`, `twitter:image`, schema `image`) now handle full Cloudinary URLs
  without mangling them. Existing posts that use `/images/blog/...` are
  unaffected.

**Nothing about the team's publishing steps changes.** Same `/admin`, same
login, same draft/publish flow. The only visible difference is that clicking
**Choose an image** opens Cloudinary's uploader instead of the built-in one.
Your 117 existing repo images keep working untouched.

---

## Step 1 — Create a free Cloudinary account (~3 min)

1. Go to https://cloudinary.com/users/register_free and sign up.
2. After signup you'll land on the dashboard. Note your **Cloud name** (top of
   the dashboard, e.g. `simple-it`).
3. Go to **Settings (gear icon) → API Keys**. Copy the **API Key** (a long
   number). **Do NOT copy the API Secret** — it is not needed and must never go
   in the repo.

## Step 2 — Plug in the two values

Edit `admin/config.yml` and replace the placeholders:

```yaml
media_library:
  name: cloudinary
  output_filename_only: false
  config:
    cloud_name: YOUR_CLOUD_NAME   # <- from the dashboard
    api_key: YOUR_API_KEY         # <- the public API Key (NOT the secret)
```

The `api_key` is the **public** key — it's safe to commit. (Cloudinary's media
library widget is designed to run client-side with it.)

## Step 3 — One Cloudinary setting

In Cloudinary, go to **Settings → Security** and make sure
**"Restricted media types"** isn't blocking uploads, and under
**Settings → Upload**, confirm an **unsigned upload preset** exists (Cloudinary
creates one named `ml_default` by default — that's fine). No other config
needed for the media library widget.

## Step 4 — Try it

1. Open `/admin` on the branch deploy preview (or production once merged).
2. Edit any post → **Featured Image → Choose an image.**
3. The Cloudinary uploader opens. Drag in an image, click **Insert.**
4. Save/publish and confirm the image shows on the post.

---

## How this fixes the bug

Today the editor saves a *path* (`/images/blog/whatever.png`) and separately
commits the file; if those two ever disagree (a re-upload, a rename, a dedup
suffix like `-1-`), you get the broken-image box. With Cloudinary, the field is
set to the image's exact, permanent URL the moment it uploads — there are no two
things that can fall out of sync.

## Rollback

If you ever want to go back to repo-committed images, delete the
`media_library:` block from `admin/config.yml`. The CSP and template changes are
backward-compatible and can stay.

## Cost

Cloudinary's free tier (~25 GB storage / 25 GB monthly bandwidth) is far beyond
a small business blog's needs. No card required to start.

## Note / tradeoff

New images will live in your Cloudinary account rather than the repo. If that
account ever lapsed, **newly uploaded** images could stop loading (your existing
117 repo images would be unaffected). Keep the login with the business, not a
personal account.
