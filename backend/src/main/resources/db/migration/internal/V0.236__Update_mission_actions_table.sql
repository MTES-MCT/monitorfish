ALTER TABLE mission_actions
  ADD COLUMN is_administrative_control boolean,
  ADD COLUMN is_compliance_with_water_regulations_control boolean,
  ADD COLUMN is_safety_equipment_and_standards_compliance_control boolean,
  ADD COLUMN is_seafarers_control boolean;
