CREATE TABLE IF NOT EXISTS uploads(
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    blurHash VARCHAR(256)
);

create table if not exists relation_marker_uploads (
	id SERIAL primary key,
  	markerId INTEGER NOT NULL,
  	uploadId INTEGER NOT NULL,
	foreign key (markerId) references markers(id),
	foreign key (uploadId) references uploads(id)
);

ALTER TABLE markers DROP COLUMN base64Image;