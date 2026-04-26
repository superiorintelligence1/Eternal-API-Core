git add src/db/migrations/001_create_users_table.sql
git commit -m "Add initial user table migration for Eternal API Core" -m "This commit introduces the first database migration under src/db/migrations/. The file 001_create_users_table.sql defines the foundational users table, including id, email, password_hash, role, and created_at fields. This migration establishes the core persistence layer required for Phase 1 authentication, enabling user registration, login, and JWT-based identity management."

