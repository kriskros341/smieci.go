DO $$ BEGIN
    PERFORM 'public.point_trace_type'::regtype;
EXCEPTION
    WHEN undefined_object THEN
        create type trace_type AS ENUM (
            'markerSupport',
            'markerReward',
            'markerRewardUndo',
						'system'
        );
END $$;

create table points_traces (
	id SERIAL PRIMARY KEY,
	userId varchar(256) NOT NULL,
	markerId Integer NOT NULL,
	amount Integer Not null,
	type point_trace_type DEFAULT 'system'
	created_at TIMESTAMP DEFAULT NOW(),
	FOREIGN KEY (userId) references users(id),
	foreign key (markerId) references markers(id)
);