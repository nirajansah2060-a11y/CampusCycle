require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const { pool, waitForDatabase } = require('./db');
const indexRoutes = require('./routes/index');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const SESSION_SECRET = process.env.SESSION_SECRET || 'campuscycle-demo-secret';

const uploadDirs = [
  path.join(__dirname, 'public', 'uploads', 'items'),
  path.join(__dirname, 'public', 'uploads', 'profiles'),
  path.join(__dirname, 'public', 'placeholders')
];

uploadDirs.forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.locals.site = {
  name: 'CampusCycle',
  tagline: 'Share, exchange, and cycle resources across campus.'
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(async (req, res, next) => {
  try {
    res.locals.currentPath = req.path;
    res.locals.currentUser = null;
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;

    if (req.session.userId) {
      const [rows] = await pool.query(
        `SELECT id, name, email, avatar_url, badge_label, verified FROM users WHERE id = ? LIMIT 1`,
        [req.session.userId]
      );
      if (rows.length) {
        res.locals.currentUser = rows[0];
      } else {
        delete req.session.userId;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

app.use('/', indexRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page not found'
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('500', {
    title: 'Something went wrong',
    message: error.message
  });
});

(async () => {
  try {
    await waitForDatabase();
    app.listen(PORT, () => {
      console.log(`CampusCycle running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not connect to the database:', error.message);
    process.exit(1);
  }
})();
