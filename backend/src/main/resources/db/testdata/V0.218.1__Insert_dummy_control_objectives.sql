-- This test data is inserted before the V0.219__Create_facade_type.sql migration
-- in order to test adding of 'Corse' facade

INSERT INTO control_objectives (facade, segment, year, target_number_of_controls_at_sea,
                                target_number_of_controls_at_port, control_priority_level)
VALUES ('MEMN', 'NWW01/02', 2022, 78, 82, 3),
       ('MEMN', 'NS01/03', 2022, 12, 11, 3),
       ('MEMN', 'PEL03', 2022, 109, 119, 3),
       ('SA', 'ATL01', 2022, 4, 3, 3),
       ('SA', 'MED06/ATL02', 2022, 8, 12, 3),
       ('MED', 'MED06/ATL02', 2022, 152, 317, 4),
       ('MED', 'MED01', 2022, 157, 63, 1),
       ('MED', 'MED02', 2022, 35, 0, 1),
       ('MED', 'MED04', 2022, 20, 50, 1),
       ('MED', 'MED05', 2022, 133, 87, 1),
       ('MED', 'MED07', 2022, 132, 80, 1),
       ('MED', 'FR_ELE', 2022, 90, 60, 1),
       ('MED', 'FR_DRB', 2022, 16, 8, 1),
       ('MED', 'FR_TMB', 2022, 20, 27, 1),
       ('MEMN', 'FR_SCE', 2022, 141, 147, 1),
       ('MEMN', 'NS13', 2022, 12, 12, 1),
       ('MEMN', 'NS14', 2022, 3, 2, 1),
       ('MEMN', 'NWW05', 2022, 15, 15, 1),
       ('MEMN', 'NWW06', 2022, 7, 4, 1),
       ('MEMN', 'NWW07', 2022, 5, 6, 1),
       ('MEMN', 'NWW08', 2022, 36, 38, 1),
       ('MEMN', 'NWW09', 2022, 19, 21, 1),
       ('MEMN', 'NWW10', 2022, 97, 107, 1),
       ('NAMO', 'FR_ELE', 2022, 0, 86, 1),
       ('NAMO', 'ATL01', 2022, 20, 0, 1),
       ('NAMO', 'FR_SCE', 2022, 51, 126, 1),
       ('NAMO', 'MED06/ATL02', 2022, 3, 0, 1),
       ('NAMO', 'NWW01/02', 2022, 80, 73, 1),
       ('NAMO', 'NWW07', 2022, 24, 15, 1),
       ('NAMO', 'NWW08', 2022, 20, 24, 1),
       ('NAMO', 'NWW09', 2022, 12, 14, 1),
       ('NAMO', 'NWW10', 2022, 36, 27, 1),
       ('NAMO', 'PEL01', 2022, 14, 24, 1),
       ('NAMO', 'PEL03', 2022, 103, 65, 1),
       ('NAMO', 'PEL08', 2022, 24, 24, 1),
       ('NAMO', 'PEL13', 2022, 6, 21, 1),
       ('NAMO', 'PEL14', 2022, 3, 0, 1),
       ('NAMO', 'SWW01/02', 2022, 103, 66, 1),
       ('NAMO', 'SWW04', 2022, 13, 24, 1),
       ('NAMO', 'SWW06', 2022, 14, 6, 1),
       ('NAMO', 'SWW07/03', 2022, 100, 106, 1),
       ('NAMO', 'SWW10', 2022, 20, 22, 1),
       ('SA', 'FR_SCE', 2022, 51, 42, 1),
       ('SA', 'PEL03', 2022, 130, 37, 1),
       ('SA', 'PEL05', 2022, 30, 2, 1),
       ('SA', 'PEL08', 2022, 23, 12, 1),
       ('SA', 'PEL13', 2022, 2, 0, 1),
       ('SA', 'SWW01/08', 2022, 139, 43, 1),
       ('SA', 'SWW06', 2022, 3, 0, 1),
       ('SA', 'SWW07/02', 2022, 53, 51, 1),
       ('SA', 'SWW10', 2022, 32, 20, 1),
       ('SA', 'PEL14', 2022, 8, 7, 1),
       ('SA', 'FR_ELE', 2022, 0, 129, 1),
       ('MEMN', 'NWW01/02', 2023, 78, 82, 3),
       ('MEMN', 'NS01/03', 2023, 12, 11, 3),
       ('MEMN', 'PEL03', 2023, 109, 119, 3),
       ('SA', 'ATL01', 2023, 4, 3, 3),
       ('SA', 'MED06/ATL02', 2023, 8, 12, 3),
       ('MED', 'MED06/ATL02', 2023, 152, 317, 4),
       ('MED', 'MED01', 2023, 157, 63, 1),
       ('MED', 'MED02', 2023, 35, 0, 1),
       ('MED', 'MED04', 2023, 20, 50, 1),
       ('MED', 'MED05', 2023, 133, 87, 2),
       ('MED', 'MED07', 2023, 232, 80, 2),
       ('MED', 'FR_ELE', 2023, 90, 60, 2),
       ('MED', 'FR_DRB', 2023, 26, 8, 2),
       ('MED', 'FR_TMB', 2023, 20, 27, 2),
       ('MEMN', 'FR_SCE', 2023, 242, 247, 2),
       ('MEMN', 'NS23', 2023, 12, 12, 1),
       ('MEMN', 'NS14', 2023, 3, 2, 1),
       ('MEMN', 'NWW05', 2023, 15, 15, 1),
       ('MEMN', 'NWW06', 2023, 7, 4, 1),
       ('MEMN', 'NWW07', 2023, 5, 6, 1),
       ('MEMN', 'NWW08', 2023, 36, 38, 1),
       ('MEMN', 'NWW09', 2023, 19, 21, 1),
       ('MEMN', 'NWW10', 2023, 97, 107, 1),
       ('NAMO', 'FR_ELE', 2023, 0, 86, 1),
       ('NAMO', 'ATL01', 2023, 20, 0, 1),
       ('NAMO', 'FR_SCE', 2023, 51, 126, 1),
       ('NAMO', 'MED06/ATL02', 2023, 3, 0, 1),
       ('NAMO', 'NWW01/02', 2023, 80, 73, 1),
       ('NAMO', 'NWW07', 2023, 24, 15, 1),
       ('NAMO', 'NWW08', 2023, 20, 24, 1),
       ('NAMO', 'NWW09', 2023, 12, 14, 1),
       ('NAMO', 'NWW10', 2023, 36, 27, 1),
       ('NAMO', 'PEL01', 2023, 14, 24, 1),
       ('NAMO', 'PEL03', 2023, 103, 65, 1),
       ('NAMO', 'PEL08', 2023, 24, 24, 1),
       ('NAMO', 'PEL13', 2023, 6, 21, 1),
       ('NAMO', 'PEL14', 2023, 3, 0, 1),
       ('NAMO', 'SWW01/02', 2023, 103, 66, 1),
       ('NAMO', 'SWW04', 2023, 13, 24, 1),
       ('NAMO', 'SWW06', 2023, 14, 6, 1),
       ('NAMO', 'SWW07/03', 2023, 100, 106, 1),
       ('NAMO', 'SWW10', 2023, 20, 22, 1),
       ('SA', 'FR_SCE', 2023, 51, 42, 1),
       ('SA', 'PEL03', 2023, 130, 37, 1),
       ('SA', 'PEL05', 2023, 30, 2, 1),
       ('SA', 'PEL08', 2023, 23, 12, 1),
       ('SA', 'PEL13', 2023, 2, 0, 1),
       ('SA', 'SWW01/08', 2023, 139, 43, 1),
       ('SA', 'SWW06', 2023, 3, 0, 1),
       ('SA', 'SWW07/02', 2023, 53, 51, 1),
       ('SA', 'SWW10', 2023, 32, 20, 1),
       ('SA', 'PEL14', 2023, 8, 7, 1),
       ('SA', 'FR_ELE', 2023, 0, 129, 1);