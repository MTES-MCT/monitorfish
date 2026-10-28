SELECT
    itc.natinf_code,
    inf.infraction,
    t.name AS threat,
    tc.name AS threat_characterization,
    itc.isr_code
FROM infraction_threat_characterization itc
LEFT JOIN infractions inf
ON inf.natinf_code = itc.natinf_code
LEFT JOIN threat_characterizations tc
ON tc.id = itc.threat_characterization_id
LEFT JOIN threats t
ON t.id = tc.threat_id
ORDER BY itc.natinf_code, t.name, tc.name
