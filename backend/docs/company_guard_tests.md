# Company Guard Service - Testing Guide

## Overview
The Company Guard Service validates company access before critical operations like starting breaks. This ensures that only active companies with valid plans can perform actions.

## Test Scenarios

### Scenario 1: Active Company with Valid Plan (Success)
**Setup:**
- Company status: `active`
- Company has a valid `plan_id`
- Plan status: `is_active = true`

**Test Command:**
```bash
curl -X POST http://localhost:4000/breaks/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "badge_code": "0001",
    "break_type_id": "BREAK_TYPE_UUID",
    "plate_id": "PLATE_UUID"
  }'
```

**Expected Response:**
```json
{
  "id": "break_event_uuid",
  "employee_id": "employee_uuid",
  "break_type_id": "break_type_uuid",
  "status": "active",
  ...
}
```
**Status Code:** `201 Created`

---

### Scenario 2: Suspended Company (Failure)
**Setup:**
- Company status: `suspended`

**Test Command:**
```bash
curl -X POST http://localhost:4000/breaks/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "badge_code": "0001",
    "break_type_id": "BREAK_TYPE_UUID",
    "plate_id": "PLATE_UUID"
  }'
```

**Expected Response:**
```json
{
  "error": "Empresa suspensa. Contate o administrador.",
  "code": "COMPANY_SUSPENDED"
}
```
**Status Code:** `403 Forbidden`

---

### Scenario 3: Company Without Plan (Failure)
**Setup:**
- Company status: `active`
- Company `plan_id`: `null` or empty

**Test Command:**
```bash
curl -X POST http://localhost:4000/breaks/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "badge_code": "0001",
    "break_type_id": "BREAK_TYPE_UUID",
    "plate_id": "PLATE_UUID"
  }'
```

**Expected Response:**
```json
{
  "error": "Empresa sem plano ativo.",
  "code": "COMPANY_NO_PLAN"
}
```
**Status Code:** `403 Forbidden`

---

### Scenario 4: Inactive Plan (Failure)
**Setup:**
- Company status: `active`
- Company has a valid `plan_id`
- Plan status: `is_active = false`

**Test Command:**
```bash
curl -X POST http://localhost:4000/breaks/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "badge_code": "0001",
    "break_type_id": "BREAK_TYPE_UUID",
    "plate_id": "PLATE_UUID"
  }'
```

**Expected Response:**
```json
{
  "error": "Plano inativo. Entre em contato com o suporte.",
  "code": "PLAN_INACTIVE"
}
```
**Status Code:** `403 Forbidden`

---

## Error Codes Reference

| Code | Status | Description |
|------|--------|-------------|
| `COMPANY_NOT_FOUND` | 404 | Company ID doesn't exist |
| `COMPANY_SUSPENDED` | 403 | Company status is not 'active' |
| `COMPANY_NO_PLAN` | 403 | Company has no plan assigned |
| `PLAN_INACTIVE` | 403 | Company's plan is inactive |
| `EMPLOYEE_LIMIT_REACHED` | 403 | Employee creation would exceed plan limit |
| `PLATE_LIMIT_REACHED` | 403 | Plate creation would exceed plan limit |

---

## Additional Test Scenarios (Phase B1)

### Scenario 5: Create Employee - Success
**Setup:**
- Company status: `active`
- Company has valid plan with `employee_limit = 10`
- Current employees: 5

**Test Command:**
```bash
curl -X POST http://localhost:4000/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "name": "João Silva",
    "role": "Operador",
    "badge_code": "0006"
  }'
```

**Expected Response:**
```json
{
  "id": "employee_uuid",
  "name": "João Silva",
  "role": "Operador",
  "badge_code": "0006",
  "active": true,
  ...
}
```
**Status Code:** `201 Created`

---

### Scenario 6: Create Employee - Limit Reached (Failure)
**Setup:**
- Company status: `active`
- Company has valid plan with `employee_limit = 10`
- Current employees: 10 (limit reached)

**Test Command:**
```bash
curl -X POST http://localhost:4000/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "name": "Maria Santos",
    "role": "Supervisor"
  }'
```

**Expected Response:**
```json
{
  "error": "Limite de funcionários do plano atingido (10/10).",
  "code": "EMPLOYEE_LIMIT_REACHED"
}
```
**Status Code:** `403 Forbidden`

---

### Scenario 7: Create Plate - Success
**Setup:**
- Company status: `active`
- Company has valid plan with `plate_limit = 5`
- Current active plates: 3

**Test Command:**
```bash
curl -X POST http://localhost:4000/plates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "name": "Placa Refeitório"
  }'
```

**Expected Response:**
```json
{
  "id": "plate_uuid",
  "name": "Placa Refeitório",
  "code": "PLACA-0004",
  "active": true,
  ...
}
```
**Status Code:** `201 Created`

---

### Scenario 8: Create Plate - Limit Reached (Failure)
**Setup:**
- Company status: `active`
- Company has valid plan with `plate_limit = 5`
- Current active plates: 5 (limit reached)

**Test Command:**
```bash
curl -X POST http://localhost:4000/plates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "name": "Placa Extra"
  }'
```

**Expected Response:**
```json
{
  "error": "Limite de placas do plano atingido (5/5).",
  "code": "PLATE_LIMIT_REACHED"
}
```
**Status Code:** `403 Forbidden`

---

### Scenario 9: Create Employee with Suspended Company (Failure)
**Setup:**
- Company status: `suspended`

**Test Command:**
```bash
curl -X POST http://localhost:4000/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "name": "Test User",
    "role": "Test"
  }'
```

**Expected Response:**
```json
{
  "error": "Empresa suspensa. Contate o administrador.",
  "code": "COMPANY_SUSPENDED"
}
```
**Status Code:** `403 Forbidden`

---

## Implementation Details

### Files Modified
- `backend/src/utils/AppError.ts` - Custom error class
- `backend/src/services/CompanyGuardService.ts` - Centralized validation logic with limit checks
- `backend/src/services/breaks.service.ts` - Integrated guard into startBreak
- `backend/src/services/employees.service.ts` - Integrated guard into createEmployee
- `backend/src/services/PlatesService.ts` - Integrated guard into createPlate
- `backend/src/middleware/errorHandler.middleware.ts` - Global error handler
- `backend/src/app.ts` - Registered error handler middleware

### Database Requirements
The guard service expects the following schema:
- `companies` table with columns: `id`, `status`, `plan_id`
- `plans` table with columns: `id`, `is_active`, `employee_limit`, `plate_limit`
- `employees` table with column: `company_id`
- `operational_plates` table with columns: `company_id`, `active`
- Relationship: `companies.plan_id` → `plans.id`

If these columns don't exist, the service will throw a clear error during runtime.

### Validation Flow
1. **Company Status Check**: Ensures company is `active`
2. **Plan Existence Check**: Ensures company has a `plan_id`
3. **Plan Active Check**: Ensures plan `is_active = true`
4. **Limit Check** (for CREATE_EMPLOYEE/CREATE_PLATE):
   - Counts current resources (employees or plates)
   - Compares with plan limit
   - Throws error if limit would be exceeded
