-- Files the hospital uploads for each claim document, and the automatic authenticity checks run on them.

-- The uploaded file itself, kept apart from admission_document so listing documents never loads file bytes.
create table document_file (
    document_id  bigint primary key references admission_document (id) on delete cascade,
    content_type text        not null,
    content      bytea       not null,
    sha256       varchar(64) not null,
    -- 256-bit difference hashes (hex), one per page: near-identical copies have nearly equal hashes.
    page_hashes  jsonb       not null default '[]',
    -- Text read from the file (PDF text layer or OCR), compared with other documents to confirm copies.
    extracted_text text
);
create index document_file_sha256 on document_file (sha256);

alter table admission_document
    add column file_name    text,
    add column file_size    bigint,
    add column uploaded_at  timestamptz,
    add column check_status varchar(16) check (check_status in ('Checking', 'Passed', 'Needs review', 'High risk')),
    add column check_score  integer,
    -- [{severity: high|review|pass, title, detail}]
    add column findings     jsonb not null default '[]',
    add column checked_at   timestamptz;

-- Claim documents point at the hospital document they were copied from, so the insurer sees its file and checks.
alter table claim_document
    add column source_id bigint references admission_document (id) on delete set null;
