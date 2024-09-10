ALTER TABLE markers ADD COLUMN mainPhotoId INTEGER not null REFERENCES uploads(id)
