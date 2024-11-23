-- Create the solutions_uploads_relation table (without foreign key constraints)
DO $$ BEGIN
    PERFORM 'public.upload_type'::regtype;
EXCEPTION
    WHEN undefined_object THEN
        create type upload_type  AS ENUM (
            'primary',
            'additional'
        );
END $$;

-- Create the solutions_uploads_relation table (without foreign key constraints)
DO $$ BEGIN
    PERFORM 'public.verification_status_enum'::regtype;
EXCEPTION
    WHEN undefined_object THEN
        create type verification_status_enum AS ENUM (
            'pending',
            'denied',
            'approved'
        );
END $$;

CREATE TABLE solutions_uploads_relation (
    id SERIAL PRIMARY KEY,
    solutionId INTEGER NOT NULL,
    uploadId INTEGER NOT NULL,
    uploadType upload_type NOT NULL DEFAULT 'additional'
);

-- Create the users_solutions_relation table (without foreign key constraints)
CREATE TABLE solutions_users_relation (
    id SERIAL PRIMARY KEY,
    userId VARCHAR(256) NOT NULL,
    solutionId INTEGER NOT NULL
);

-- Create the solutions table (without foreign key constraints)
CREATE TABLE solutions (
    id SERIAL PRIMARY KEY,
    markerId INTEGER NOT NULL,
    verification_status verification_status_enum NOT NULL DEFAULT 'pending',
    approved_at timestamptz
);

ALTER TABLE solutions_users_relation ADD CONSTRAINT UQ_UserId_MarkerId UNIQUE(userId, solutionId);

-- Add the foreign key constraints after the tables are created
ALTER TABLE solutions_users_relation
    ADD CONSTRAINT fk_user_solution_userId FOREIGN KEY (userId) REFERENCES users(id),
    ADD CONSTRAINT fk_user_solution_solutionId FOREIGN KEY (solutionId) REFERENCES solutions(id) ON DELETE CASCADE ;

ALTER TABLE solutions_uploads_relation
    ADD CONSTRAINT fk_solution_upload_solutionId FOREIGN KEY (solutionId) REFERENCES solutions(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_solution_upload_uploadId FOREIGN KEY (uploadId) REFERENCES uploads(id);

ALTER TABLE solutions
    ADD CONSTRAINT fk_solution_markerId FOREIGN KEY (markerId) REFERENCES markers(id);
