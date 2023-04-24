SET client_encoding = 'UTF8';
DROP DATABASE IF EXISTS library;
CREATE DATABASE library ENCODING = 'UTF8';
\c library
CREATE TABLE IF NOT EXISTS user_ (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(200) NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50),
  password VARCHAR(200) NOT NULL,
  role SMALLINT NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS author (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  origin VARCHAR(200)
);
ALTER TABLE author
  ADD CONSTRAINT uq_author UNIQUE(first_name, last_name, origin);
CREATE TABLE IF NOT EXISTS book (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  isbn VARCHAR(50) NOT NULL,
  num_pages BIGINT NOT NULL,
  image_url TEXT DEFAULT 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3u0UEA-Gfpsphl2gdxxbhnVoJ1NP_o0LV3Q&usqp=CAU'
);
CREATE TABLE IF NOT EXISTS book_author (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL,
  author_id BIGINT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES book(id),
  FOREIGN KEY (author_id) REFERENCES author(id)
);
CREATE TABLE IF NOT EXISTS  order_  (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL,
  user_id BIGINT NOT NULL,
  status SMALLINT NOT NULL,
  requested_books VARCHAR(5) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES  user_ (id)
);
CREATE TABLE IF NOT EXISTS  book_order  (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  date_start TIMESTAMP NOT NULL,
  date_finished TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES order_(id),
  FOREIGN KEY (book_id) REFERENCES book(id)
);
CREATE TABLE IF NOT EXISTS offender  (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES  user_ (id),
  FOREIGN KEY (book_id) REFERENCES book(id)
);


-- insert all type of users with hashed password 'password'
INSERT INTO user_ (id, email, first_name, last_name, password, role) VALUES
    (1, 'vladgasik@gmail.com', 'Vlad', null, '$2b$12$TavDQGFdLErUW07extC4gOIjpJbJsvo0ehUBujXKzA7LfOuwvJu4G', 1),
    (2, 'oleg.petrov@bsuir-lib.com', 'Oleg', 'Petrov', '$2b$12$TavDQGFdLErUW07extC4gOIjpJbJsvo0ehUBujXKzA7LfOuwvJu4G', 2),
    (3, 'admin@bsuir-admin.com', 'Admin', null, '$2b$12$TavDQGFdLErUW07extC4gOIjpJbJsvo0ehUBujXKzA7LfOuwvJu4G', 3),
    (4, 'thief@mail.ru', 'Pawel', 'Ivanov', '$2b$12$TavDQGFdLErUW07extC4gOIjpJbJsvo0ehUBujXKzA7LfOuwvJu4G', 1)
;

-- insert some books
INSERT INTO book (id, title, isbn, num_pages) VALUES
    (1, 'Go на практике', '9781633430075', 374),
    (2, 'Благие знамения', '9785041604820', 512),
    (3, 'В дороге', '9785171335861', 416)
;

INSERT INTO author (id, first_name, last_name, origin) VALUES
    (1, 'Батчер', 'Мэтт', 'США'),
    (2, 'Фарина', 'Мэтт', 'США'),
    (3, 'Терри', 'Пратчетт', 'Великобритания'),
    (4, 'Нил', 'Гейман', 'Великобритания'),
    (5, 'Джек', 'Керуак', 'США')
;

INSERT INTO book_author (book_id, author_id) VALUES
    (1, 1),
    (1, 2),
    (2, 3),
    (2, 4),
    (3, 5)
;

INSERT INTO order_ (id, created_at, user_id, status, requested_books) VALUES
    (1, TIMESTAMP '2023-03-03 10:23:54+02', 4, 2, '1,2')  -- approved order
;

INSERT INTO book_order (order_id, book_id, date_start) VALUES
    (1, 1, TIMESTAMP '2023-03-03 10:23:54+02'),
    (1, 2, TIMESTAMP '2023-03-03 10:23:54+02')
;

INSERT INTO offender (user_id, book_id) VALUES
    (4, 1),
    (4, 2)
;
