# Step-by-step: Set up Supabase environment variables

Use this if the start page still fails after running `npm run dev`, or you see "Server is not configured" or "fetch failed."

---

## Step 1: Copy the example env file

In a terminal, from the **project root** (`msp-readiness-app`), run:

```bash
cp .env.example .env
```

(Alternatively you can use `.env.local` instead of `.env`: run `cp .env.example .env.local` and then edit `.env.local` in the steps below.)

---

## Step 2: Get your Supabase values

1. Go to **[supabase.com](https://supabase.com)** and sign in.
2. Open your project (or create one: **New project** → name, password, region).
3. In the left sidebar, click the **gear icon** → **Project Settings**.
4. Click **API** in the left menu.
5. On the API page you’ll see:
   - **Project URL** (e.g. `https://abcdefgh.supabase.co`)  
     → this is **NEXT_PUBLIC_SUPABASE_URL**
   - **Project API keys**:
     - **anon** **public** → **NEXT_PUBLIC_SUPABASE_ANON_KEY**
     - **service_role** (click “Reveal” to copy) → **SUPABASE_SERVICE_ROLE_KEY**

Copy these three values; you’ll paste them into `.env` in Step 4.

---

## Step 3: Create the `assessments` table (if you haven’t already)

1. In the Supabase dashboard, open your project.
2. Go to **SQL Editor** → **New query**.
3. Paste the schema from **docs/SETUP_SUPABASE.md** (the `CREATE TABLE assessments (...)` block).
4. Click **Run**.
5. In **Table Editor**, confirm the `assessments` table exists.

---

## Step 4: Edit `.env` and set the three variables

1. Open the file **`.env`** in the project root (create it if you didn’t run the copy command in Step 1).
2. Set these three lines to your real values (no quotes unless the value itself contains spaces):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   Replace:
   - `YOUR-PROJECT-ID` with your actual Project URL from Step 2 (e.g. `abcdefgh` from `https://abcdefgh.supabase.co`).
   - The two long `eyJ...` strings with your **anon** and **service_role** keys from Step 2.

3. Save the file.

**Important:** Never commit `.env` or share your **service_role** key; it bypasses database security.

---

## Step 5: Restart the dev server

Env vars are loaded when the server starts, so you must restart:

1. In the terminal where `npm run dev` is running, press **Ctrl+C** to stop it.
2. Start it again:

   ```bash
   npm run dev
   ```

3. Open the app in the browser (e.g. http://localhost:3000).

---

## Step 6: Try the start page again

1. Fill out the form on the start page.
2. Click **Start Your Assessment** (or Submit).

You should either be taken to the first assessment section or see a specific error message (e.g. missing table or invalid key) instead of "TypeError: fetch failed."

---

## If it still fails

- **"Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"**  
  One of the three variables is missing or wrong in `.env`. Double-check spelling and that there are no extra spaces. Restart the dev server after changes.

- **"Failed to create assessment" / 500**  
  Check that the `assessments` table exists in Supabase (Step 3) and that the schema matches **docs/SETUP_SUPABASE.md**.

- **Still "fetch failed"**  
  Make sure you’re opening the app at the URL shown by `npm run dev` (e.g. http://localhost:3000) and that nothing else is using that port.
