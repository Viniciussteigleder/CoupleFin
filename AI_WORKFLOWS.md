# AI Workflows (MVP)

This document lists where AI is used, the prompts, and the API endpoints.

## 1) CSV Mapping (Uploads)
- Purpose: map CSV headers to `date`, `description`, `amount`.
- Trigger: CSV import when auto-detection fails.
- Endpoint: `POST /api/ai/csv-mapping`
- Prompt: `aiPrompts.csvMapping` in `src/lib/ai/prompts.ts`
- Fallback: heuristic header matching if no AI key.

## 2) Auto-Categorization (Uploads)
- Purpose: categorize new transactions at import time.
- Trigger: after CSV parsing, before inserting into DB.
- Endpoint: `POST /api/ai/categorize`
- Prompt: `aiPrompts.categorize` in `src/lib/ai/prompts.ts`
- Fallback: keyword heuristics if no AI key.

## 3) OCR Extraction (Uploads)
- Purpose: extract receipt fields (description, amount, date).
- Trigger: OCR upload (image file).
- Endpoint: `POST /api/ai/ocr`
- Prompt: `aiPrompts.ocrExtract` in `src/lib/ai/prompts.ts`
- Fallback: regex-based extraction if no AI key.

## 4) Insights (Dashboard)
- Purpose: generate short monthly insights from real data.
- Current: deterministic aggregation in `src/app/api/insights/route.ts`.
- Optional AI prompt: `aiPrompts.insights` in `src/lib/ai/prompts.ts` (available for future use).

## Configuration
Required server env vars:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default: `gpt-4o-mini`)

## Prompt locations
- `src/lib/ai/prompts.ts` (all AI prompt templates)
- `src/lib/ai/openai.ts` (OpenAI client + JSON parsing)
- `src/app/api/ai/*/route.ts` (AI endpoints)
