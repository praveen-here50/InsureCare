-- Sign-in accounts. A patient account belongs to one member, a hospital account to one hospital;
-- insurer accounts work for the insurer this deployment runs for (insurecare.insurer-name).
create table account (
    id            bigserial    primary key,
    username      varchar(120) not null unique, -- lower case: the member ID for patients (ic-7842), the work email for staff
    password_hash varchar(100) not null,        -- BCrypt
    role          varchar(16)  not null check (role in ('PATIENT', 'HOSPITAL', 'INSURER')),
    display_name  text         not null,
    email         text,
    member_ref    varchar(32)  references member (id),
    hospital_id   varchar(64)  references hospital (id),
    check ((role = 'PATIENT') = (member_ref is not null)),
    check ((role = 'HOSPITAL') = (hospital_id is not null))
);
