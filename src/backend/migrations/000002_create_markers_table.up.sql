CREATE table if not exists markers (
  id SERIAL PRIMARY KEY,
  userId SERIAL NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  long DECIMAL(9,6) NOT NULL,
  base64Image TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(id)
);
