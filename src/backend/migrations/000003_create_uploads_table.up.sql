create table if not exists relation_marker_uploads (
	id SERIAL primary key,
  	markerId INTEGER NOT NULL,
  	uploadId INTEGER NOT NULL,
	foreign key (markerId) references markers(id),
	foreign key (uploadId) references uploads(id) ON DELETE CASCADE
);