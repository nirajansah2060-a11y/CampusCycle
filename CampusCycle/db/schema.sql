SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

DROP TABLE IF EXISTS point_events;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS listing_tags;
DROP TABLE IF EXISTS listing_images;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT,
  department VARCHAR(100),
  year_of_study VARCHAR(50),
  major VARCHAR(100),
  campus VARCHAR(100),
  joined_label VARCHAR(50),
  avatar_url VARCHAR(255),
  badge_label VARCHAR(80),
  points INT DEFAULT 0,
  response_rate INT DEFAULT 95,
  verified TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE point_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  points INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_point_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(90) NOT NULL UNIQUE,
  description VARCHAR(255),
  icon_label VARCHAR(10),
  accent_color VARCHAR(20) DEFAULT '#4b3aa5',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  primary_tag_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  exchange_type ENUM('Gift', 'Loan', 'Swap') DEFAULT 'Loan',
  condition_label VARCHAR(60) DEFAULT 'Good',
  status VARCHAR(30) DEFAULT 'Active',
  location VARCHAR(120),
  response_note VARCHAR(120),
  cover_image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_listings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_listings_primary_tag FOREIGN KEY (primary_tag_id) REFERENCES tags(id) ON DELETE RESTRICT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE listing_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 1,
  CONSTRAINT fk_listing_images_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE listing_tags (
  listing_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (listing_id, tag_id),
  CONSTRAINT fk_listing_tags_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  CONSTRAINT fk_listing_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  listing_id INT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



INSERT INTO users (name, email, password_hash, bio, department, year_of_study, major, campus, joined_label, avatar_url, badge_label, points, response_rate, verified) VALUES
('Sarah Chen', 'sarah@campuscycle.test', 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791', 'Passionate about sustainable tech. Lending engineering tools and occasional tutoring calculators. Let us build something useful together.', 'BSc Engineering', 'Year 2', 'Computer Engineering', 'North Campus', 'Sept 2024', '/uploads/profiles/sarah-chen.png', 'Verified', 145, 98, 1),
('Marcus Johnson', 'marcus@campuscycle.test', 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791', 'Final year architecture student. I have many design books and craftsmanship equipment available for short term borrow.', 'BA Architecture', 'Year 4', 'Architecture', 'South Campus', 'Aug 2024', '/uploads/profiles/marcus-johnson.png', 'Textbook Owner', 100, 97, 1),
('Elena Rodriguez', 'elena@campuscycle.test', 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791', 'Physics enthusiast. Willing to trade tutoring sessions for lab equipment or textbooks. Help me, help you.', 'BSc Physics', 'Year 3', 'Physics', 'Science Campus', 'Oct 2024', '/uploads/profiles/elena-rodriguez.png', 'Math Tutor', 90, 96, 1),
('Liam O''Connor', 'liam@campuscycle.test', 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791', 'I have a variety of camera lenses and lighting equipment for media projects. Also have some great digital art textbooks.', 'BFA Digital Media', 'Year 2', 'Digital Media', 'City Campus', 'July 2024', '/uploads/profiles/liam-oconnor.png', 'Equipment Lender', 80, 95, 1),
('Amina Jalloh', 'amina@campuscycle.test', 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791', 'Medicine student with lots of medical texts and study guides. Happy to share and help anyone in pre med as well.', 'MBBS Medicine', 'Year 4', 'Medicine', 'Medical Campus', 'Sept 2024', '/uploads/profiles/amina-jalloh.png', 'Active Sharer', 130, 99, 1),
('Alex Johnson', 'alex@campuscycle.test', 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791', 'Sharing textbooks and coding notes. Happy to help with Python tutoring. Just looking to clear out some clutter and help fellow students.', 'Computer Science', 'Year 3', 'Computer Science', 'North Campus', 'Sept 2023', '/uploads/profiles/alex-johnson.png', 'Verified Student', 170, 98, 1),
('Tom Wilson', 'tom@campuscycle.test', 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791', 'Just joined. Have several freshman textbooks for business administration and accounting modules.', 'BSc Business', 'Year 1', 'Business', 'West Campus', 'Nov 2024', '/uploads/profiles/tom-wilson.png', 'New Member', 30, 92, 0);

INSERT INTO point_events (user_id, event_type, points, description, created_at) VALUES
(6, 'ACCOUNT_CREATED', 20, 'Joined CampusCycle', '2026-03-01 08:00:00'),
(6, 'LISTING_CREATED', 10, 'Created Data Structures textbook listing', '2026-03-16 10:15:00'),
(6, 'LISTING_CREATED', 10, 'Created Python notes listing', '2026-03-11 08:10:00'),
(1, 'MESSAGE_SENT', 2, 'Sent resource request message', '2026-03-18 09:00:00'),
(1, 'LISTING_CREATED', 10, 'Created calculator listing', '2026-03-15 11:20:00'),
(5, 'LISTING_CREATED', 10, 'Created organic chemistry textbook listing', '2026-03-13 15:45:00');

INSERT INTO tags (name, slug, description, icon_label, accent_color) VALUES
('Textbooks', 'textbooks', 'Pre owned course materials and required reading for all majors.', 'TB', '#dce7ff'),
('Study Notes', 'study-notes', 'Lecture summaries, flashcards and exam preparation guides.', 'NT', '#f0defc'),
('Lab Equipment', 'lab-equipment', 'Lab coats, goggles and specialised tools for STEM students.', 'LB', '#dcf3e7'),
('Kitchenware', 'kitchenware', 'Microwaves, kettles and essential dorm room appliances.', 'KT', '#f7e8dc'),
('Tutoring', 'tutoring', 'Find peer tutors or offer your services to fellow students.', 'TR', '#e4e8fb'),
('Tools', 'tools', 'Screwdrivers, hammers and toolsets for dorm repairs and projects.', 'TL', '#eef1f7');

INSERT INTO listings (user_id, primary_tag_id, title, description, price, exchange_type, condition_label, status, location, response_note, cover_image_url, created_at) VALUES
(6, 1, 'Data Structures and Algorithms Textbook', 'This is the 4th edition of the comprehensive guide to data structures and algorithms. Used for one semester and still in pristine condition with no highlights or marks. Perfect for CSC201 or similar courses.', 45.00, 'Loan', 'Like New', 'Active', 'North Campus Library', 'Usually within 2 hours', '/uploads/items/data-structures-cover.png', '2026-03-16 10:15:00'),
(1, 6, 'TI 84 Plus CE Graphing Calculator', 'Upgrading to a new model. This one works perfectly and only needs AAA batteries. Great for maths, engineering and physics students.', 85.00, 'Gift', 'Good', 'Active', 'Engineering Atrium', 'Usually within 6 hours', '/uploads/items/ti84-cover.png', '2026-03-15 11:20:00'),
(3, 4, 'Electric Kettle 1.7L', 'Looking to swap for a toaster or small rice cooker. Condition is great and it is ideal for shared accommodation.', 0.00, 'Swap', 'Good', 'Active', 'South Residence', 'Usually within 1 day', '/uploads/items/electric-kettle-cover.png', '2026-03-14 09:30:00'),
(5, 1, 'Organic Chemistry Principles and Mechanisms', 'Detailed organic chemistry textbook with helpful diagrams. Perfect for first and second year chemistry students.', 45.00, 'Loan', 'Very Good', 'Active', 'Science Campus', 'Usually within 3 hours', '/uploads/items/organic-chemistry-cover.png', '2026-03-13 15:45:00'),
(2, 1, 'Classic Literature Bundle Set of 5', 'Bundle of classic literature texts in good condition. Ideal for humanities students and book clubs.', 30.00, 'Gift', 'Good', 'Active', 'Arts Building Reception', 'Usually within 5 hours', '/uploads/items/classics-bundle-cover.png', '2026-03-12 16:20:00'),
(6, 2, 'CS101 Python Master Notes', 'Comprehensive Python notes covering functions, loops, OOP and file handling. Includes quick revision cheatsheets.', 10.00, 'Loan', 'Digital Print', 'Active', 'Computer Lab', 'Usually within 2 hours', '/uploads/items/python-notes-cover.png', '2026-03-11 08:10:00'),
(6, 1, 'Intro to Algorithms 4th Edition', 'Student friendly algorithms textbook with worked examples and clean pages.', 45.00, 'Loan', 'Used Like New', 'Active', 'North Campus', 'Usually within 2 hours', '/uploads/items/intro-algorithms-cover.png', '2026-03-10 14:40:00'),
(6, 2, 'Computer Networks Notes', 'Digital and print friendly notes for networking fundamentals, protocols and lab prep.', 5.00, 'Gift', 'Digital Print', 'Active', 'North Campus', 'Usually within 2 hours', '/uploads/items/computer-networks-cover.png', '2026-03-09 12:15:00'),
(6, 6, '21 Speed Mountain Bike', 'Reliable campus bike with recently serviced brakes. Perfect for daily commuting between halls and labs.', 120.00, 'Swap', 'Used', 'Active', 'Bike Shed', 'Usually within 8 hours', '/uploads/items/mountain-bike-cover.png', '2026-03-08 17:05:00'),
(1, 1, 'Discrete Mathematics', 'Excellent condition textbook with only light shelf wear. Great for CS and maths pathways.', 25.00, 'Loan', 'Excellent', 'Active', 'Engineering Atrium', 'Usually within 4 hours', '/uploads/items/discrete-math-cover.png', '2026-03-07 13:45:00'),
(1, 1, 'Introduction to Java', 'Textbook suitable for programming fundamentals. Used but clean with no missing pages.', 20.00, 'Loan', 'Good', 'Active', 'Engineering Atrium', 'Usually within 4 hours', '/uploads/items/java-cover.png', '2026-03-06 11:35:00'),
(2, 4, 'Waterproof College Backpack Navy', 'Waterproof backpack with padded straps. Spacious enough for a 15 inch laptop and notebooks.', 25.00, 'Gift', 'Good', 'Active', 'Arts Building Reception', 'Usually within 1 day', '/uploads/items/backpack-cover.png', '2026-03-05 10:05:00');

INSERT INTO listing_images (listing_id, image_url, sort_order) VALUES
(1, '/uploads/items/data-structures-1.png', 1),
(1, '/uploads/items/data-structures-2.png', 2),
(1, '/uploads/items/data-structures-3.png', 3),
(2, '/uploads/items/ti84-detail.png', 1),
(3, '/uploads/items/electric-kettle-detail.png', 1),
(4, '/uploads/items/organic-chemistry-detail.png', 1),
(5, '/uploads/items/classics-bundle-detail.png', 1),
(6, '/uploads/items/python-notes-detail.png', 1),
(7, '/uploads/items/intro-algorithms-detail.png', 1),
(8, '/uploads/items/computer-networks-detail.png', 1),
(9, '/uploads/items/mountain-bike-detail.png', 1),
(10, '/uploads/items/discrete-math-detail.png', 1),
(11, '/uploads/items/java-detail.png', 1),
(12, '/uploads/items/backpack-detail.png', 1);

INSERT INTO listing_tags (listing_id, tag_id) VALUES
(1, 1), (1, 2), (1, 5),
(2, 6), (2, 5),
(3, 4),
(4, 1), (4, 3),
(5, 1),
(6, 2), (6, 5),
(7, 1), (7, 5),
(8, 2),
(9, 6),
(10, 1),
(11, 1),
(12, 4);


INSERT INTO messages (sender_id, receiver_id, listing_id, body, created_at) VALUES
(1, 6, 1, 'Hi Alex, is the Data Structures textbook still available to borrow this week?', '2026-03-18 09:00:00'),
(6, 1, 1, 'Yes, it is available. I can meet near the North Campus Library after 2pm.', '2026-03-18 09:20:00'),
(3, 6, 6, 'Could I use your Python notes before the Friday revision session?', '2026-03-18 10:15:00'),
(6, 3, 6, 'Sure, I can share the print copy today and you can return it next week.', '2026-03-18 10:25:00'),
(2, 1, 2, 'Is the calculator suitable for engineering maths exams?', '2026-03-18 11:05:00'),
(1, 2, 2, 'Yes, it is the TI 84 Plus CE and it works well for graphing and statistics.', '2026-03-18 11:15:00');
