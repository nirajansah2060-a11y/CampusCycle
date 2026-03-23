# CampusCycle image placement guide

This project already contains placeholder PNG files in the correct folders. To replace them with real images from the web, keep the same filename and overwrite the placeholder.

## 1. Profile images

Folder:

`src/public/uploads/profiles/`

Replace these files with your own PNG images:

- `sarah-chen.png`
- `marcus-johnson.png`
- `elena-rodriguez.png`
- `liam-oconnor.png`
- `amina-jalloh.png`
- `alex-johnson.png`
- `tom-wilson.png`

## 2. Listing cover images

Folder:

`src/public/uploads/items/`

Replace these files with your own PNG images:

- `data-structures-cover.png`
- `ti84-cover.png`
- `electric-kettle-cover.png`
- `organic-chemistry-cover.png`
- `classics-bundle-cover.png`
- `python-notes-cover.png`
- `intro-algorithms-cover.png`
- `computer-networks-cover.png`
- `mountain-bike-cover.png`
- `discrete-math-cover.png`
- `java-cover.png`
- `backpack-cover.png`

## 3. Listing gallery/detail images

These are used in the listing detail page gallery:

- `data-structures-1.png`
- `data-structures-2.png`
- `data-structures-3.png`
- `ti84-detail.png`
- `electric-kettle-detail.png`
- `organic-chemistry-detail.png`
- `classics-bundle-detail.png`
- `python-notes-detail.png`
- `intro-algorithms-detail.png`
- `computer-networks-detail.png`
- `mountain-bike-detail.png`
- `discrete-math-detail.png`
- `java-detail.png`
- `backpack-detail.png`

## 4. Global placeholder images

Folder:

`src/public/placeholders/`

Files:

- `item-placeholder.png`
- `profile-placeholder.png`
- `login-hero.png`
- `students-illustration.png`

## 5. How to adjust image fitting

The app already uses CSS object fit rules.

- Listing cards use `object-fit: cover`
- Profile photos use `object-fit: cover`
- Detail gallery uses `object-fit: cover`

If you want to change how images look, edit these CSS selectors in `src/public/style.css`:

- `.listing-card__image`
- `.profile-photo`
- `.profile-chip__avatar`
- `.profile-hero-card__avatar`
- `.detail-gallery__main img`
- `.detail-thumb img`

### Common adjustment options

Use one of these values:

- `object-fit: cover` fills the box and crops a little
- `object-fit: contain` shows the full image but may leave empty space
- `object-position: center` keeps the image centered
- `object-position: top` is useful for portraits

Example:

```css
.listing-card__image {
  object-fit: cover;
  object-position: center;
}
```

## 6. How to add new images through the app

1. Sign in with a demo account
2. Open `/items/new`
3. Upload a cover image and up to 3 gallery images
4. Submit the form
5. The files are saved automatically to `src/public/uploads/items/`

## 7. Demo login

All seeded demo accounts use:

- password: `admin`

Example emails:

- `alex@campuscycle.test`
- `sarah@campuscycle.test`
- `marcus@campuscycle.test`
