CREATE TABLE IF NOT EXISTS uploads(
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    blurHash VARCHAR(256)
);

CREATE table if not exists markers (
  id SERIAL PRIMARY KEY,
  userId varchar(256),
  mainPhotoId INTEGER,
  lat DECIMAL(9,6) NOT NULL,
  long DECIMAL(9,6) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  externalObjectId INTEGER UNIQUE,
  FOREIGN KEY (mainPhotoId) REFERENCES uploads(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
