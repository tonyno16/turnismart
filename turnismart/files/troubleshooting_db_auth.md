# Troubleshooting: errore query users

## Errore

```
Failed query: select ... from "users" where "users"."id" = $1 limit $2
```

Questo errore si verifica quando la query su `users` fallisce. La **causa reale** è ora loggata nella console del server come:
```
[Auth] Query users failed. Cause: <errore PostgreSQL>
```

## Cause comuni e soluzioni

### 1. Migrazioni non eseguite

**Causa:** La tabella `users` non esiste nel database.

**Verifica:** Controlla nella console il messaggio dopo "Cause:". Se vedi `relation "users" does not exist` → le migrazioni non sono state applicate.

**Soluzione:**
```bash
# Assicurati che .env.local contenga DATABASE_URL
npm run db:migrate
```

### 2. DATABASE_URL errata o mancante

**Causa:** Connessione al database non configurata o errata.

**Verifica:** Controlla che `.env.local` esista e contenga:
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

Per **Supabase**: usa la connection string da **Project Settings > Database** (Direct connection, porta 5432). Esempio:
```
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require
```

### 3. Database diverso da quello migrato

**Causa:** `DATABASE_URL` punta a un progetto/database dove non hai mai eseguito le migrazioni (es. nuovo progetto Supabase, DB locale diverso).

**Soluzione:** Esegui le migrazioni sul database attualmente usato:
```bash
npm run db:migrate
```

### 4. SSL richiesto

**Causa:** Supabase e molti host cloud richiedono SSL. Senza `?sslmode=require` la connessione può fallire.

**Soluzione:** Aggiungi alla fine dell'URL: `?sslmode=require` (o `&sslmode=require` se ci sono già parametri).

### 5. Database non raggiungibile

**Causa:** Firewall, VPN, host errato, database non in esecuzione.

**Verifica:** Messaggi come `connection refused`, `ETIMEDOUT`, `ECONNREFUSED` nel Cause.

**Soluzione:** Verifica che il database sia attivo e raggiungibile dalla tua rete. Per Supabase, controlla che il progetto sia attivo.

---

## Debug rapido

1. Esegui di nuovo l'app e controlla la **console del server** (terminale dove gira `npm run dev`) per il log `[Auth] Query users failed. Cause:`
2. Copia il messaggio completo del Cause
3. Confrontalo con le cause sopra per individuare il problema
