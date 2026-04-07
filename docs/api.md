# ClearBank API Reference

Base URL: `http://localhost:4000`

## Health

- `GET /health`
- Response:

```json
{
  "status": "ok",
  "service": "clearbank-api"
}
```

## Ledger

- `POST /ledger/accounts`
- Example body:

```json
{
  "id": "cash",
  "name": "Cash",
  "type": "asset"
}
```

- `POST /ledger/entries`
- Example body:

```json
{
  "id": "entry-001",
  "reference": "INV-100",
  "description": "Invoice settlement",
  "createdAt": "2026-01-01T12:00:00.000Z",
  "lines": [
    { "accountId": "cash", "amount": "100.00", "side": "debit", "currency": "GBP" },
    { "accountId": "revenue", "amount": "100.00", "side": "credit", "currency": "GBP" }
  ]
}
```

- `GET /ledger/reconcile/:currency`

## Personal

- `GET /personal/budgets`
- `POST /personal/budgets`
- `GET /personal/goals`
- `POST /personal/goals`

## Business

- `GET /business/payments`
- `POST /business/payments`
- `POST /business/fx/quote`
- Example body:

```json
{
  "base": "GBP",
  "quote": "USD",
  "amount": "10.01"
}
```

- Example response:

```json
{
  "rate": "1.2100",
  "convertedAmount": "12.11",
  "expiresAt": "2026-01-01T12:00:30.000Z"
}
```

## Compliance

- `GET /compliance/kyc`
- `POST /compliance/kyc`
- `GET /compliance/aml-alerts`
- `POST /compliance/aml-alerts`

## Demo Data

- `POST /demo/seed` reseeds the JSON persistence store with realistic sample data.
