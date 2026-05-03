-- ---------- 1. Create roles ----------
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'db_migrator') THEN
        CREATE ROLE db_migrator LOGIN PASSWORD 'sudoking1@';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'db_rw') THEN
        CREATE ROLE db_rw LOGIN PASSWORD 'sudoking1@';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'db_ro') THEN
        CREATE ROLE db_ro LOGIN PASSWORD 'sudoking1@';
    END IF;
END
$$;

-- ---------- 2. Create databases ----------
CREATE DATABASE fzdb;

-- ============================================================
-- Apply permissions for each database
-- ============================================================

------------------------------------------------------------
-- Setup for project_db
------------------------------------------------------------
\connect fzdb

-- Remove unsafe default privileges
REVOKE ALL ON DATABASE fzdb FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- Prisma requires the db_migrator to own the schema
ALTER SCHEMA public OWNER TO db_migrator;

-- db_Migrator full control
GRANT USAGE, CREATE ON SCHEMA public TO db_migrator;

-- Read/Write application user
GRANT USAGE ON SCHEMA public TO db_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO db_rw;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO db_rw;

-- Readonly user
GRANT USAGE ON SCHEMA public TO db_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO db_ro;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO db_ro;

-- Default privileges for FUTURE objects created by db_migrator
ALTER DEFAULT PRIVILEGES FOR ROLE db_migrator IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO db_rw;

ALTER DEFAULT PRIVILEGES FOR ROLE db_migrator IN SCHEMA public
    GRANT SELECT ON TABLES TO db_ro;

ALTER DEFAULT PRIVILEGES FOR ROLE db_migrator IN SCHEMA public
    GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO db_rw;

ALTER DEFAULT PRIVILEGES FOR ROLE db_migrator IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO db_ro;

-- Allow connections
GRANT CONNECT ON DATABASE fzdb TO db_migrator, db_rw, db_ro;

-------------------------------
-- Setup for test database
-------------------------------
\connect test

REVOKE ALL ON DATABASE test FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

ALTER SCHEMA public OWNER TO db_migrator;
GRANT USAGE, CREATE ON SCHEMA public TO db_migrator;

GRANT USAGE ON SCHEMA public TO db_rw, db_ro;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO db_rw;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO db_rw;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO db_ro;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO db_ro;

ALTER DEFAULT PRIVILEGES FOR ROLE db_migrator IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO db_rw;

ALTER DEFAULT PRIVILEGES FOR ROLE db_migrator IN SCHEMA public
    GRANT SELECT ON TABLES TO db_ro;

ALTER DEFAULT PRIVILEGES FOR ROLE db_migrator IN SCHEMA public
    GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO db_rw;

ALTER DEFAULT PRIVILEGES FOR ROLE db_migrator IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO db_ro;

GRANT CONNECT ON DATABASE test TO db_migrator, db_rw, db_ro;
