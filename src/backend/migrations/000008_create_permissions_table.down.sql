ALTER TABLE users_permissions_relation DROP CONSTRAINT users_permissions_relation_userid_fkey;

drop table permissions CASCADE;

DROP TABLE users_permissions_relation;