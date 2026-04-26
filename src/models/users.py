git add src/models/users.py
git commit -m "Add User model definition for Eternal API Core" -m "This commit introduces the users.py model under src/models/. It defines the SQLAlchemy User model mapped to the users table created in the initial migration. The model includes id, email, password_hash, role, and created_at fields. This file forms the core data structure for Phase 1 authentication, enabling user registration, login, and identity management across the Eternal API Core backend."

