SELECT
    extraction_datetime_utc,
    extraction_occurence,
    page_title,
    page_url,
    document_title,
    document_url
FROM legipeche
ORDER BY extraction_occurence, page_url, document_url