ALTER TABLE points_traces DROP CONSTRAINT points_traces_userid_fkey;

DROP TABLE if exists points_traces;
DROP TYPE point_trace_type;