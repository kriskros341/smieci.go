CREATE TABLE IF NOT EXISTS permissions (
    id serial primary key,
    pname text not null
);

create table if not exists users_permissions_relation (
    id serial primary key,
    userId Text not null,
    permissionId integer not null,
    foreign key (userId) references users(id),
    foreign key (permissionId) references permissions(id)
);

INSERT INTO PERMISSIONS (pname) values ('reviewing');