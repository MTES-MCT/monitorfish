DELETE FROM risk_factors;


INSERT INTO risk_factors
(
    cfr, external_immatriculation, ircs, 
    impact_risk_factor, probability_risk_factor, detectability_risk_factor, risk_factor, 
    control_priority_level, control_rate_risk_factor, infraction_rate_risk_factor, infraction_score, 
    number_controls_last_3_years, number_controls_last_5_years, number_diversions_last_5_years, number_escorts_to_quay_last_5_years, number_infractions_last_5_years, number_recent_controls, number_seizures_last_5_years)
VALUES
(
    'ABC000306959', 'RV348407', 'LLUK', 
    2.0, 3.0, 1.80277563773199, 2.14443662414848, 
    1.0, 3.25, 3.0, 17.0, 
    1.0, 2.0, 0.0, 0.0, 3.0, 0.0, 1.0
),
(
    'ABC000542519', 'RO237719', 'FQ7058', 
    3.3, 2.0, 1.80277563773199,  2.09885592141872,  
    1.0, 3.25, 2.0, 3.3,
    8.0, 13.0, 0.0, 0.0, 5.0, 3.0, 1.0
);