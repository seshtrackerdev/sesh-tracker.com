
      SELECT 'Database Size' as name, page_count * page_size / 1024.0 / 1024.0 || ' MB' as value FROM pragma_page_count(), pragma_page_size()
      UNION ALL
      SELECT 'Table Count' as name, COUNT(*) as value FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
      UNION ALL
      SELECT 'Index Count' as name, COUNT(*) as value FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'
    