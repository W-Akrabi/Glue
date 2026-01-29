# API Documentation

All API routes require authentication via the app’s session.

## GET /api/requests

Returns a paginated list of records for the current organization.

Query params:
- `limit` (number, optional, default 50, max 200)
- `cursor` (string, optional) — record id for cursor pagination

Response:
- `data`: array of records

Example:
```
GET /api/requests?limit=25&cursor=ckv123
```

## GET /api/requests/:id

Returns one record with workflow steps and audit logs.

Query params:
- `auditLimit` (number, optional, default 50, max 200)

Response:
- `data`: record details + `auditLogs`

Example:
```
GET /api/requests/ckv123?auditLimit=100
```

## Auth routes

`/api/auth/*` are handled by NextAuth and follow its standard contract.
