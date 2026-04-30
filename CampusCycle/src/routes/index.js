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

const CAMPUS_WEATHER_LOCATION = {
  name: 'University campus demo location',
  latitude: 51.456,
  longitude: -0.243,
  timezone: 'Europe/London'
};

function weatherLabel(code) {
  const labels = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Heavy rain showers',
    95: 'Thunderstorm'
  };
  return labels[Number(code)] || 'Campus weather update';
}

async function getCampusWeather() {
  const fallback = {
    location: CAMPUS_WEATHER_LOCATION.name,
    temperature: 'Unavailable',
    windSpeed: 'Unavailable',
    condition: 'External weather API unavailable during demo',
    source: 'Fallback demo state'
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', CAMPUS_WEATHER_LOCATION.latitude);
    url.searchParams.set('longitude', CAMPUS_WEATHER_LOCATION.longitude);
    url.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m');
    url.searchParams.set('timezone', CAMPUS_WEATHER_LOCATION.timezone);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }

    const payload = await response.json();
    const current = payload.current || {};

    return {
      location: CAMPUS_WEATHER_LOCATION.name,
      temperature: `${Math.round(Number(current.temperature_2m))}°C`,
      windSpeed: `${Math.round(Number(current.wind_speed_10m))} km/h`,
      condition: weatherLabel(current.weather_code),
      source: 'Open-Meteo API'
    };
  } catch (error) {
    return fallback;
  }
}

function calculateMatchScore(baseItem, candidate) {
  const baseTags = new Set((baseItem.tag_list || []).map((tag) => Number(tag.id)));
  const candidateTags = new Set((candidate.tag_list || []).map((tag) => Number(tag.id)));
  const sharedTags = [...candidateTags].filter((tagId) => baseTags.has(tagId));

  let score = 0;
  const reasons = [];

  if (candidate.primary_tag_id === baseItem.primary_tag_id) {
    score += 40;
    reasons.push('same category');
  }

  if (sharedTags.length) {
    score += sharedTags.length * 15;
    reasons.push(`${sharedTags.length} shared tag${sharedTags.length === 1 ? '' : 's'}`);
  }

  if (candidate.exchange_type === baseItem.exchange_type) {
    score += 10;
    reasons.push('same exchange type');
  }

  if (candidate.condition_label === baseItem.condition_label) {
    score += 5;
    reasons.push('similar condition');
  }

  if (candidate.owner_id !== baseItem.owner_id) {
    score += 5;
  }

  return {
    score: Math.min(score, 100),
    reasons: reasons.length ? reasons.join(', ') : 'general campus resource match'
  };
}

function scoreUserRecommendation(user, candidate) {
  const preferredTags = new Set((user.preferredTagIds || []).map(Number));
  const candidateTags = new Set((candidate.tag_list || []).map((tag) => Number(tag.id)));
  const sharedTags = [...candidateTags].filter((tagId) => preferredTags.has(tagId));

  let score = sharedTags.length * 20;
  const reasons = [];

  if (preferredTags.has(Number(candidate.primary_tag_id))) {
    score += 35;
    reasons.push('matches your previous categories');
  }

  if (sharedTags.length) {
    reasons.push(`${sharedTags.length} shared interest tag${sharedTags.length === 1 ? '' : 's'}`);
  }

  if (candidate.owner_id !== user.id) {
    score += 10;
  }

  if (candidate.exchange_type === 'Gift') {
    score += 5;
    reasons.push('free resource');
  }

  return {
    score: Math.min(score, 100),
    reasons: reasons.length ? reasons.join(', ') : 'popular active listing'
  };
}

async function awardPoints(userId, points, eventType, description) {
  await pool.query('UPDATE users SET points = points + ? WHERE id = ?', [points, userId]);
  await pool.query(
    'INSERT INTO point_events (user_id, event_type, points, description) VALUES (?, ?, ?, ?)',
    [userId, eventType, points, description]
  );
}

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
    u.points AS owner_points,
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
    u.id, u.name, u.major, u.avatar_url, u.badge_label, u.points, u.verified,
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
    const [categories, featuredRows, recentUsers, statsRows, weather] = await Promise.all([
      getCategories(),
      pool.query(`
        ${listingSelect}
        ${listingGroupBy}
        ORDER BY l.created_at DESC
        LIMIT 3
      `).then(([rows]) => rows),
      pool.query(`
        SELECT id, name, major, badge_label, avatar_url, points
        FROM users
        ORDER BY created_at DESC
        LIMIT 3
      `).then(([rows]) => rows),
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM listings) AS listings_count,
          (SELECT COUNT(*) FROM users) AS users_count,
          (SELECT COUNT(*) FROM tags) AS tags_count
      `).then(([rows]) => rows),
      getCampusWeather()
    ]);

    res.render('index', {
      title: 'Browse campus resources',
      categories,
      featuredItems: featuredRows.map(mapListing),
      recentUsers,
      popularHashTags: POPULAR_HASH_TAGS,
      stats: statsRows[0],
      weather
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

router.get('/api/weather', async (req, res) => {
  const weather = await getCampusWeather();
  res.json({ status: 'ok', weather });
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

    await awardPoints(req.session.userId, 10, 'LISTING_CREATED', `Created listing: ${title}`);

    req.session.flash = {
      type: 'success',
      message: 'Listing created successfully. You earned 10 community points.'
    };

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

    const [ownerRows, candidateRows] = await Promise.all([
      pool.query(`
        SELECT id, name, email, bio, major, campus, joined_label, avatar_url, badge_label, points, response_rate, verified
        FROM users
        WHERE id = ?
        LIMIT 1
      `, [item.owner_id]).then(([result]) => result),
      pool.query(`
        ${listingSelect}
        WHERE l.id <> ? AND l.status = 'Active'
        ${listingGroupBy}
        ORDER BY l.created_at DESC
        LIMIT 50
      `, [item.id]).then(([result]) => result)
    ]);

    const owner = ownerRows[0];

    const relatedItems = candidateRows
      .map(mapListing)
      .map((candidate) => {
        const match = calculateMatchScore(item, candidate);
        return {
          ...candidate,
          match_score: match.score,
          match_reason: match.reasons
        };
      })
      .filter((candidate) => candidate.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score || new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);

    res.render('item-detail', {
      title: item.title,
      item,
      owner,
      relatedItems
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
        u.points,
        u.response_rate,
        u.verified,
        COUNT(l.id) AS listing_count
      FROM users u
      LEFT JOIN listings l ON l.user_id = u.id
      ${whereClause}
      GROUP BY
        u.id, u.name, u.email, u.bio, u.department, u.year_of_study,
        u.major, u.campus, u.joined_label, u.avatar_url, u.badge_label,
        u.points, u.response_rate, u.verified
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
        u.points,
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
        u.points, u.response_rate, u.verified
      LIMIT 1
    `, [userId]);

    if (!userRows.length) {
      return res.status(404).render('404', { title: 'Member not found' });
    }

    const [items, userTags, pointEvents, recentMessages] = await Promise.all([
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
      `, [userId]).then(([rows]) => rows),
      pool.query(`
        SELECT event_type, points, description, created_at
        FROM point_events
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 6
      `, [userId]).then(([rows]) => rows.map((row) => ({
        ...row,
        created_label: timeAgo(row.created_at)
      }))),
      req.session.userId
        ? pool.query(`
            SELECT
              m.id,
              m.body,
              m.created_at,
              l.id AS listing_id,
              l.title AS listing_title,
              m.sender_id,
              m.receiver_id,
              sender.name AS sender_name,
              receiver.name AS receiver_name
            FROM messages m
            JOIN users sender ON sender.id = m.sender_id
            JOIN users receiver ON receiver.id = m.receiver_id
            LEFT JOIN listings l ON l.id = m.listing_id
            WHERE
              (? = ? AND (m.sender_id = ? OR m.receiver_id = ?))
              OR
              (? <> ? AND ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)))
            ORDER BY m.created_at DESC
            LIMIT 5
          `, [
            req.session.userId, userId, req.session.userId, req.session.userId,
            req.session.userId, userId, req.session.userId, userId, userId, req.session.userId
          ]).then(([rows]) => rows.map((row) => ({
            ...row,
            direction: row.sender_id === req.session.userId ? 'You sent' : `${row.sender_name.split(' ')[0]} sent`,
            created_label: timeAgo(row.created_at)
          })))
        : Promise.resolve([])
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
      userTags,
      pointEvents,
      recentMessages
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

router.get('/recommendations', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;

    const [preferenceRows, candidateRows] = await Promise.all([
      pool.query(`
        SELECT DISTINCT lt.tag_id
        FROM listings l
        JOIN listing_tags lt ON lt.listing_id = l.id
        WHERE l.user_id = ?
      `, [userId]).then(([rows]) => rows),
      pool.query(`
        ${listingSelect}
        WHERE l.user_id <> ? AND l.status = 'Active'
        ${listingGroupBy}
        ORDER BY l.created_at DESC
        LIMIT 50
      `, [userId]).then(([rows]) => rows)
    ]);

    const preferenceTagIds = preferenceRows.map((row) => Number(row.tag_id));

    const recommendationContext = {
      id: userId,
      preferredTagIds: preferenceTagIds.length ? preferenceTagIds : [1, 2, 5]
    };

    const recommendations = candidateRows
      .map(mapListing)
      .map((candidate) => {
        const match = scoreUserRecommendation(recommendationContext, candidate);
        return {
          ...candidate,
          match_score: match.score,
          match_reason: match.reasons
        };
      })
      .sort((a, b) => b.match_score - a.match_score || new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 8);

    res.render('recommendations', {
      title: 'Recommended Matches',
      recommendations,
      hasPersonalHistory: preferenceRows.length > 0
    });
  } catch (error) {
    next(error);
  }
});

router.get('/signin', (req, res) => {
  res.render('signin', {
    title: 'Sign in',
    currentPath: '/signin',
    hideFooter: true,
    bodyClass: 'auth-body'
  });
});

router.post('/signin', async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE email = ? LIMIT 1', [email]);

    if (!rows.length || rows[0].password_hash !== hashPassword(password)) {
      req.session.flash = {
        type: 'error',
        message: 'Invalid email or password. Demo student accounts use password demo123.'
      };
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
  res.render('signup', {
    title: 'Create account',
    currentPath: '/signup',
    hideFooter: true,
    bodyClass: 'auth-body'
  });
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
        name,
        email,
        password_hash,
        bio,
        department,
        year_of_study,
        major,
        campus,
        joined_label,
        avatar_url,
        badge_label,
        points,
        response_rate,
        verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 20, 90, 0)
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

    await pool.query(
      'INSERT INTO point_events (user_id, event_type, points, description) VALUES (?, ?, ?, ?)',
      [result.insertId, 'ACCOUNT_CREATED', 20, 'Joined CampusCycle']
    );

    req.session.flash = {
      type: 'success',
      message: 'Account created. You earned 20 starter community points.'
    };

    return res.redirect('/items/new');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      req.session.flash = {
        type: 'error',
        message: 'That email is already registered. Please sign in instead.'
      };
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
    const currentUserId = req.session.userId;
    const selectedReceiverIdFromQuery = Number(req.query.receiver_id) || null;
    const selectedListingIdFromQuery = Number(req.query.listing_id) || null;
    const requestedConversation = (req.query.conversation || '').trim();

    const [rows, users, listings] = await Promise.all([
      pool.query(`
        SELECT
          m.id,
          m.body,
          m.created_at,
          l.id AS listing_id,
          l.title AS listing_title,
          sender.id AS sender_id,
          sender.name AS sender_name,
          sender.avatar_url AS sender_avatar_url,
          receiver.id AS receiver_id,
          receiver.name AS receiver_name,
          receiver.avatar_url AS receiver_avatar_url
        FROM messages m
        JOIN users sender ON sender.id = m.sender_id
        JOIN users receiver ON receiver.id = m.receiver_id
        LEFT JOIN listings l ON l.id = m.listing_id
        WHERE m.sender_id = ? OR m.receiver_id = ?
        ORDER BY m.created_at ASC
      `, [currentUserId, currentUserId]).then(([result]) => result),
      pool.query(`
        SELECT id, name, avatar_url, badge_label
        FROM users
        WHERE id <> ?
        ORDER BY name ASC
      `, [currentUserId]).then(([result]) => result),
      pool.query(`
        SELECT id, title, user_id
        FROM listings
        WHERE status = 'Active'
        ORDER BY created_at DESC
        LIMIT 60
      `).then(([result]) => result)
    ]);

    const mappedMessages = rows.map((row) => {
      const otherPerson = row.sender_id === currentUserId
        ? { id: row.receiver_id, name: row.receiver_name, avatar_url: row.receiver_avatar_url }
        : { id: row.sender_id, name: row.sender_name, avatar_url: row.sender_avatar_url };

      return {
        ...row,
        otherPerson: {
          ...otherPerson,
          avatar_url: otherPerson.avatar_url || '/placeholders/profile-placeholder.png'
        },
        direction: row.sender_id === currentUserId ? 'Sent' : 'Received',
        isMine: row.sender_id === currentUserId,
        created_label: timeAgo(row.created_at),
        conversationKey: `${otherPerson.id}-${row.listing_id || 0}`
      };
    });

    const conversationMap = new Map();

    mappedMessages.forEach((message) => {
      const key = message.conversationKey;
      const existing = conversationMap.get(key);

      if (!existing) {
        conversationMap.set(key, {
          key,
          otherPerson: message.otherPerson,
          listing_id: message.listing_id,
          listing_title: message.listing_title,
          latest: message,
          messages: [message]
        });
      } else {
        existing.messages.push(message);

        if (new Date(message.created_at) > new Date(existing.latest.created_at)) {
          existing.latest = message;
        }
      }
    });

    let selectedConversationKey = requestedConversation;

    if (!selectedConversationKey && selectedReceiverIdFromQuery) {
      selectedConversationKey = `${selectedReceiverIdFromQuery}-${selectedListingIdFromQuery || 0}`;
    }

    let selectedConversation = selectedConversationKey
      ? conversationMap.get(selectedConversationKey)
      : null;

    if (!selectedConversation && selectedReceiverIdFromQuery) {
      const selectedUser = users.find((user) => Number(user.id) === selectedReceiverIdFromQuery);
      const selectedListing = listings.find((listing) => Number(listing.id) === selectedListingIdFromQuery);

      if (selectedUser) {
        selectedConversation = {
          key: `${selectedReceiverIdFromQuery}-${selectedListingIdFromQuery || 0}`,
          otherPerson: {
            ...selectedUser,
            avatar_url: selectedUser.avatar_url || '/placeholders/profile-placeholder.png'
          },
          listing_id: selectedListingIdFromQuery,
          listing_title: selectedListing ? selectedListing.title : null,
          latest: null,
          messages: []
        };
      }
    }

    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.latest.created_at) - new Date(a.latest.created_at));

    if (!selectedConversation && conversations.length) {
      selectedConversation = conversations[0];
      selectedConversationKey = selectedConversation.key;
    }

    const selectedReceiverId = selectedConversation
      ? Number(selectedConversation.otherPerson.id)
      : selectedReceiverIdFromQuery;

    const selectedListingId = selectedConversation
      ? Number(selectedConversation.listing_id) || null
      : selectedListingIdFromQuery;

    res.render('messages', {
      title: 'Messages',
      conversations,
      selectedConversation,
      users: users.map((user) => ({
        ...user,
        avatar_url: user.avatar_url || '/placeholders/profile-placeholder.png'
      })),
      listings,
      selectedReceiverId,
      selectedListingId,
      selectedConversationKey: selectedConversation ? selectedConversation.key : selectedConversationKey
    });
  } catch (error) {
    next(error);
  }
});

router.post('/messages', requireAuth, async (req, res, next) => {
  try {
    const receiverId = Number(req.body.receiver_id) || 0;
    const listingId = Number(req.body.listing_id) || null;
    const body = (req.body.body || '').trim();

    if (!receiverId || !body) {
      req.session.flash = { type: 'error', message: 'Please choose a recipient and write a message.' };
      return res.redirect('/messages');
    }

    if (receiverId === req.session.userId) {
      req.session.flash = { type: 'error', message: 'You cannot send a message to yourself.' };
      return res.redirect('/messages');
    }

    const [receiverRows] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [receiverId]);

    if (!receiverRows.length) {
      req.session.flash = { type: 'error', message: 'Selected recipient does not exist.' };
      return res.redirect('/messages');
    }

    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, listing_id, body) VALUES (?, ?, ?, ?)',
      [req.session.userId, receiverId, listingId || null, body]
    );

    await awardPoints(req.session.userId, 2, 'MESSAGE_SENT', 'Sent a resource request message');

    req.session.flash = {
      type: 'success',
      message: 'Message sent successfully. You earned 2 community points.'
    };

    return res.redirect(`/messages?conversation=${receiverId}-${listingId || 0}`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
