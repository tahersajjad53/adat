

## Fix: Logo Appearing Blue Instead of Green

### Root Cause

The logo SVG already contains the correct dark green color (`#005240`) in its fill attributes. However, the mobile header applies a CSS filter class called `logo-forest` that was calibrated for the old logo. This filter distorts the color, producing the blue/purple tint visible in the screenshot.

### Changes

1. **Remove the `logo-forest` filter from the mobile header logo** in `src/components/layout/AppLayout.tsx`. Since the SVG is already green, no filter is needed -- just display it as-is.

2. **Update the sidebar logo** in `src/components/layout/AppSidebar.tsx`. The `logo-lime` filter also needs to be recalibrated or replaced. Since the sidebar has a dark green background, the logo needs to appear in a light/lime color for contrast. The simplest approach is to replace the hue-shifting filter with a `brightness(0) invert(1)` base and then fine-tune to a lime tint, or use a CSS filter calculator to match the target lime color `hsl(68, 75%, 55%)`.

3. **Update the auth layout logo** in `src/components/auth/AuthLayout.tsx`. The desktop splash side uses `invert` on the logo for white text on dark background -- this should still work fine. The mobile auth view shows the logo without a filter, so it will display in the native green.

### Technical Details

**File: `src/components/layout/AppLayout.tsx`** (line 40)
- Change: `className="h-6 w-auto logo-forest"` to `className="h-6 w-auto"`

**File: `src/components/layout/AppSidebar.tsx`** (line 67)
- Change: `className="h-8 w-auto logo-lime"` to use a corrected filter that produces the lime accent color on the dark sidebar, or remove the filter if the native green provides sufficient contrast.

**File: `src/index.css`** (lines 122-128)
- Remove or update the `.logo-forest` and `.logo-lime` filter definitions since they were tuned for the old logo.

### Summary of Files Modified
- `src/components/layout/AppLayout.tsx` -- remove `logo-forest` class from mobile header logo
- `src/components/layout/AppSidebar.tsx` -- update or remove `logo-lime` class from sidebar logo
- `src/index.css` -- clean up or recalibrate the CSS filter classes

