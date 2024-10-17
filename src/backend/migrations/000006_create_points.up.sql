create table points_traces (
	id SERIAL PRIMARY KEY,
	userId INTEGER NOT NULL,
	markerId Integer NOT NULL,
	amount Integer Not null,
	FOREIGN KEY (userId) references users(id),
	foreign key (markerId) references markers(id)
);

alter table users add column points INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users add column profileImageURL Text default 'https://www.gravatar.com/avatar?d=mp'

alter table markers add column points INTEGER NOT NULL DEFAULT 0;