-- InsureCare core schema. One set of tables serves all three portals:
-- the hospital desk, the insurer's claims team and the patient (member).

create table hospital (
    id              varchar(64) primary key,
    name            text        not null,
    city            text        not null,
    state           text        not null,
    speciality      text,
    phone           text,
    avg_tat         integer,
    insurer_network boolean     not null default false, -- in the insurer's cashless network
    listed          boolean     not null default false, -- shown in the patient hospital finder
    distance        text,
    locality        text,
    network         boolean,
    cashless        boolean,
    emergency       boolean,
    specialties     jsonb       not null default '[]',
    rating          text,
    address         text,
    hours           text,
    description     text,
    services        jsonb       not null default '[]',
    schemes         jsonb       not null default '[]',
    image           text,
    claims_agent    text -- shown on the hospital claims desk
);

create table ward (
    id          varchar(32) primary key,
    hospital_id varchar(64) not null references hospital (id),
    name        text        not null,
    prefix      varchar(8)  not null,
    note        text,
    position    integer     not null
);

create table bed (
    label    varchar(16) primary key,
    ward_id  varchar(32) not null references ward (id),
    position integer     not null,
    status   varchar(16) not null check (status in ('available', 'occupied', 'reserved'))
);
create index bed_ward_idx on bed (ward_id);

create table care_service (
    id          bigserial primary key,
    hospital_id varchar(64) not null references hospital (id),
    name        text        not null,
    available   boolean     not null,
    note        text,
    refer_to    text,
    position    integer     not null,
    unique (hospital_id, name)
);

create table member (
    id              varchar(32) primary key, -- URL slug, e.g. ic-7842
    member_id       varchar(32) not null unique, -- e.g. IC-7842
    name            text        not null,
    age             integer     not null,
    gender          varchar(16) not null,
    phone           text,
    blood_group     varchar(8),
    allergies       jsonb       not null default '[]',
    medications     jsonb       not null default '[]',
    history         jsonb       not null default '[]',
    declared        jsonb       not null default '[]',
    policy_name     text        not null,
    policy_provider text        not null,
    policy_number   text        not null,
    coverage        bigint      not null,
    balance         bigint      not null,
    cashless        boolean     not null,
    started_on      date,
    valid_till      date,
    waiting_months  integer
);
create index member_provider_idx on member (policy_provider);

create table admission (
    id             bigserial primary key,
    member_ref     varchar(32) not null references member (id),
    hospital_id    varchar(64) not null references hospital (id),
    status         varchar(32) not null,
    ward           text,
    bed            text,
    doctor         text,
    admitted_on    date,
    diagnosis      text        not null,
    treatments     jsonb       not null default '[]',
    shared_at      timestamptz,
    estimated_cost bigint
);
create index admission_hospital_idx on admission (hospital_id);
create index admission_member_idx on admission (member_ref);

create table admission_document (
    id           bigserial primary key,
    admission_id bigint      not null references admission (id) on delete cascade,
    position     integer     not null,
    name         text        not null,
    status       varchar(32) not null check (status in ('Verified', 'Pending review', 'Needs correction', 'Missing')),
    note         text
);

create table claim (
    id             varchar(16) primary key,
    member_ref     varchar(32) not null references member (id),
    hospital_id    varchar(64) references hospital (id),
    provider_name  text, -- for providers outside the hospital table
    insurer        text        not null,
    type           text        not null,
    diagnosis      text        not null,
    claimed        bigint      not null,
    approved       bigint,
    status         varchar(32) not null check (status in ('Received', 'Under review', 'Query raised', 'Approved', 'Settled', 'Rejected')),
    submitted_on   date        not null,
    updated_on     date        not null,
    treatment_date date,
    policy_name    text        not null,
    policy_number  text        not null,
    preauth        boolean     not null,
    officer        text        not null,
    waiting_ok     boolean     not null,
    note           text,
    flags          jsonb       not null default '[]',
    timeline       jsonb       not null default '[]',
    version        bigint      not null default 0
);
create index claim_member_idx on claim (member_ref);
create index claim_insurer_idx on claim (insurer);
create index claim_hospital_idx on claim (hospital_id);

create table claim_document (
    id       bigserial primary key,
    claim_id varchar(16) not null references claim (id) on delete cascade,
    position integer     not null,
    name     text        not null,
    status   varchar(16) not null check (status in ('Verified', 'Pending', 'Missing'))
);

create table policy (
    id             varchar(64) primary key,
    member_ref     varchar(32) not null references member (id),
    provider       text        not null,
    name           text        not null,
    kind           text        not null,
    number         text        not null,
    coverage       bigint      not null,
    used           bigint      not null,
    members        jsonb       not null default '[]',
    valid_from     date        not null,
    valid_till     date        not null,
    status         varchar(32) not null,
    overview_title text,
    network        text,
    face           text,
    details        jsonb       not null default '[]',
    documents      jsonb       not null default '[]',
    position       integer     not null
);

create table scheme (
    id         bigserial primary key,
    member_ref varchar(32) not null references member (id),
    name       text        not null,
    detail     text,
    status     varchar(16) not null
);

create table member_document (
    id           varchar(64) primary key,
    member_ref   varchar(32) not null references member (id),
    name         text        not null,
    category     varchar(32) not null,
    date_added   date        not null,
    type         varchar(8)  not null,
    status       varchar(16) not null check (status in ('verified', 'pending', 'archived')),
    size_mb      double precision not null,
    content_type text,
    content      bytea -- null for sample records without a file
);
create index member_document_member_idx on member_document (member_ref);
