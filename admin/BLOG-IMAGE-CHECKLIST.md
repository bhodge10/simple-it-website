# Featured Image Checklist (Blog Portal)

A short routine that prevents the recurring "broken featured image" problem.
Follow it every time you add or change a post's **Featured Image**.

---

## Why images break

The image you upload is saved as a file in the repo, and the post separately
stores a *path* pointing at that file. The broken-image box appears when the
**stored path and the actual filename don't match**. That mismatch is almost
always caused by one of these:

1. **Re-uploading an image with a name already in use** — the system quietly
   renames the new file (e.g. adds `-1-`), but the post keeps pointing at the
   old name.
2. **Typing the file extension when renaming** — produces double extensions
   like `photo.jpg.jpg`.
3. **Publishing before the image has finished saving** — during a draft the
   image lives on the draft copy of the site, so the preview can show a broken
   box until the post is actually published. (This one fixes itself on publish.)

---

## The routine (do this every time)

1. **Rename the file BEFORE uploading**, on your computer, to a unique,
   all-lowercase, hyphenated name that describes the post — ideally matching the
   post title. Example: `passkey-migration-laptop.png`.
   - No spaces, no capital letters, no apostrophes/quotes.
   - **Do not type the extension** (`.png`/`.jpg`) into the portal's rename box —
     it's already there.
   - Never reuse a name that another post already uses.

2. **Upload it** in the Featured Image field.

3. **Wait for the thumbnail to appear in the field.** If you still see the gray
   broken-image box *in the upload field itself*, the upload didn't finish —
   remove it and re-upload. Do not save yet.

4. **Fill in the Alt Text** so it describes that exact image.

5. **Save / publish.** After it goes live, open the post on the public site and
   confirm the image shows. If it's broken on the live site (not just the draft
   preview), the name still mismatched — tell Brad with the post name and we'll
   correct it.

---

## Don'ts

- ❌ Don't delete images from the Media library to "clean up" unless you're sure
  no post uses them — deleting an in-use image is what broke the
  *digital-defense-essential-security-practices* post.
- ❌ Don't re-upload the same picture under a second name — pick one name and
  reuse the existing file from the Media library instead.
- ❌ Don't keep re-saving a draft to force the image to load. If it won't load,
  remove and re-upload once, following step 1.

---

*Maintained by Brad / dev. If a post's image is broken on the live site, send
the post title and we can fix the path directly.*
