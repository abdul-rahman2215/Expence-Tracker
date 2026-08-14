# System Architecture Document

## 1. System Topology

```
+-----------------------------------------------------------------------+
|                            Browser Client                             |
|                                                                       |
|  +-------------------+  +---------------------+  +-----------------+  |
|  |  HTML Views       |  |  CSS Design System  |  | JS App Core     |  |
|  +-------------------+  +---------------------+  +-----------------+  |
|                                                            |          |
|  +------------------------------------------------------+  |          |
|  |  Page Controllers (Dashboard, Transactions, Budget)  |  |          |
|  +------------------------------------------------------+  |          |
|                            |                               |          |
|  +------------------------------------------------------+  |          |
|  |  Service Modules (Transaction, Budget, Analytics)    |  |          |
|  +------------------------------------------------------+  |          |
|                            |                               |          |
|  +------------------------------------------------------+  |          |
|  |  Supabase Client JS Config (Anon Key Only)           | <+          |
|  +------------------------------------------------------+             |
+----------------------------|------------------------------------------+
                             | HTTPS / WSS
                             v
+-----------------------------------------------------------------------+
|                           Supabase Platform                           |
|                                                                       |
|  +---------------------+  +------------------+  +------------------+  |
|  |  Supabase Auth      |  |  PostgreSQL DB   |  | Supabase Storage |  |
|  +---------------------+  +------------------+  +------------------+  |
|                                     |                                 |
|                         Row Level Security (RLS)                      |
|                         PostgreSQL Triggers                           |
+-----------------------------------------------------------------------+
```

## 2. Service Layer Architectural Flow
1. User interacts with UI (e.g. clicks "+ Add Expense").
2. Modal controller collects inputs, runs `validators.js`.
3. Modal calls `transactionService.createTransaction(data)`.
4. Service module communicates with Supabase PostgreSQL via `supabase.from('transactions')`.
5. Database evaluates RLS policy `auth.uid() = user_id` and DB constraints (`amount > 0`).
6. Success response returns to service; UI controller refreshes active metrics immediately using `textContent`.
