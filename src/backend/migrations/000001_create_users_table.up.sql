CREATE TABLE IF NOT EXISTS users(
    id TEXT primary key, -- Wypełniany z clerka
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    supportPoints INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    profileImageURL text default 'https://www.gravatar.com/avatar?d=mp',
    deleted boolean not null default FALSE
);
