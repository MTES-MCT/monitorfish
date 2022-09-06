alter table positions
    alter column course drop not null;
alter table last_positions
    alter column course drop not null;
