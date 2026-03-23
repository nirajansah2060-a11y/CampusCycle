const express = require('express');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { pool } = require('../db');

const router = express.Router();

const POPULAR_HASH_TAGS = [
  'Python',
  'Calculus',
  'DormLife',
  'Finals',
  'Engineering',
  'FreshmanYear',
  'OrganicChemistry',
  'BudgetFriendly',
  'StudyGroup',
  'Physics'
];

const ROLE_FILTERS = {
  all: 'All Members',
  'active-sharers': 'Active Sharers',
  tutors: 'Tutors',
  'textbook-owners': 'Textbook Owners',
  'equipment-lenders': 'Equipment Lenders'
};

function slugify(value = '') {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function hashPassword(password = '') {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function withInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function timeAgo(dateValue) {
  if (!dateValue) return 'Recently added';

  const value = new Date(dateValue);
  const seconds = Math.floor((Date.now() - value.getTime()) / 1000);
  const units = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ];

  for (const [label, amount] of units) {
    if (seconds >= amount) {
      const count = Math.floor(seconds / amount);
      return `${count}${label[0]} ago`;
    }
  }

  return 'Just now';
}

function priceLabel(listing) {
  if (listing.exchange_type === 'Gift') {
    return 'Free';
  }
  if (Number(listing.price) === 0 && listing.exchange_type === 'Swap') {
    return 'Swap';
  }
  return `$${Number(listing.price || 0).toFixed(2)}`;
}

function parseTagRecords(records = '') {
  if (!records) return [];
  return records.split('||').map((record) => {
    const [id, name, slug] = record.split('::');
    return {
      id: Number(id),
      name,
      slug
    };
  });
}

function parseImages(recordString = '', fallback = '') {
  const parsed = recordString ? recordString.split('||').filter(Boolean) : [];
  if (!parsed.length && fallback) {
    return [fallback];
  }
  return parsed;
}

function mapListing(row) {
  const coverImage = row.cover_image_url || '/placeholders/item-placeholder.png';
  const galleryImages = parseImages(row.gallery_records, coverImage);
  return {
    ...row,
    owner_initials: withInitials(row.owner_name),
    owner_avatar_url: row.owner_avatar_url || '/placeholders/profile-placeholder.png',
    tag_list: parseTagRecords(row.tag_records),
    gallery_images: galleryImages,
    display_price: priceLabel(row),
    created_label: timeAgo(row.created_at)
  };
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.flash = { type: 'error', message: 'Please sign in to continue.' };
    return res.redirect('/signin');
  }
  return next();
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const destination = file.fieldname === 'avatarImage'
      ? path.join(__dirname, '..', 'public', 'uploads', 'profiles')
      : path.join(__dirname, '..', 'public', 'uploads', 'items');
    cb(null, destination);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    const base = slugify(path.basename(file.originalname || 'upload', ext)) || 'upload';
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const listingSelect = `
  SELECT
    l.id,
    l.title,
    l.description,
    l.price,
    l.exchange_type,
    l.condition_label,
    l.status,
    l.location,
    l.response_note,
    l.cover_image_url,
    l.created_at,
    u.id AS owner_id,
    u.name AS owner_name,
    u.major AS owner_major,
    u.avatar_url AS owner_avatar_url,
    u.badge_label AS owner_badge_label,
    u.verified AS owner_verified,
    pt.id AS primary_tag_id,
    pt.name AS primary_tag_name,
    pt.slug AS primary_tag_slug,
    GROUP_CONCAT(DISTINCT CONCAT(t.id, '::', t.name, '::', t.slug) ORDER BY t.name SEPARATOR '||') AS tag_records,
    GROUP_CONCAT(DISTINCT li.image_url ORDER BY li.sort_order SEPARATOR '||') AS gallery_records
  FROM listings l
  JOIN users u ON u.id = l.user_id
  JOIN tags pt ON pt.id = l.primary_tag_id
  LEFT JOIN listing_tags lt ON lt.listing_id = l.id
  LEFT JOIN tags t ON t.id = lt.tag_id
  LEFT JOIN listing_images li ON li.listing_id = l.id
`;

const listingGroupBy = `
  GROUP BY
    l.id, l.title, l.description, l.price, l.exchange_type, l.condition_label, l.status,
    l.location, l.response_note, l.cover_image_url, l.created_at,
    u.id, u.name, u.major, u.avatar_url, u.badge_label, u.verified,
    pt.id, pt.name, pt.slug
`;

async function getCategories() {
  const [rows] = await pool.query(`
    SELECT
      t.id,
      t.name,
      t.slug,
      t.description,
      t.icon_label,
      t.accent_color,
      COUNT(l.id) AS listing_count
    FROM tags t
    LEFT JOIN listings l ON l.primary_tag_id = t.id
    GROUP BY t.id, t.name, t.slug, t.description, t.icon_label, t.accent_color
    ORDER BY t.name ASC
  `);
  return rows;
}

router.get('/', async (req, res, next) => {
  try {
    const [categories, featuredRows, recentUsers, statsRows] = await Promise.all([
      getCategories(),
      pool.query(`
        ${listingSelect}
        ${listingGroupBy}
        ORDER BY l.created_at DESC
        LIMIT 3
      `).then(([rows]) => rows),
      pool.query(`
        SELECT id, name, major, badge_label, avatar_url FROM users ORDER BY created_at DESC LIMIT 3
      `).then(([rows]) => rows),
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM listings) AS listings_count,
          (SELECT COUNT(*) FROM users) AS users_count,
          (SELECT COUNT(*) FROM tags) AS tags_count
      `).then(([rows]) => rows)
    ]);

    res.render('index', {
      title: 'Browse campus resources',
      categories,
      featuredItems: featuredRows.map(mapListing),
      recentUsers,
      popularHashTags: POPULAR_HASH_TAGS,
      stats: statsRows[0]
    });
  } catch (error) {
    next(error);
  }
});

router.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok === 1, service: 'CampusCycle' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: false, message: error.message });
  }
});

router.get('/items', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const tag = Number(req.query.tag) || null;
    const exchangeType = (req.query.exchange_type || '').trim();
    const condition = (req.query.condition || '').trim();
    const sort = (req.query.sort || 'newest').trim();

    const conditions = [];
    const params = [];

    if (q) {
      conditions.push('(l.title LIKE ? OR l.description LIKE ? OR u.name LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    if (tag) {
      conditions.push('l.primary_tag_id = ?');
      params.push(tag);
    }

    if (exchangeType) {
      conditions.push('l.exchange_type = ?');
      params.push(exchangeType);
    }

    if (condition) {
      conditions.push('l.condition_label = ?');
      params.push(condition);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortClause = sort === 'price'
      ? 'ORDER BY l.price DESC, l.created_at DESC'
      : 'ORDER BY l.created_at DESC';

    const [categories, itemRows] = await Promise.all([
      getCategories(),
      pool.query(`
        ${listingSelect}
        ${whereClause}
        ${listingGroupBy}
        ${sortClause}
      `, params).then(([rows]) => rows)
    ]);

    res.render('items', {
      title: 'Browse listings',
      categories,
      items: itemRows.map(mapListing),
      filters: { q, tag, exchangeType, condition, sort },
      popularHashTags: POPULAR_HASH_TAGS
    });
  } catch (error) {
    next(error);
  }
});

router.get('/items/new', requireAuth, async (req, res, next) => {
  try {
    const categories = await getCategories();
    res.render('create-listing', {
      title: 'Create a new listing',
      categories,
      selectedTags: []
    });
  } catch (error) {
    next(error);
  }
});

router.post('/items/new', requireAuth, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 3 }
]), async (req, res, next) => {
  try {
    const title = (req.body.title || '').trim();
    const description = (req.body.description || '').trim();
    const primaryTagId = Number(req.body.primary_tag_id) || 0;
    const conditionLabel = (req.body.condition_label || 'Good').trim();
    const exchangeType = (req.body.exchange_type || 'Gift').trim();
    const price = Number(req.body.price || 0);
    const location = (req.body.location || 'Campus pickup point').trim();
    const responseNote = (req.body.response_note || 'Usually within 1 day').trim();
    const selectedTags = Array.isArray(req.body.tag_ids)
      ? req.body.tag_ids.map((value) => Number(value)).filter(Boolean)
      : [Number(req.body.tag_ids)].filter(Boolean);

    if (!title || !description || !primaryTagId) {
      req.session.flash = { type: 'error', message: 'Please fill in the title, category and description.' };
      return res.redirect('/items/new');
    }

    const coverImage = req.files?.coverImage?.[0]
      ? `/uploads/items/${req.files.coverImage[0].filename}`
      : '/placeholders/item-placeholder.png';
    const galleryImages = req.files?.galleryImages?.map((file) => `/uploads/items/${file.filename}`) || [];

    const [result] = await pool.query(`
      INSERT INTO listings (
        user_id,
        primary_tag_id,
        title,
        description,
        price,
        exchange_type,
        condition_label,
        status,
        location,
        response_note,
        cover_image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?)
    `, [
      req.session.userId,
      primaryTagId,
      title,
      description,
      Number.isFinite(price) ? price : 0,
      exchangeType,
      conditionLabel,
      location,
      responseNote,
      coverImage
    ]);

    const listingId = result.insertId;
    const uniqueTagIds = [...new Set([primaryTagId, ...selectedTags])];

    if (uniqueTagIds.length) {
      const values = uniqueTagIds.map((tagId) => [listingId, tagId]);
      await pool.query('INSERT INTO listing_tags (listing_id, tag_id) VALUES ?', [values]);
    }

    if (galleryImages.length) {
      const imageValues = galleryImages.map((image, index) => [listingId, image, index + 1]);
      await pool.query('INSERT INTO listing_images (listing_id, image_url, sort_order) VALUES ?', [imageValues]);
    }

    req.session.flash = { type: 'success', message: 'Listing created successfully.' };
    return res.redirect(`/items/${listingId}`);
  } catch (error) {
    next(error);
  }
});

router.get('/items/:id', async (req, res, next) => {
  try {
    const listingId = Number(req.params.id);

    const [rows] = await pool.query(`
      ${listingSelect}
      WHERE l.id = ?
      ${listingGroupBy}
      LIMIT 1
    `, [listingId]);

    if (!rows.length) {
      return res.status(404).render('404', { title: 'Listing not found' });
    }

    const item = mapListing(rows[0]);

    const [ownerRows, relatedRows] = await Promise.all([
      pool.query(`
        SELECT id, name, email, bio, major, campus, joined_label, avatar_url, badge_label, response_rate, verified
        FROM users
        WHERE id = ?
        LIMIT 1
      `, [item.owner_id]).then(([result]) => result),
      pool.query(`
        ${listingSelect}
        WHERE l.primary_tag_id = ? AND l.id <> ?
        ${listingGroupBy}
        ORDER BY l.created_at DESC
        LIMIT 4
      `, [item.primary_tag_id, item.id]).then(([result]) => result)
    ]);

    const owner = ownerRows[0];

    res.render('item-detail', {
      title: item.title,
      item,
      owner,
      relatedItems: relatedRows.map(mapListing)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const role = (req.query.role || 'all').trim();
    const conditions = [];
    const params = [];

    if (q) {
      conditions.push('(u.name LIKE ? OR u.major LIKE ? OR u.department LIKE ?)');
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    if (role === 'active-sharers') {
      conditions.push('(SELECT COUNT(*) FROM listings l2 WHERE l2.user_id = u.id) >= 2');
    } else if (role === 'tutors') {
      conditions.push('u.badge_label LIKE ?');
      params.push('%Tutor%');
    } else if (role === 'textbook-owners') {
      conditions.push('u.badge_label LIKE ?');
      params.push('%Textbook%');
    } else if (role === 'equipment-lenders') {
      conditions.push('u.badge_label LIKE ?');
      params.push('%Equipment%');
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.bio,
        u.department,
        u.year_of_study,
        u.major,
        u.campus,
        u.joined_label,
        u.avatar_url,
        u.badge_label,
        u.response_rate,
        u.verified,
        COUNT(l.id) AS listing_count
      FROM users u
      LEFT JOIN listings l ON l.user_id = u.id
      ${whereClause}
      GROUP BY
        u.id, u.name, u.email, u.bio, u.department, u.year_of_study,
        u.major, u.campus, u.joined_label, u.avatar_url, u.badge_label,
        u.response_rate, u.verified
      ORDER BY listing_count DESC, u.name ASC
    `, params);

    res.render('users', {
      title: 'Community members',
      users: rows.map((user) => ({
        ...user,
        avatar_url: user.avatar_url || '/placeholders/profile-placeholder.png',
        initials: withInitials(user.name)
      })),
      filters: { q, role },
      roleFilters: ROLE_FILTERS
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const userId = Number(req.params.id);

    const [userRows] = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.bio,
        u.department,
        u.year_of_study,
        u.major,
        u.campus,
        u.joined_label,
        u.avatar_url,
        u.badge_label,
        u.response_rate,
        u.verified,
        COUNT(l.id) AS listing_count,
        COUNT(DISTINCT l.primary_tag_id) AS categories_shared
      FROM users u
      LEFT JOIN listings l ON l.user_id = u.id
      WHERE u.id = ?
      GROUP BY
        u.id, u.name, u.email, u.bio, u.department, u.year_of_study,
        u.major, u.campus, u.joined_label, u.avatar_url, u.badge_label,
        u.response_rate, u.verified
      LIMIT 1
    `, [userId]);

    if (!userRows.length) {
      return res.status(404).render('404', { title: 'Member not found' });
    }

    const [items, userTags] = await Promise.all([
      pool.query(`
        ${listingSelect}
        WHERE u.id = ?
        ${listingGroupBy}
        ORDER BY l.created_at DESC
      `, [userId]).then(([rows]) => rows),
      pool.query(`
        SELECT t.id, t.name
        FROM listing_tags lt
        JOIN tags t ON t.id = lt.tag_id
        JOIN listings l ON l.id = lt.listing_id
        WHERE l.user_id = ?
        GROUP BY t.id, t.name
        ORDER BY t.name ASC
      `, [userId]).then(([rows]) => rows)
    ]);

    const user = {
      ...userRows[0],
      avatar_url: userRows[0].avatar_url || '/placeholders/profile-placeholder.png',
      initials: withInitials(userRows[0].name)
    };

    res.render('profile', {
      title: user.name,
      user,
      items: items.map(mapListing),
      userTags
    });
  } catch (error) {
    next(error);
  }
});

router.get('/tags', async (req, res, next) => {
  try {
    const [categories, featuredRows] = await Promise.all([
      getCategories(),
      pool.query(`
        ${listingSelect}
        ${listingGroupBy}
        ORDER BY l.created_at DESC
        LIMIT 4
      `).then(([rows]) => rows)
    ]);

    res.render('tags', {
      title: 'Categories and tags',
      categories,
      popularHashTags: POPULAR_HASH_TAGS,
      featuredItems: featuredRows.map(mapListing)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/tags/:id/items', async (req, res, next) => {
  try {
    const tagId = Number(req.params.id);
    const [tagRows, categories, itemRows] = await Promise.all([
      pool.query('SELECT * FROM tags WHERE id = ? LIMIT 1', [tagId]).then(([rows]) => rows),
      getCategories(),
      pool.query(`
        ${listingSelect}
        WHERE l.primary_tag_id = ?
        ${listingGroupBy}
        ORDER BY l.created_at DESC
      `, [tagId]).then(([rows]) => rows)
    ]);

    if (!tagRows.length) {
      return res.status(404).render('404', { title: 'Category not found' });
    }

    res.render('tag-items', {
      title: `${tagRows[0].name} listings`,
      tag: tagRows[0],
      categories,
      items: itemRows.map(mapListing)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/signin', (req, res) => {
  res.render('signin', { title: 'Sign in' });
});

router.post('/signin', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE email = ? LIMIT 1', [email]);

    if (!rows.length || rows[0].password_hash !== hashPassword(password)) {
      req.session.flash = { type: 'error', message: 'Invalid email or password. Demo accounts use password admin.' };
      return res.redirect('/signin');
    }

    req.session.userId = rows[0].id;
    req.session.flash = { type: 'success', message: 'Signed in successfully.' };
    return res.redirect('/');
  } catch (error) {
    next(error);
  }
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Create account' });
});

router.post('/signup', async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const confirmPassword = req.body.confirm_password || '';

    if (!name || !email || !password) {
      req.session.flash = { type: 'error', message: 'Please complete all required account fields.' };
      return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
      req.session.flash = { type: 'error', message: 'Passwords do not match.' };
      return res.redirect('/signup');
    }

    const joinedLabel = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const [result] = await pool.query(`
      INSERT INTO users (
        name, email, password_hash, bio, department, year_of_study, major, campus,
        joined_label, avatar_url, badge_label, response_rate, verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 90, 0)
    `, [
      name,
      email,
      hashPassword(password),
      'New member of CampusCycle.',
      'Student',
      'Year 1',
      'New Member',
      'Campus',
      joinedLabel,
      '/placeholders/profile-placeholder.png',
      'New Member'
    ]);

    req.session.userId = result.insertId;
    req.session.flash = { type: 'success', message: 'Account created. You can now add listings.' };
    return res.redirect('/items/new');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      req.session.flash = { type: 'error', message: 'That email is already registered. Please sign in instead.' };
      return res.redirect('/signin');
    }
    return next(error);
  }
});

router.post('/signout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

router.get('/messages', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, major, avatar_url, badge_label
      FROM users
      WHERE id <> ?
      ORDER BY verified DESC, name ASC
      LIMIT 5
    `, [req.session.userId]);

    res.render('messages', {
      title: 'Messages',
      contacts: rows.map((row, index) => ({
        ...row,
        avatar_url: row.avatar_url || '/placeholders/profile-placeholder.png',
        preview: [
          'Thanks for the quick reply. I can collect it after class.',
          'The calculator is still available for this week.',
          'Would tomorrow morning work for pickup?',
          'I have uploaded extra photos to the listing.',
          'Sure, I can swap near the library entrance.'
        ][index % 5]
      }))
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
