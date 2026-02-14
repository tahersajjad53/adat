

# Update Open Graph Image and SEO Improvements

## 1. Add the OG image to the project
Copy `user-uploads://OG-ibadat.png` to `public/og-image.png` (must be in `public/` since meta tags need a direct URL).

## 2. Update `index.html` meta tags

**Replace OG image references** with the production URL:
- `og:image` -> `https://ibadat.app/og-image.png`
- `twitter:image` -> `https://ibadat.app/og-image.png`

**Add missing SEO meta tags:**
- `og:url` -> `https://ibadat.app`
- `og:image:width` / `og:image:height` (standard OG image is 1200x630)
- `og:image:alt` -> descriptive alt text
- `twitter:title` and `twitter:description` (currently missing)
- `theme-color` meta tag for mobile browser chrome
- `apple-mobile-web-app-title` for iOS home screen
- Canonical link tag: `<link rel="canonical" href="https://ibadat.app" />`

**Update attribution:**
- Change `twitter:site` from `@Lovable` to your own handle (or remove it)

## 3. Update `robots.txt`
Add a sitemap reference:
```
Sitemap: https://ibadat.app/sitemap.xml
```

## 4. Add `public/sitemap.xml`
Create a basic sitemap listing the public pages (just the root `/` auth page, since everything else is behind authentication).

## 5. Add `public/manifest.json`
Create a basic web app manifest with the app name, description, theme color, and icons for PWA/home-screen support.

## Summary of files
- **Copy**: `user-uploads://OG-ibadat.png` to `public/og-image.png`
- **Edit**: `index.html` -- update meta tags
- **Edit**: `public/robots.txt` -- add sitemap line
- **Create**: `public/sitemap.xml`
- **Create**: `public/manifest.json`

