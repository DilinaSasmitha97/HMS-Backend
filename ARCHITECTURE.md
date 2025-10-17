# HMS Backend Architecture

This codebase follows a simple layered structure aligned with SOLID principles:

- Entry: `server.js` wires middleware and routes.
- Config: `config/` reads environment and database connection (`config/index.js`, `config/db.js`).
- Routing: `routes/` maps HTTP endpoints to controller handlers.
- Controllers: `controllers/` coordinate request/response and delegate business logic.
- Models: `models/` hold Mongoose schemas.
- Middleware: `middleware/` contains cross-cutting concerns (auth, error handling).
- Utilities: `utils/` provides helpers (`asyncHandler`, `logger`, `http`).

Principles applied:

- Single Responsibility: separated config, logging, and error formatting.
- Open/Closed: `auth.js` uses a role-based factory to extend roles without duplication.
- Dependency Inversion: controllers depend on abstractions/utilities, not environment.

Conventions:

- Use `asyncHandler` for async controllers to bubble errors.
- Prefer `logger` instead of raw `console` for structured logs.
- Keep response shapes unchanged; use `ApiResponse` only if it preserves current behavior.
- Do not throw raw strings; use `Error` or `ApiError` to carry status codes.
