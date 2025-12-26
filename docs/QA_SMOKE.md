# QA Smoke Checklist

## Manual flow
1. Login via `/login` and land on `/dashboard`.
2. Click “Importar CSV” to open `/import`.
3. Upload `Sample_transaction_import/sample.csv` and confirm the preview.
4. Click “Confirmar importação” and wait for the summary card.
5. Navigate to `/transactions` and confirm the new rows appear.

## Error checks
- Remove a required header from the CSV and confirm the parser errors are shown.
- Use an invalid amount (e.g., letters) and confirm an error is displayed.

## Automated smoke
- Playwright: `npx playwright test -g "import smoke"`
