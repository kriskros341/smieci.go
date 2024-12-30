ALTER TABLE solutions_users_relation DROP CONSTRAINT fk_user_solution_userid;

DROP TABLE solutions_uploads_relation;
DROP TABLE solutions CASCADE;
DROP TABLE solutions_users_relation;
DROP TYPE upload_type;
DROP TYPE verification_status_enum;