create table points_traces (
	id SERIAL PRIMARY KEY,
	userId varchar(256) NOT NULL,
	markerId Integer NOT NULL,
	amount Integer Not null,
	FOREIGN KEY (userId) references users(id),
	foreign key (markerId) references markers(id)
);