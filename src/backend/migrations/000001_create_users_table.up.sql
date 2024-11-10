CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    clerkId TEXT NOT NULL UNIQUE,
    points INTEGER NOT NULL DEFAULT 0,
    profileImageURL text default 'https://www.gravatar.com/avatar?d=mp',
    deleted boolean not null default FALSE
);
