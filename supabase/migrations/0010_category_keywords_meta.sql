-- Migration 0010: add metadata to category_keywords

alter table category_keywords
  add column if not exists type text default 'Despesa';

alter table category_keywords
  add column if not exists fixed_var text default 'Variavel';
