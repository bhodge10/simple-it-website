# How to Add Your 27 Google Reviews

## 📋 Step-by-Step Instructions

### Step 1: Open Your Google Business Profile
1. Go to https://business.google.com/
2. Sign in to your Google Business account
3. Click on "Reviews" in the left sidebar
4. You should see all 27 of your reviews

### Step 2: Open the reviews-data.json File
1. Navigate to your website files folder
2. Open `reviews-data.json` in a text editor (Notepad, VS Code, etc.)
3. You'll see 27 placeholder reviews

### Step 3: Copy Each Review
For each review, you need to fill in these fields:

```json
{
  "author_name": "John Smith",
  "rating": 5,
  "text": "The actual review text goes here...",
  "time": "2024-01-15",
  "profile_photo_url": ""
}
```

**Field Explanations:**

- **author_name**: Copy the reviewer's name exactly as it appears
- **rating**: The star rating (1-5, most will be 5)
- **text**: Copy the entire review text. Keep quotation marks around it.
- **time**: The date in YYYY-MM-DD format (approximate is fine)
- **profile_photo_url**: Leave this blank "" (we'll use initials)

### Step 4: Example - How to Fill One Review

**From Google:**
```
★★★★★ John Smith
Posted 2 months ago
"Simple IT has been fantastic! Their response time is
amazing and they solved our server issues quickly."
```

**In your JSON file:**
```json
{
  "author_name": "John Smith",
  "rating": 5,
  "text": "Simple IT has been fantastic! Their response time is amazing and they solved our server issues quickly.",
  "time": "2023-11-15",
  "profile_photo_url": ""
}
```

### Step 5: Important JSON Rules

⚠️ **CRITICAL - Follow these rules or the file will break:**

1. **Keep commas between reviews** (except the last one)
2. **Use double quotes** around text, not single quotes
3. **Escape special characters** in review text:
   - If review has quotes, use `\"`
   - Example: `"text": "They said \"wow\" about our service"`
4. **Don't add comma after the last review**

### Step 6: Validate Your JSON

After filling in all reviews:
1. Go to https://jsonlint.com/
2. Copy and paste your entire reviews-data.json content
3. Click "Validate JSON"
4. Fix any errors it shows (usually missing/extra commas)

### Step 7: Update the Header Info

At the top of the file, update:

```json
{
  "rating": 5.0,        ← Your actual average rating
  "totalReviews": 27,   ← Your actual review count
  "reviews": [
```

### Step 8: Deploy to Netlify

1. Save the reviews-data.json file
2. Upload/deploy to Netlify
3. Your site will now show all 27 reviews!
4. They'll randomly rotate 4 at a time

---

## 🎯 Quick Tips

**For Dates:**
- Use YYYY-MM-DD format
- Approximate dates are fine
- Newest reviews first helps, but not required (we shuffle them)

**For Review Text:**
- Copy exactly as written
- Include all punctuation
- If review is very long, you can trim it slightly (we truncate at 200 characters anyway)

**For Names:**
- Use exactly as shown on Google
- First name only is fine (e.g., "John S." instead of full name)

**Special Characters to Watch:**
- Quotes inside review text: use `\"`
- Line breaks: remove them or use `\n`
- Apostrophes: usually fine as-is

---

## 🔄 Adding New Reviews Later

When you get new reviews:

1. Open reviews-data.json
2. Update `"totalReviews": 28` (or whatever the new count is)
3. Add new review at the TOP of the reviews array:
   ```json
   {
     "rating": 5.0,
     "totalReviews": 28,
     "reviews": [
       {
         "author_name": "New Reviewer",
         "rating": 5,
         "text": "Latest review text...",
         "time": "2024-02-01",
         "profile_photo_url": ""
       },
       ... (rest of existing reviews)
     ]
   }
   ```
4. Redeploy to Netlify

---

## ❓ Common Issues

**Problem:** Website shows "Unable to load reviews"
- **Solution:** JSON syntax error. Validate at jsonlint.com

**Problem:** Reviews appear but missing text
- **Solution:** Check for unescaped quotes in review text

**Problem:** Reviews not updating on site
- **Solution:** Clear browser cache or wait for Netlify cache to expire (24 hours max)

---

## 📞 Need Help?

If you get stuck:
1. Check the JSON is valid at jsonlint.com
2. Make sure the file is named exactly `reviews-data.json`
3. Verify it's in the root directory of your site files
4. Check browser console for errors (F12 → Console tab)
