-- /!\ TO KEEP: For foreign key between logbook_raw_messages and logbook_reports operation_number
INSERT INTO logbook_raw_messages (operation_number, xml_message)
VALUES ('OOF20190126059903', '<ers:OPS AD="FRA" FR="OOE" ON="OOF20190126059903" OD="2021-01-28" OT="23:53" EVL="TurboCatch (3.5-5)">
<ers:DAT TM="CU">
<ers:ERS RN="OOE20210128025702" RD="2021-01-28" RT="23:53">
<ers:LOG IR="FRA000730810" RC="FGRH" XR="GV710812" NA="LE MUREX" MA="YALA" MD="PENMARCH " FS="FRA">
<ers:FAR LR="0" IS="0" DA="2021-01-28" TI="22:01">
<ers:POS LT="51.323" LG="-5.724"/>
<ers:GEA GE="OTT" ME="110" GC="20;2" FO="4" DU="960" FD="80"/>
<ers:SPE SN="ANF" WT="207.40" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.22"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="COD" WT="35.10" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.17"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="RJC" WT="339.00" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.13"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="RJM" WT="728.85" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.13"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="LEZ" WT="26.50" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.06"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="WIT" WT="84.80" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.06"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="HAD" WT="228.15" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.17"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="SOL" WT="13.52" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.04"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="SDV" WT="6.65" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.33"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="SCL" WT="25.00" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="TUR" WT="27.25" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.09"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="POL" WT="5.85" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.17"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:EFAR Type="nat" DF="8"/>
</ers:FAR>
<ers:ELOG Type="nat" TN="20210035"/>
</ers:LOG>
</ers:ERS>
</ers:DAT>
</ers:OPS>'),
       ('OOF20190223059904', '<ers:OPS AD="FRA" FR="OOF" ON="OOF20190223059904" OD="2021-01-28" OT="23:52" EVL="IKTUS 4.5.8">
<ers:DAT TM="CU">
<ers:ERS RN="OOF20210129058100" RD="2021-01-28" RT="23:52">
<ers:LOG IR="FRA000911294" RC="FIZX" XR="CC911294" NA="ROSELEND" MA="jaffrezic" MD="hameau de keroulas pendruc - 299010 tregunc" FS="FRA">
<ers:EOF DA="2021-01-27" TI="14:00"/>
<ers:ELOG Type="nat" TN="20210001"/>
</ers:LOG>
</ers:ERS>
</ers:DAT>
</ers:OPS>'),
       ('OOF20190227059900', '<ers:OPS AD="FRA" FR="OOE" ON="OOE20210128028606" OD="2021-01-28" OT="23:49" EVL="TurboCatch (3.6-1)">
<ers:DAT TM="CU">
<ers:ERS RN="OOE20210128028606" RD="2021-01-28" RT="23:49">
<ers:LOG IR="FRA00088842" RC="FHLG" XR="LO88442" NA="PHALENE" MA="phillipe" MD="frrf" FS="FRA">
<ers:DEP DA="2021-01-28" TI="23:49" PO="FRLRT" AA="FSH">
<ers:GEA GE="TBN" ME="80" GC="17"/>
</ers:DEP>
<ers:ELOG Type="nat" TN="20210336"/>
</ers:LOG>
</ers:ERS>
</ers:DAT>
</ers:OPS>'),
       ('OOF20191030059902', '<ers:OPS AD="FRA" FR="OOE" ON="OOF20190126059903" OD="2021-01-28" OT="23:53" EVL="TurboCatch (3.5-5)">
<ers:DAT TM="CU">
<ers:ERS RN="OOE20210128025702" RD="2021-01-28" RT="23:53">
<ers:LOG IR="FRA000730810" RC="FGRH" XR="GV710812" NA="LE MUREX" MA="YALA" MD="PENMARCH " FS="FRA">
<ers:FAR LR="0" IS="0" DA="2021-01-28" TI="22:01">
<ers:POS LT="51.323" LG="-5.724"/>
<ers:GEA GE="OTT" ME="110" GC="20;2" FO="4" DU="960" FD="80"/>
<ers:SPE SN="ANF" WT="207.40" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.22"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="COD" WT="35.10" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.17"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="RJC" WT="339.00" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.13"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="RJM" WT="728.85" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.13"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="LEZ" WT="26.50" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.06"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="WIT" WT="84.80" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.06"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="HAD" WT="228.15" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.17"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="SOL" WT="13.52" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.04"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="SDV" WT="6.65" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.33"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="SCL" WT="25.00" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="TUR" WT="27.25" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.09"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:SPE SN="POL" WT="5.85" MM="EST">
<ers:RAS FA="27" SA="7" ID="g" EZ="GBR" SR="31E4"/>
<ers:PRO PS="FRE" PR="GUT" TY="BUL" CF="1.17"/>
<ers:ESPE Type="nat" MR="20210035"/>
</ers:SPE>
<ers:EFAR Type="nat" DF="8"/>
</ers:FAR>
<ers:ELOG Type="nat" TN="20210035"/>
</ers:LOG>
</ers:ERS>
</ers:DAT>
</ers:OPS>'),
       ('OOF20190430059907', ''),
       ('OOF20190617059901', ''),
       ('OOF20190618059902', ''),
       ('OOF20190619059905', ''),
       ('OOF20190627059906', ''),
       ('OOF20190627059908', ''),
       ('OOF20190710059906', ''),
       ('OOF20190722059907', ''),
       ('OOF20190830059906', ''),
       ('OOF20191015059904', ''),
       ('OOF20191011059900', ''),
       ('OOF20191011059902', ''),
       ('OOF20191203059903', ''),
       ('OOF20190403059904', ''),
       ('OOF20191030059903', ''),
       ('OOF20191030059909', ''),
       ('OOF20190830059966', ''),
       ('OOF20190403059909', ''),
       ('OOF20103048321388', ''),
       ('OOF22123048321388', ''),
       ('OOF22113048321388', ''),
       ('OOF20190617056738', ''),
       ('OOF22103048321399', ''),
       ('OOF20190430059918', ''),
       ('OOF22103048321388', ''),
       ('OOF69850430059918', ''),
       ('OOF20190433689918', ''),
       ('OOF20190430056936', ''),
       ('OOF20190430056396', ''),
       ('OOF20190430056397', ''),
       ('OOF99190430056936', ''),
       ('OOF91190430056936', ''),
       ('OOF20190227059999', ''),
       ('OOF22103048321398', ''),
       ('OOF20191205059902', ''),
       ('OOF20190265896325', ''),
       ('OOF20190227050000', ''),
       ('OOF20190227050001', ''),
       ('OOF20190227050002', ''),
       ('OOF20190227050003', ''),
       ('OOF22103048326325', ''),
       ('OOF20191030056523', ''),
       ('OOF20190126036598', ''),
       ('OOF20103048326985', ''),
       ('OOF20103048323658', ''),
       ('cc7ee632-e515-460f-a1c1-f82222a6d419', '<Flux>Message FLUX xml</Flux>'),
       ('a3c52754-97e1-4a21-ba2e-d8f16f4544e9', '<Flux>Message FLUX xml</Flux>'),
       ('d5c3b039-aaee-4cca-bcae-637fa8effe14', '<Flux>Message FLUX xml</Flux>'),
       ('7cfcdde3-286c-4713-8460-2ed82a59be34', '<Flux>Message FLUX xml</Flux>'),
       ('4f971076-e6c6-48f6-b87e-deae90fe4705', '<Flux>Message FLUX xml</Flux>'),
       ('8f06061e-e723-4b89-8577-3801a61582a2', '<Flux>Message FLUX xml</Flux>'),
       ('8db132d1-68fc-4ae6-b12e-4af594351701', '<Flux>Message FLUX xml</Flux>'),
       ('b509d82f-ce27-46c2-b5a3-d2bcae09de8a', '<Flux>Message FLUX xml</Flux>'),
       ('6c26236d-51ad-4aee-ac37-8e83978346a0', '<Flux>Message FLUX xml</Flux>'),
       ('81cf0182-db9c-4384-aca3-a75b1067c41a', '<Flux>Message FLUX xml</Flux>'),
       ('ab1058c7-b7cf-4345-a0b3-a9f472cc6ef6', '<Flux>Message FLUX xml</Flux>'),
       ('8826952f-b240-4570-a9dc-59f3a24c7bf1', '<Flux>Message FLUX xml</Flux>'),
       ('5ee8be46-2efe-4a29-b2df-bdf2d3ed66a1', '<Flux>Message FLUX xml</Flux>'),
       ('48794a8f-adfa-43b2-b4c3-2e8d3581bfb4', '<Flux>Message FLUX xml</Flux>'),
       ('196aca16-da66-4077-b340-ecad701be662', '<Flux>Message FLUX xml</Flux>'),
       ('4a4c8d24-f4be-4ccb-8aef-99ab5aae7e02', '<Flux>Message FLUX xml</Flux>'),
       ('251db84c-1d8b-49be-b426-f70bb2c68a2d', '<Flux>Message FLUX xml</Flux>'),
       ('08a125d6-6b6d-4f90-b26a-bf8426673eea', '<Flux>Message FLUX xml</Flux>'),
       ('9e38840b-f05a-49a4-ab34-e41131749fd0', '<Flux>Message FLUX xml</Flux>'),
       ('60e0d2e0-2713-43d7-9fa1-fcf968e34d82', '<Flux>Message FLUX xml</Flux>'),
       ('0e1ea2b6-f4f5-4958-bc48-cfb016a22f58', '<Flux>Message FLUX xml</Flux>'),
       ('3cffa378-0f8c-4540-b849-747621cfcb4a', '<Flux>Message FLUX xml</Flux>'),
       ('7bf7401d-cbb1-4e6f-bad8-7e309ee004cf', '<Flux>Message FLUX xml</Flux>'),
       ('9376ccbd-be2f-4d3d-b4ac-3c559ac9586a', '<Flux>Message FLUX xml</Flux>'),
       ('OOF20190015146541', ''),
       ('OOF20190158541231', ''),
       ('OOF20190439686456', ''),
       ('OOF20190439686457', ''),
       ('d5c3b039-aaee-4cca-bcae-637f5fe574f5', '<Flux>Message FLUX xml</Flux>');

INSERT INTO logbook_reports (operation_number, analyzed_by_rules, trip_number, operation_country,
                             operation_datetime_utc,
                             operation_type, report_id,
                             referenced_report_id, report_datetime_utc,
                             cfr, ircs, external_identification, vessel_id, vessel_name, flag_state, imo, log_type,
                             value, integration_datetime_utc, transmission_format)
VALUES ('OOF20190430056936', '{"PNO_LAN_WEIGHT_TOLERANCE"}'::text[], 9463710, 'OOF', '2018-08-23T12:41:00Z', 'DAT',
        'OOF20190430056936', null, '2018-08-23T12:41:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'LAN',
        '{"port": "AEJAZ", "catchLanded": [{"weight": 40.0, "nbFish": null, "species": "SCR", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "23E6"}, {"weight": 2.0, "nbFish": null, "species": "LBE", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "23E6"}], "landingDatetimeUtc": "2018-09-03T12:18Z"}',
        '2021-01-18T07:17:31.532639Z', 'ERS'),
       ('OOF20190430056397', null, null, 'OOF', '2018-10-17T11:36:00Z', 'RET', null, 'OOF20190430056936',
        '2018-10-30T11:32:00Z',
        null, null, null, -1, null, null, null, '', '{"returnStatus": "000"}', '2021-01-18T07:19:28.384921Z', 'ERS'),
       ('OOF99190430056936', null, 9463710, 'OOF', '2018-08-30T12:41:00Z', 'DAT',
        'OOF99190430056936', null, '2018-01-30T12:41:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'LAN',
        '{"port": "AEJAZ", "catchLanded": [{"weight": 40.0, "nbFish": null, "species": "SCR", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "23E6"}, {"weight": 2.0, "nbFish": null, "species": "LBE", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "23E6"}], "landingDatetimeUtc": "2018-09-03T12:18Z"}',
        '2021-01-18T07:17:31.532639Z', 'ERS'),
       ('OOF91190430056936', null, null, 'OOF', '2018-10-17T11:36:00Z', 'RET', null, 'OOF99190430056936',
        '2019-10-30T11:32:00Z',
        null, null, null, -1, null, null, null, '', '{"returnStatus": "002"}', '2021-01-18T07:19:28.384921Z', 'ERS');

INSERT INTO logbook_reports (operation_number, trip_number, operation_country, operation_datetime_utc, operation_type,
                             report_id,
                             referenced_report_id, report_datetime_utc,
                             cfr, ircs, external_identification, vessel_id, vessel_name, flag_state, imo, log_type,
                             value, integration_datetime_utc, transmission_format, software)
VALUES ('OOF20190265896325', 9463701, 'OOF', '2018-02-17T01:05:00Z', 'DAT', 'OOF20180212345698', null,
       '2018-02-17T01:05:00Z',
       'UNKNOWN_VESS', 'GMRS', 'ABC658', -1, 'Unknown vessel', 'FRA', null, 'DEP',
       '{"gearOnboard": [{"gear": "GTR", "mesh": 100.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2018-02-17T00:00Z", "departureDatetimeUtc": "2018-02-17T01:05Z"}',
       '2019-01-18T07:17:28.317559Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190227050001', 9463711, 'OOF', '2018-02-17T01:05:00Z', 'DAT', 'OOF20180212345698', null,
        '2018-02-17T01:05:00Z',
        'U_W0NTFINDME', 'QGDF', 'ABC123456', 2, 'MALOTRU', 'FRA', null, 'DEP',
        '{"gearOnboard": [{"gear": "GTR", "mesh": 100.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2018-02-17T00:00Z", "departureDatetimeUtc": "2018-02-17T01:05Z"}',
        '2019-01-18T07:17:28.317559Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190227050000', 9463711, 'OOF', '2018-02-20T01:05:00Z', 'DAT', 'OOF20180227059999', null,
        '2018-02-20T01:05:00Z',
        'U_W0NTFINDME', 'QGDF', 'ABC123456', 2, 'MALOTRU', 'FRA', null, 'PNO',
        '{"port": "AEJAZ", "purpose": "LAN", "catchOnboard": [{"weight": 25.0, "nbFish": null, "species": "SOL", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}], "tripStartDate": "2018-02-20T00:00Z", "predictedArrivalDatetimeUtc": "2018-02-20T13:38Z"}',
        '2019-01-20T07:17:28.317559Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190227050002', 9463711, 'OOF', '2018-02-20T12:41:00Z', 'COR', 'OOF20180227051234', 'OOF20180227059999',
        '2018-02-20T12:41:00Z',
        'U_W0NTFINDME', 'QGDF', 'ABC123456', 2, 'MALOTRU', 'FRA', null, 'PNO',
        '{"port": "AEJAZ", "purpose": "LAN", "catchOnboard": [{"weight": 36.0, "nbFish": null, "species": "SOL", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}], "tripStartDate": "2018-02-20T00:00Z", "predictedArrivalDatetimeUtc": "2018-02-20T13:45Z"}',
        '2021-01-18T07:17:31.532639Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190126036598', 9463711, 'OOF', '2019-01-18T11:45:00Z', 'DAT', 'OOF20190126036598', null,
        '2019-01-18T11:45:00Z',
        'U_W0NTFINDME', 'QGDF', 'ABC123456', 2, 'MALOTRU', 'FRA', null, 'FAR',
        '{"hauls": [{"gear": "GTN", "mesh": 100.0, "catches": [], "farDatetimeUtc": "2019-01-15T11:45:00Z"}]}',
        '2019-01-15T11:45:00Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190126036598', 9463711, 'OOF', '2019-01-18T11:45:00Z', 'DAT', 'OOF20190126036598', null,
        '2019-01-18T11:45:00Z',
        'U_W0NTFINDME', 'QGDF', 'ABC123456', 2, 'MALOTRU', 'FRA', null, 'DIS',
        '{"catches": [{"weight": 5.0, "nbFish": 1.0, "species": "NEP", "faoZone": "27.8.a", "freshness": null, "packaging": "BOX", "effort_zone": null, "presentation": "DIM", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "24E5"}, {"weight": 3.0, "nbFish": 2.0, "species": "BIB", "faoZone": "27.8.a", "freshness": null, "packaging": "BOX", "effortZone": null, "presentation": "DIM", "economicZone": "FRA", "preservationState": "FRE", "statisticalRectangle": "24E5"}], "discardDatetimeUtc": "2019-10-17T11:45:00Z"}',
        '2019-01-15T11:45:00Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190227050003', null, 'OOF', '2018-02-20T11:36:00Z', 'RET', null, 'OOF20180227051234',
        '2019-10-30T11:32:00Z',
        null, null, null, -1, null, null, null, '',
        '{"returnStatus": "000"}', '2019-01-18T07:19:28.384921Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190126059903', 9463713, 'OOF', '2019-01-18T11:45:00Z', 'DAT', 'OOF20190126059903', null,
        '2019-01-18T11:45:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'FAR',
        '{"hauls": [{"gear": "GTN", "mesh": 100.0, "catches": [], "farDatetimeUtc": "2019-01-17T12:35Z"}]}',
        '2021-01-18T07:17:29.361198Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190223059904', 9463713, 'OOF', '2019-02-23T13:08:00Z', 'DAT', 'OOF20190223059904', null,
        '2019-01-23T13:08:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'EOF',
        '{"endOfFishingDatetimeUtc": "2019-01-23T13:08Z"}', '2021-01-18T07:17:18.130726Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190227059999', 9463714, 'OOF', '2019-02-17T01:05:00Z', 'DAT', 'OOF20190227059999', null,
        '2019-02-17T01:05:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'DEP',
        '{"gearOnboard": [{"gear": "GTR", "mesh": 100.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2019-02-17T00:00Z", "departureDatetimeUtc": "2019-02-17T01:05Z"}',
        '2021-01-18T07:17:28.317559Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190227059900', 9463714, 'OOF', '2019-02-27T01:05:00Z', 'DAT', 'OOF20190227059900', null,
        '2019-02-27T01:05:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'DEP',
        '{"gearOnboard": [{"gear": "GTR", "mesh": 100.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2019-02-27T00:00Z", "departureDatetimeUtc": "2019-02-27T01:05Z"}',
        '2021-01-18T07:17:28.317559Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190403059904', 9463714, 'OOF', '2019-04-03T10:15:00Z', 'DAT', 'OOF20190403059904', null,
        '2019-04-03T10:15:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'EOF',
        '{"endOfFishingDatetimeUtc": "2019-04-03T10:15Z"}', '2021-01-18T07:17:29.092355Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190430059907', 9463714, 'OOF', '2019-04-30T12:41:00Z', 'DAT', 'OOF20190430059907', null,
        '2019-04-30T12:41:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'LAN',
        '{"port": "AEJAZ", "catchLanded": [{"weight": 40.0, "nbFish": null, "species": "SCR", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "23E6"}, {"weight": 2.0, "nbFish": null, "species": "LBE", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "23E6"}], "landingDatetimeUtc": "2019-09-03T12:18Z"}',
        '2021-01-18T07:17:31.532639Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190430059918', 9463714, 'OOF', '2019-10-17T11:36:00Z', 'RET', null, 'OOF20190430059907',
        '2019-10-30T11:32:00Z',
        null, null, null, -1, null, null, null, '', '{"returnStatus": "000"}', '2021-01-18T07:19:28.384921Z', 'ERS',
        'TurboCatch (3.7-1)'),
       ('OOF69850430059918', 9463714, 'OOF', '2019-04-30T12:41:00Z', 'COR', 'OOF69850430059918', 'OOF20190430059907',
        '2019-04-30T12:41:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'LAN',
        '{"port": "AEJAZ", "catchLanded": [{"weight": 42.0, "nbFish": null, "species": "SCR", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "23E6"}, {"weight": 2.0, "nbFish": null, "species": "LBE", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "23E6"}], "landingDatetimeUtc": "2019-09-03T12:18Z"}',
        '2021-01-18T07:17:31.532639Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190433689918', null, 'OOF', '2019-10-17T11:36:00Z', 'RET', null, 'OOF69850430059918',
        '2019-10-30T11:32:00Z',
        null, null, null, -1, null, null, null, '', '{"returnStatus": "000"}', '2021-01-18T07:19:28.384921Z', 'ERS',
        'TurboCatch (3.7-1)'),
       ('OOF20190618059902', 9463714, 'OOF', '2019-06-18T11:39:00Z', 'DAT', 'OOF20190618059902', null,
        '2019-06-18T11:39:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'PNO',
        '{"port": "AEJAZ", "purpose": "LAN", "catchOnboard": [{"weight": 25.0, "nbFish": null, "species": "SOL", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}], "tripStartDate": "2019-06-18T00:00Z", "predictedArrivalDatetimeUtc": "2019-06-18T13:38Z"}',
        '2021-01-18T07:17:26.691341Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF22123048321388', null, 'OOF', '2019-10-17T11:36:00Z', 'RET', null, 'OOF20190618059902',
        '2019-10-30T11:32:00Z',
        null, null, null, -1, null, null, null, '',
        '{"returnStatus": "000"}', '2021-01-18T07:19:28.384921Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190619059905', 9463714, 'OOF', '2019-06-19T12:49:00Z', 'DAT', 'OOF20190619059905', null,
        '2019-06-19T12:49:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'COX',
        '{"faoZoneExited": "27.8.a", "latitudeExited": 46.488, "longitudeExited": -1.851, "effortZoneExited": "C", "economicZoneExited": "FRA", "targetSpeciesOnExit": "DEM", "effortZoneExitDatetimeUtc": "2020-08-09T13:47:00Z", "statisticalRectangleExited": "21E8"}',
        '2021-01-18T07:17:27.957604Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190627059906', 9463714, 'OOF', '2019-06-27T10:32:00Z', 'DAT', 'OOF20190627059906', null,
        '2019-06-27T10:32:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'COX',
        '{"faoZoneExited": "27.8.a", "latitudeExited": 46.488, "longitudeExited": -1.851, "effortZoneExited": "C", "economicZoneExited": "FRA", "targetSpeciesOnExit": "DEM", "effortZoneExitDatetimeUtc": "2020-08-09T13:47:00Z", "statisticalRectangleExited": "21E8"}',
        '2021-01-18T07:17:18.844684Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190710059906', 9463714, 'OOF', '2019-07-10T11:41:00Z', 'DAT', 'OOF20190710059906', null,
        '2019-07-10T11:41:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'COX',
        '{"faoZoneExited": "27.8.a", "latitudeExited": 46.488, "longitudeExited": -1.851, "effortZoneExited": "C", "economicZoneExited": "FRA", "targetSpeciesOnExit": "DEM", "effortZoneExitDatetimeUtc": "2020-08-09T13:47:00Z", "statisticalRectangleExited": "21E8"}',
        '2021-01-18T07:17:29.100464Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190722059907', 9463714, 'OOF', '2019-07-22T11:53:00Z', 'DAT', 'OOF20190722059907', null,
        '2019-07-22T11:53:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'RTP',
        '{"port": "AEAJM", "gearOnboard": [{"gear": "GTR", "mesh": 100.0}], "reasonOfReturn": "LAN", "returnDatetimeUtc": "2019-07-22T11:53Z"}',
        '2021-01-18T07:17:27.473313Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20191205059902', 9463714, 'OOF', '2019-10-15T12:01:00Z', 'DAT', 'OOF20191205059902', null,
        '2019-10-15T12:01:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'FAR',
        '{"hauls": [{"gear": "GTN", "mesh": 100.0, "catches": [{"weight": 20.0, "nbFish": null, "species": "SLS", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 12.0, "nbFish": null, "species": "SLS", "faoZone": "27.8.b", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E7"}, {"weight": 153.0, "nbFish": null, "species": "HKC", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 1.5, "nbFish": null, "species": "LBE", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}],"farDatetimeUtc": "2019-12-05T11:55Z"}]}',
        '2021-01-18T07:17:16.627684Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF22103048321388', null, 'OOF', '2019-10-17T11:36:00Z', 'RET', null, 'OOF20190722059907',
        '2019-10-30T11:32:00Z',
        null, null, null, -1, null, null, null, '',
        '{"returnStatus": "000"}', '2021-01-18T07:19:28.384921Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20191011059900', 9463715, 'OOF', '2019-10-11T02:06:00Z', 'DAT', 'OOF20191011059900', null,
        '2019-10-11T02:06:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'DEP',
        '{"gearOnboard": [{"gear": "GTN", "mesh": 100.0}, {"gear": "GTN", "mesh": 85.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2019-10-11T00:00Z", "departureDatetimeUtc": "2019-10-11T01:40Z"}',
        '2021-01-18T07:17:28.888437Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20191015059904', 9463715, 'OOF', '2019-10-15T11:23:00Z', 'DAT', 'OOF20191015059904', null,
        '2019-10-15T11:23:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'COX',
        '{"faoZoneExited": "27.8.a", "latitudeExited": 46.488, "longitudeExited": -1.851, "effortZoneExited": "C", "economicZoneExited": "FRA", "targetSpeciesOnExit": "DEM", "effortZoneExitDatetimeUtc": "2020-08-09T13:47:00Z", "statisticalRectangleExited": "21E8"}',
        '2021-01-18T07:17:18.98256Z', 'ERS', 'e-Sacapt Secours ERSV3 V 1.0.10'),
       ('OOF20190617059901', 9463715, 'OOF', '2019-10-17T01:32:00Z', 'DAT', 'OOF20190617059901', null,
        '2019-10-17T01:32:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'COE',
        '{"faoZoneEntered": "27.8.a", "latitudeEnetered": 46.695, "effortZoneEntered": "C", "longitudeEnetered": -1.943, "economicZoneEntered": "FRA", "targetSpeciesOnEntry": "PEL", "effortZoneEntryDatetimeUtc": "2020-08-10T03:16:00Z", "statisticalRectangleEntered": "22E8"}',
        '2021-01-18T07:17:18.324128Z', 'ERS', 'FP/VISIOCaptures V1.4.7'),
       ('OOF20190617056738', 9463715, 'OOF', '2019-10-17T01:32:00Z', 'DAT', 'OOF20190617056738', null,
        '2019-10-17T01:32:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'CRO',
        '{"faoZoneEntered": "27.8.a", "latitudeEntered": 46.695, "effortZoneEntered": "C", "longitudeEntered": -1.943, "economicZoneEntered": "FRA", "targetSpeciesOnEntry": "PEL", "effortZoneEntryDatetimeUtc": "2020-08-10T03:16:00Z", "statisticalRectangleEntered": "22E8", "faoZoneExited": "27.7.d", "latitudeExited": 49.629, "longitudeExited": -0.899, "effortZoneExited": "B", "economicZoneExited": "FRA", "targetSpeciesOnExit": null, "effortZoneExitDatetimeUtc": "2020-11-04T20:50:00Z", "statisticalRectangleExited": "28E9"}',
        '2021-01-18T07:17:18.324128Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20191030059902', 9463715, 'OOF', '2019-10-17T11:32:00Z', 'DAT', 'OOF20191030059902', null,
        '2019-10-30T11:32:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'FAR',
        '{"hauls": [{"gear": "GTN", "mesh": 100.0, "dimensions": "150.0;120.0", "catches": [{"weight": 1500.0, "conversionFactor": 1.2, "nbFish": null, "species": "BON", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 86.0, "nbFish": null, "conversionFactor": 1.0, "species": "BON", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 2.0, "nbFish": null, "species": "SOL", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 17.0, "nbFish": null, "species": "RJH", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}], "farDatetimeUtc": "2019-10-17T11:32:00Z"}]}',
        '2021-01-18T07:17:27.384921Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20103048326985', null, 'OOF', '2019-10-17T11:36:00Z', 'RET', 'OOF20103048326985', 'OOF20191030059902',
        '2019-10-30T11:32:00Z',
        null, null, null, -1, null, null, null, '',
        '{"returnStatus": "000"}', '2021-01-18T07:19:28.384921Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20191030059903', 9463715, 'OOF', '2019-10-17T11:36:00Z', 'COR', 'OOF20191030059903', 'OOF20191030059902',
        '2019-10-30T11:32:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'FAR',
        -- As a result of a change in the ers parser in december 2023, the `dimensions` field holds numeric data as well as string data.
        -- Before the change, the parser casted the `dimensions` field extracted from xml files to float
        -- But this field can contain strings that cannot be casted to float, like "150.0;120.0" for gears with multiple dimensions.
        -- This resulted in `null` values for the dimensions field when the value could not be casted, and the information was lost.
        -- In december 2023, the type casting was removed from the parser and the dimensions field became a string, but the data already in the database
        -- prior to the change was not updated and therefore still contains some floats. So it is important to keep both strings and floats in test data
        -- in the `dimensions` field in order to ensure the app can handle both.
        '{"hauls": [{"gear": "GTN", "mesh": 150.0, "dimensions": 120.0, "catches": [{"weight": 1500.0, "conversionFactor": 1.0, "nbFish": null, "species": "BON", "faoZone": "27.8.a", "effortZone": "C", "presentation": "GUT", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 256.0, "conversionFactor": 1.0, "nbFish": null, "species": "BON", "faoZone": "27.8.a", "effortZone": "C", "presentation": "OTH", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 86.0, "nbFish": null, "conversionFactor": 1.0, "species": "BON", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 2.0, "nbFish": null, "species": "SOL", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 17.0, "nbFish": null, "species": "RJH", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 17.0, "nbFish": null, "species": "LAO", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 17.0, "nbFish": null, "species": "GPE", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 17.0, "nbFish": null, "species": "EOD", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 17.0, "nbFish": null, "species": "BGP", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 17.0, "nbFish": null, "species": "RPD", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 17.0, "nbFish": null, "species": "TYU", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 17.0, "nbFish": null, "species": "BVC", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 57.0, "nbFish": null, "species": "EDC", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 7.0, "nbFish": null, "species": "RGH", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 47.0, "nbFish": null, "species": "EGT", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 37.0, "nbFish": null, "species": "TYU", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 37.0, "nbFish": null, "species": "BVC", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 17.0, "nbFish": null, "species": "EDC", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 37.0, "nbFish": null, "species": "RGH", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 37.0, "nbFish": null, "species": "EGT", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}], "farDatetimeUtc": "2019-10-17T11:32:00Z"}]}',
        '2021-01-18T07:19:27.384921Z', 'ERS', 'e-Sacapt Secours ERSV3 V 1.0.7'),
       ('OOF20191030056523', 9463715, 'OOF', '2019-10-17T11:37:00Z', 'DAT', 'OOF20191030056523', 'OOF20191030056523',
        '2019-10-30T11:37:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'INS',
        'null', '2021-01-18T07:19:27.384921Z', 'ERS', 'JP/VISIOCaptures V1.4.7'),
       ('OOF20103048321388', null, 'OOF', '2019-10-17T11:36:00Z', 'RET', 'OOF19103048321388', 'OOF20191030059903',
        '2019-10-30T11:32:00Z',
        null, null, null, -1, null, null, null, '',
        '{"returnStatus": "000"}', '2021-01-18T07:19:28.384921Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20191030059909', 9463715, 'OOF', '2019-10-17T11:45:00Z', 'DAT', 'OOF20191030059909', null,
        '2019-10-30T11:38:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'DIS',
        '{"catches": [{"weight": 5.0, "nbFish": 1.0, "species": "NEP", "faoZone": "27.8.a", "freshness": null, "packaging": "BOX", "effort_zone": null, "presentation": "DIM", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "24E5"}, {"weight": 3.0, "nbFish": 2.0, "species": "BIB", "faoZone": "27.8.a", "freshness": null, "packaging": "BOX", "effortZone": null, "presentation": "DIM", "economicZone": "FRA", "preservationState": "FRE", "statisticalRectangle": "24E5"}], "discardDatetimeUtc": "2019-10-17T11:45:00Z"}',
        '2021-01-18T07:17:27.384921Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF22103048326325', null, 'OOF', '2021-01-18T07:19:29.384921Z', 'RET', null, 'OOF20191030059909',
        '2021-01-18T07:19:29.384921Z',
        null, null, null, -1, null, null, null, '',
        '{"returnStatus": "000"}', '2021-01-18T07:19:29.384921Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20191203059903', 9463715, 'OOF', '2019-10-20T12:16:00Z', 'DAT', 'OOF20191203059903', null,
        '2019-12-03T12:16:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'EOF',
        '{"endOfFishingDatetimeUtc": "2019-10-20T12:16:00Z"}', '2021-01-18T07:17:26.736456Z', 'ERS',
        'TurboCatch (3.7-1)'),
       ('OOF20191011059902', 9463715, 'OOF', '2019-10-21T08:16:00Z', 'DAT', 'OOF20191011059902', null,
        '2019-10-11T08:16:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'PNO',
        '{"port": "AEJAZ", "purpose": "LAN", "catchOnboard": [{"weight": 20.0, "nbFish": null, "species": "SLS", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 153.0, "nbFish": null, "species": "HKC", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 2.0, "nbFish": null, "species": "SOL", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 1500.0, "nbFish": null, "species": "BON", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}], "catchToLand": [{"weight": 15.0, "nbFish": null, "species": "SLS", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 151.0, "nbFish": null, "species": "HKC", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 2.0, "nbFish": null, "species": "SOL", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 1500.0, "nbFish": null, "species": "BON", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}], "tripStartDate": "2019-10-11T00:00Z", "predictedArrivalDatetimeUtc": "2019-10-21T08:16:00Z"}',
        '2021-01-18T07:17:19.04244Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF22113048321388', null, 'OOF', '2019-10-17T11:36:00Z', 'RET', null, 'OOF20191011059902',
        '2019-10-30T11:32:00Z', null, null, null, -1, null, null, null, '',
        '{"returnStatus": "000"}', '2021-01-18T07:19:28.384921Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190830059906', 9463715, 'OOF', '2019-10-21T11:12:00Z', 'DAT', 'OOF20190830059906', null,
        '2019-08-30T11:12:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'RTP',
        '{"port": "AEAJM", "gearOnboard": [{"gear": "GTN", "mesh": 100.0}], "reasonOfReturn": "LAN", "returnDatetimeUtc": "2019-10-21T11:12:00Z"}',
        '2021-01-18T07:17:20.007244Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190830059966', null, 'OOF', '2019-10-21T11:12:00Z', 'RET', 'OOF20190830059966', 'OOF20190830059906',
        '2019-08-30T11:12:00Z',
        null, null, null, -1, null, null, null, '',
        '{"returnStatus": "002", "rejectionCause": "002 MGEN02 Message incorrect : la date/heure de l’événement RTP n° OOF20201105037001 est postérieure à la date/heure courante. Veuillez vérifier la date/heure de l’événement déclaré et renvoyer votre message."}',
        '2021-01-18T07:17:21.007244Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190627059908', 9463715, 'OOF', '2019-10-22T11:06:00Z', 'DAT', 'OOF20190627059908', null,
        '2019-06-27T11:06:00Z',
        'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'LAN',
        '{"port": "AEAJM", "sender": "MAS", "catchLanded": [{"weight": 10.0, "conversionFactor": 1.2, "nbFish": null, "species": "SLS", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 20.0, "conversionFactor": 1.0, "nbFish": null, "species": "SLS", "faoZone": "27.8.b", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 180.0, "nbFish": null, "species": "HKC", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 1500.0, "nbFish": null, "species": "BON", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}, {"weight": 200.0, "nbFish": null, "species": "SCR", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "24E6"}, {"weight": 6.0, "nbFish": null, "species": "LBE", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "24E6"}], "landingDatetimeUtc": "2019-10-22T11:06:00Z"}',
        '2021-01-18T09:17:28.2717Z', 'ERS', 'TurboCatch (3.7-1)'),
        ('OOF20103048323658', 9463715, 'OOF', '2019-10-11T01:06:00Z', 'DAT', 'OOF20103048323658', null,
        '2019-10-11T01:06:00Z', 'FAK000999999', 'CALLME', 'DONTSINK', 1, 'PHENOMENE', 'FRA', null, 'CPS',
        '{"cpsDatetimeUtc": "2023-02-28T17:44:00Z","gear": "GTR","mesh": 100.0,"dimensions": "50.0;2.0","catches": [{"sex": "M","healthState": "DEA","careMinutes": null,"ring": "1234567","fate": "DIS","comment": null,"species": "DCO","weight": 60.0,"nbFish": 1.0,"faoZone": "27.8.a","economicZone": "FRA","statisticalRectangle": "22E7","effortZone": "C"},{"sex": "M","healthState": "DEA","careMinutes": 40,"ring": "1234568","fate": "DIS","comment": "A comment","species": "DCO","weight": 80.0,"nbFish": 1.0,"faoZone": "27.8.a","economicZone": "FRA","statisticalRectangle": "22E7","effortZone": "C"}],"latitude": 46.575,"longitude": -2.741}',
        '2019-10-11T01:17:28.2717Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF22103048321399', null, 'OOF', '2019-10-17T11:36:00Z', 'RET', null, 'OOF20190627059908',
        '2019-10-30T11:32:00Z',
        null, null, null, -1, null, null, null, '',
        '{"returnStatus": "000"}', '2021-01-18T07:19:28.384921Z', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF22103048321399', null, 'OOF', '2019-10-17T11:36:00Z', 'DEL', null, 'OOF20190627059908',
        '2019-10-30T11:32:00Z', null, null, null, -1, null, null, null, '', null, '2021-01-18T07:19:28.384921Z', 'ERS',
        'TurboCatch (3.7-1)'),
       ('OOF22103048321398', null, 'OOF', '2106-10-17T11:36:00Z', 'RET', null, 'OOF20190627059903',
        '2106-10-30T11:32:00Z',
        null, null, null, -1, null, null, null, '',
        '{"returnStatus": "000"}', '2100-01-18T07:19:28.384921Z', 'ERS', 'JP/VISIOCaptures V1.4.7');


-- Add FLUX test data
INSERT INTO logbook_reports (operation_number, operation_country, operation_datetime_utc, operation_type, report_id,
                             referenced_report_id, report_datetime_utc, cfr, ircs, external_identification, vessel_id,
                             vessel_name, flag_state, imo, log_type, value, integration_datetime_utc, trip_number,
                             transmission_format)
VALUES ('cc7ee632-e515-460f-a1c1-f82222a6d419', null, '2020-05-06 18:40:51', 'DAT',
        'f006a2e5-0fdd-48a0-9a9a-ccae00d052d8', null, '2020-05-06 15:40:51', 'SOCR4T3', 'IRCS6', 'XR006', 5, 'GOLF', 'CYP',
        '1234567', 'NOT_COX',
        '{"faoZoneExited": null, "latitudeExited": 57.7258, "longitudeExited": 0.5983, "effortZoneExited": null, "economicZoneExited": null, "targetSpeciesOnExit": null, "effortZoneExitDatetimeUtc": "2020-05-06T11:40:51.795Z", "statisticalRectangleExited": null}',
        '2022-03-31 09:21:19.378408', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('a3c52754-97e1-4a21-ba2e-d8f16f4544e9', null, '2020-05-06 18:40:57', 'DAT',
        '9d1ddd34-1394-470e-b8a6-469b86150e1e', null, '2020-05-06 15:40:57', 'SOCR4T3', null, null, 5, null, 'CYP', null,
        'COX',
        '{"faoZoneExited": null, "latitudeExited": 46.678, "longitudeExited": -14.616, "effortZoneExited": "A", "economicZoneExited": null, "targetSpeciesOnExit": null, "effortZoneExitDatetimeUtc": "2020-05-06T11:40:57.580Z", "statisticalRectangleExited": null}',
        '2022-03-31 09:21:19.384086', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('d5c3b039-aaee-4cca-bcae-637fa8effe14', null, '2020-05-06 18:41:03', 'DAT',
        '7ee30c6c-adf9-4f60-a4f1-f7f15ab92803', null, '2020-05-06 15:41:03', 'SOCR4T3', null, null, 5, null, 'CYP', null,
        'PNO',
        '{"port": "GBPHD", "purpose": "LAN", "catchOnboard": [{"nbFish": null, "weight": 1500.0, "species": "GHL"}], "tripStartDate": "2020-05-04T19:41:03.340Z", "predictedArrivalDatetimeUtc": "2020-05-06T11:41:03.340Z"}',
        '2022-03-31 09:21:19.38991', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('7cfcdde3-286c-4713-8460-2ed82a59be34', null, '2020-05-06 18:41:09', 'DAT',
        'fc16ea8a-3148-44b2-977f-de2a2ae550b9', null, '2020-05-06 15:41:09', 'SOCR4T3', null, null, 5, null, 'CYP', null,
        'PNO',
        '{"port": "GBPHD", "purpose": "SHE", "tripStartDate": "2020-05-04T19:41:09.200Z", "predictedArrivalDatetimeUtc": "2020-05-06T11:41:09.200Z"}',
        '2022-03-31 09:21:19.395805', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('4f971076-e6c6-48f6-b87e-deae90fe4705', null, '2020-05-06 18:41:15', 'DAT',
        'cc45063f-2d3c-4cda-ac0c-8381e279e150', null, '2020-05-06 15:41:15', 'SOCR4T3', null, null, 5, 'GOLF', 'CYP', null,
        'RTP', '{"port": "ESCAR", "reasonOfReturn": "REF", "returnDatetimeUtc": "2020-05-06T11:41:15.013Z"}',
        '2022-03-31 09:21:19.401686', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('8f06061e-e723-4b89-8577-3801a61582a2', null, '2020-05-06 18:41:20', 'DAT',
        'dde5df56-24c2-4a2e-8afb-561f32113256', null, '2020-05-06 15:41:20', 'SOCR4T3', 'IRCS6', 'XR006', 5, null, 'CYP',
        null, 'RTP',
        '{"port": "ESCAR", "gearOnboard": [{"gear": "GN", "mesh": 140.0, "dimensions": 1000.0}], "reasonOfReturn": "LAN", "returnDatetimeUtc": "2020-05-06T11:41:20.712Z"}',
        '2022-03-31 09:21:19.407777', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('8db132d1-68fc-4ae6-b12e-4af594351701', null, '2020-05-06 18:41:26', 'DAT',
        '83952732-ef89-4168-b2a1-df49d0aa1aff', null, '2020-05-06 15:41:26', 'SOCR4T3', null, null, 5, null, 'CYP', null,
        'LAN',
        '{"port": "ESCAR", "sender": null, "catchLanded": [{"nbFish": null, "weight": 100.0, "faoZone": "27.9.b.2", "species": "HAD", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "ESP", "presentation": "GUT", "conversionFactor": 1.2, "preservationState": "FRO", "statisticalRectangle": null}], "landingDatetimeUtc": "2020-05-05T19:41:26.516Z"}',
        '2022-03-31 09:21:19.414081', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('b509d82f-ce27-46c2-b5a3-d2bcae09de8a', null, '2020-05-06 18:41:32', 'DAT',
        'ddf8f969-86f1-4eb9-a9a6-d61067a846bf', null, '2020-05-06 15:41:32', 'SOCR4T3', null, null, 5, null, 'SVN', null,
        'TRA', 'null', '2022-03-31 09:21:19.420333', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('6c26236d-51ad-4aee-ac37-8e83978346a0', null, '2020-05-06 18:41:38', 'DAT',
        'b581876a-ae95-4a07-8b56-b6b5d8098a57', null, '2020-05-06 15:41:38', 'SOCR4T3', null, null, 5, null, 'SVN', null,
        'TRA', 'null', '2022-03-31 09:21:19.426686', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('81cf0182-db9c-4384-aca3-a75b1067c41a', null, '2020-05-06 18:41:43', 'DAT',
        'ce5c46ca-3912-4de1-931c-d66b801b5362', null, '2020-05-06 15:41:43', 'SOCR4T3', null, null, 5, null, 'CYP', null,
        'NOT_TRA', 'null', '2022-03-31 09:21:19.433052', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('ab1058c7-b7cf-4345-a0b3-a9f472cc6ef6', null, '2020-05-06 18:41:49', 'DAT',
        'e43c3bf0-163c-4fb0-a1de-1a61beb87988', null, '2020-05-06 15:41:49', 'SOCR4T3', 'IRCS6', 'XR006', 5, null, 'CYP',
        '1234567', 'NOT_TRA', 'null', '2022-03-31 09:21:19.439501', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('8826952f-b240-4570-a9dc-59f3a24c7bf1', null, '2020-05-06 18:39:33', 'DAT',
        '1e1bff95-dfff-4cc3-82d3-d72b46fda745', null, '2020-05-06 15:39:33', 'SOCR4T3', null, null, 5, 'GOLF', 'CYP',
        '1234567', 'DEP',
        '{"gearOnboard": [{"gear": "PS", "mesh": 140.0, "dimensions": 14.0}], "departurePort": "ESCAR", "speciesOnboard": [{"nbFish": null, "weight": 50.0, "faoZone": "27.9.b.2", "species": "COD", "freshness": null, "packaging": "BOX", "effortZone": null, "economicZone": "ESP", "presentation": "GUT", "conversionFactor": 1.1, "preservationState": "FRO", "statisticalRectangle": null}], "anticipatedActivity": "FIS", "departureDatetimeUtc": "2020-05-06T11:39:33.176Z"}',
        '2022-03-31 09:21:19.501868', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('5ee8be46-2efe-4a29-b2df-bdf2d3ed66a1', null, '2020-05-06 18:39:40', 'DAT',
        '7712fe73-cef2-4646-97bb-d634fde00b07', null, '2020-05-06 15:39:40', 'SOCR4T3', null, null, 5, 'GOLF', 'CYP',
        '1234567', 'DEP',
        '{"gearOnboard": [{"gear": "PS", "mesh": 140.0, "dimensions": 14.0}], "departurePort": "ESCAR", "anticipatedActivity": "FIS", "departureDatetimeUtc": "2020-05-06T11:39:40.722Z"}',
        '2022-03-31 09:21:19.507524', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('48794a8f-adfa-43b2-b4c3-2e8d3581bfb4', null, '2020-05-06 18:39:46', 'DAT',
        '2843bd5b-e4e7-4816-8372-76805201301e', null, '2020-05-06 15:39:46', 'SOCR4T3', 'IRCS6', 'XR006', 5, 'GOLF', 'CYP',
        '1234567', 'NOT_COE',
        '{"latitudeEntered": 42.794, "longitudeEntered": -13.809, "faoZoneEntered": null, "effortZoneEntered": null, "economicZoneEntered": null, "targetSpeciesOnEntry": null, "effortZoneEntryDatetimeUtc": "2020-05-06T11:39:46.583Z", "statisticalRectangleEntered": null}',
        '2022-03-31 09:21:19.513305', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('196aca16-da66-4077-b340-ecad701be662', null, '2020-05-06 18:39:59', 'DAT',
        'b2fca5fb-d1cd-4ec7-8a8c-645cecab6866', null, '2020-05-06 15:39:59', 'SOCR4T3', null, null, 5, null, 'CYP', null,
        'FAR',
        '{"hauls": [{"gear": "TBB", "mesh": 140.0, "catches": [{"nbFish": null, "weight": 1000.0, "faoZone": "27.8.e.1", "species": "COD", "effortZone": null, "economicZone": null, "statisticalRectangle": "21D5"}], "dimensions": 250.0, "farDatetimeUtc": "2020-05-06T11:39:59.462Z"}]}',
        '2022-03-31 09:21:19.519424', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('4a4c8d24-f4be-4ccb-8aef-99ab5aae7e02', null, '2020-05-06 18:40:05', 'DAT',
        '1a87f3de-dea9-4018-8c2e-d6cdfa97318e', null, '2020-05-06 15:40:05', 'SOCR4T3', 'IRCS6', 'XR006', 5, 'GOLF', 'CYP',
        '1234567', 'FAR',
        '{"hauls": [{"gear": "TBB", "mesh": 140.0, "catches": [{"nbFish": null, "weight": 1000.0, "faoZone": "27.8.e.1", "species": "COD", "effortZone": null, "economicZone": null, "statisticalRectangle": "21D5"}], "dimensions": 250.0, "farDatetimeUtc": "2020-05-04T19:40:05.354Z"}, {"gear": "TBB", "mesh": 140.0, "catches": [{"nbFish": null, "weight": 600.0, "faoZone": "27.8.e.1", "species": "COD", "effortZone": null, "economicZone": null, "statisticalRectangle": "21D6"}], "dimensions": 250.0, "farDatetimeUtc": "2020-05-04T19:40:05.354Z"}]}',
        '2022-03-31 09:21:19.525832', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('251db84c-1d8b-49be-b426-f70bb2c68a2d', null, '2020-05-06 18:40:11', 'DAT',
        'fe7acdb9-ff2e-4cfa-91a9-fd2e06b556e1', null, '2020-05-06 15:40:11', 'SOCR4T3', null, null, 5, null, 'CYP', null,
        'FAR', '{"hauls": [{"farDatetimeUtc": "2020-05-06T11:40:11.291Z"}]}', '2022-03-31 09:21:19.531881',
        'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('08a125d6-6b6d-4f90-b26a-bf8426673eea', null, '2020-05-06 18:40:17', 'DAT',
        '74fcd0f7-8117-4791-9aa3-37d5c7dce880', null, '2020-05-06 15:40:17', 'SOCR4T3', null, null, 5, null, 'SVN', null,
        'FAR',
        '{"hauls": [{"catches": [{"nbFish": null, "weight": 0.0, "species": "BFT"}], "latitude": 39.65, "longitude": 6.83, "farDatetimeUtc": "2020-04-29T12:00:00.000Z"}]}',
        '2022-03-31 09:21:19.538061', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('9e38840b-f05a-49a4-ab34-e41131749fd0', null, '2020-05-06 18:40:22', 'DAT',
        '1706938b-c3c8-4d34-b32f-54c8d2c0705a', null, '2020-05-06 15:40:22', 'SOCR4T3', 'IRCS6', 'XR006', 5, 'GOLF', 'CYP',
        '1234567', 'FAR',
        '{"hauls": [{"catches": [{"nbFish": null, "weight": 0.0, "faoZone": "27.8.e.1", "species": "MZZ", "effortZone": null, "economicZone": null, "statisticalRectangle": null}], "farDatetimeUtc": "2020-05-06T11:40:22.885Z"}]}',
        '2022-03-31 09:21:19.544336', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('60e0d2e0-2713-43d7-9fa1-fcf968e34d82', null, '2020-05-06 18:40:28', 'DAT',
        'a36d23c5-b339-455d-9b0b-bf766a9d57d9', null, '2020-05-06 15:40:28', 'SOCR4T3', 'IRCS6', 'XR006', 5, 'GOLF', 'CYP',
        '1234567', 'JFO', 'null', '2022-03-31 09:21:19.550891', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('0e1ea2b6-f4f5-4958-bc48-cfb016a22f58', null, '2020-05-06 18:40:34', 'DAT',
        'a913a52e-5e66-4f40-8c64-148f90fa8cd9', null, '2020-05-06 15:40:34', 'SOCR4T3', null, null, 5, null, 'CYP', null,
        'DIS',
        '{"catches": [{"nbFish": null, "weight": 100.0, "species": "COD"}], "discardDatetimeUtc": "2020-05-06T11:40:34.449Z"}',
        '2022-03-31 09:21:19.557299', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('3cffa378-0f8c-4540-b849-747621cfcb4a', null, '2020-05-06 18:40:40', 'DAT',
        '7b487ada-019c-4b62-be32-7d15f7718344', null, '2020-05-06 15:40:40', 'SOCR4T3', null, null, 5, null, 'CYP',
        '1234567', 'RLC', 'null', '2022-03-31 09:21:19.563768', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('7bf7401d-cbb1-4e6f-bad8-7e309ee004cf', null, '2020-05-06 18:40:45', 'DAT',
        'ced42f65-a1ac-40e1-93c7-851d4933f770', null, '2020-05-06 15:40:45', 'SOCR4T3', null, null, 5, 'GOLF', 'CYP', null,
        'RLC', 'null', '2022-03-31 09:21:19.570417', 'SRC-TRP-TTT20200506194051795', 'FLUX'),
       ('9376ccbd-be2f-4d3d-b4ac-3c559ac9586a', null, '2021-01-31 12:29:02', 'DAT',
        '8eec0190-c353-4147-8a65-fcc697fbadbc', null, '2021-01-22 09:02:47', 'SOCR4T3', 'OPUF', 'Z.510', 5, 'Dennis',
        'BEL', null, 'COE',
        '{"latitudeEntered": 51.333333, "longitudeEntered": 3.2, "faoZoneEntered": "27.4.c", "effortZoneEntered": null, "economicZoneEntered": "BEL", "targetSpeciesOnEntry": "DEMERSAL", "effortZoneEntryDatetimeUtc": "2021-01-22T09:00:00Z", "statisticalRectangleEntered": "31F3"}',
        '2022-03-31 09:21:19.496049', 'SRC-TRP-TTT20200506194051795', 'FLUX');

UPDATE logbook_reports
SET value               = jsonb_set(value, '{predictedArrivalDatetimeUtc}', concat('"', to_char(
        (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '24 hours 30 minutes', 'YYYY-MM-DD"T"HH24:MI:SSZ'),
                                                                                   '"')::jsonb),
    report_datetime_utc = (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '24 hours 30 minutes'
WHERE operation_number = 'OOF20191011059902';

UPDATE logbook_reports
SET value = jsonb_set(
    value,
    '{tripStartDate}',
    concat(
        '"',
        to_char((now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '72 hours', 'YYYY-MM-DDT00:00:00Z'),
        '"'
    )::jsonb
)
WHERE operation_number = 'OOF20191011059902';

UPDATE logbook_reports
SET value               = jsonb_set(value, '{returnDatetimeUtc}', concat('"', to_char(
        (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '22 hours 10 minutes', 'YYYY-MM-DD"T"HH24:MI:SSZ'),
                                                                         '"')::jsonb),
    report_datetime_utc = (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '22 hours 10 minutes'
WHERE operation_number = 'OOF20190830059906';

UPDATE logbook_reports
SET value               = jsonb_set(value, '{landingDatetimeUtc}', concat('"', to_char(
        (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '11 hours 45 minutes', 'YYYY-MM-DD"T"HH24:MI:SSZ'),
                                                                          '"')::jsonb),
    report_datetime_utc = (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '11 hours 45 minutes'
WHERE operation_number = 'OOF20190627059908';

UPDATE logbook_reports
SET value               = jsonb_set(value, '{discardDatetimeUtc}', concat('"', to_char(
        (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '15 hours 45 minutes', 'YYYY-MM-DD"T"HH24:MI:SSZ'),
                                                                          '"')::jsonb),
    report_datetime_utc = (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '15 hours 45 minutes'
WHERE operation_number = 'OOF20191030059909';

UPDATE logbook_reports
SET value               = jsonb_set("value", array ['hauls', '0', 'farDatetimeUtc'], concat('"', to_char(
        (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '19 hours 45 minutes', 'YYYY-MM-DD"T"HH24:MI:SSZ'),
                                                                                            '"')::jsonb),
    report_datetime_utc = (now() AT TIME ZONE 'UTC')::TIMESTAMP - interval '19 hours 45 minutes'
WHERE operation_number = 'OOF20191030059903';

-- Insert new logbook reports in order to find last trips
INSERT INTO logbook_reports (operation_number, trip_number, operation_country,
                             operation_datetime_utc,
                             operation_type, report_id,
                             referenced_report_id, report_datetime_utc,
                             cfr, ircs, external_identification, vessel_id, vessel_name, flag_state, imo, log_type,
                             value, integration_datetime_utc, transmission_format, software)
VALUES ('OOF20190439686456', 20230086, 'OOF', CURRENT_DATE - INTERVAL '5 days', 'DAT',
        'OOF20190439686456', null, CURRENT_DATE - INTERVAL '5 days',
        'FR263454484', 'FE4864', '8FR6541', 4, 'NO NAME', 'FRA', null, 'LAN',
        '{"port": "AEJAZ", "catchLanded": [{"weight": 40.0, "nbFish": null, "species": "SCR", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "23E6"}, {"weight": 2.0, "nbFish": null, "species": "LBE", "faoZone": "27.8.a", "freshness": null, "packaging": "CNT", "effortZone": "C", "presentation": "WHL", "economicZone": "FRA", "preservationState": "ALI", "statisticalRectangle": "23E6"}], "landingDatetimeUtc": "2018-09-03T12:18Z"}',
        CURRENT_DATE - INTERVAL '5 days', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190158541231', 20230087, 'OOF', CURRENT_DATE - INTERVAL '4 days', 'DAT', 'OOF20190158541231', null,
        CURRENT_DATE - INTERVAL '4 days',
        'FR263454484', 'FE4864', '8FR6541', 4, 'NO NAME', 'FRA', null, 'DEP',
        '{"gearOnboard": [{"gear": "GTR", "mesh": 100.0}], "departurePort": "AEJAZ", "anticipatedActivity": "FSH", "tripStartDate": "2018-02-17T00:00Z", "departureDatetimeUtc": "2018-02-17T01:05Z"}',
        CURRENT_DATE - INTERVAL '4 days', 'ERS', 'TurboCatch (3.7-1)'),
       ('OOF20190439686457', 20230087, 'OOF', CURRENT_DATE - INTERVAL '3 days', 'DAT', 'OOF20190439686457', null,
        CURRENT_DATE - INTERVAL '3 days',
        'FR263454484', 'FE4864', '8FR6541', 4, 'NO NAME', 'FRA', null, 'PNO',
        '{"port": "AEJAZ", "purpose": "LAN", "catchOnboard": [{"weight": 25.0, "nbFish": null, "species": "SOL", "faoZone": "27.8.a", "effortZone": "C", "economicZone": "FRA", "statisticalRectangle": "23E6"}], "tripStartDate": "2018-02-20T00:00Z", "predictedArrivalDatetimeUtc": "2018-02-20T13:38Z"}',
        CURRENT_DATE - INTERVAL '3 days', 'ERS', 'TurboCatch (3.7-1)'),
       ('d5c3b039-aaee-4cca-bcae-637f5fe574f5', 'SRC-TRP-TTT20200506194051795', null, CURRENT_DATE - INTERVAL '2 days', 'DAT',
        'd5c3b039-aaee-4cca-bcae-637f5fe574f5', null, CURRENT_DATE - INTERVAL '2 days', 'FR263454484', 'FE4864', '8FR6541', 4, 'NO NAME', 'FRA', null,
        'PNO',
        '{"port": "GBPHD", "purpose": "LAN", "catchOnboard": [{"nbFish": null, "weight": 1500.0, "species": "GHL"}], "tripStartDate": "2020-05-04T19:41:03.340Z", "predictedArrivalDatetimeUtc": "2020-05-06T11:41:03.340Z"}',
        CURRENT_DATE - INTERVAL '2 days', 'FLUX', null);



UPDATE logbook_reports
SET value = jsonb_set(
    value,
    '{predictedArrivalDatetimeUtc}',
    concat(
        '"',
        to_char(CURRENT_DATE AT TIME ZONE 'UTC' - interval '2 days 20 hours', 'YYYY-MM-DD"T"HH24:MI:SSZ'),
        '"'
    )::jsonb
)
WHERE operation_number = 'OOF20190439686457';

UPDATE logbook_reports
SET value = jsonb_set(
    value,
    '{tripStartDate}',
    concat(
        '"',
        to_char(CURRENT_DATE AT TIME ZONE 'UTC' - interval '5 days', 'YYYY-MM-DDT00:00:00Z'),
        '"'
    )::jsonb
)
WHERE operation_number = 'OOF20190439686457';

UPDATE logbook_reports
SET value = jsonb_set(
    value,
    '{predictedArrivalDatetimeUtc}',
    concat(
        '"',
        to_char(CURRENT_DATE AT TIME ZONE 'UTC' - interval '1 days 12 hours', 'YYYY-MM-DD"T"HH24:MI:SSZ'),
        '"'
    )::jsonb
)
WHERE operation_number = 'd5c3b039-aaee-4cca-bcae-637f5fe574f5';

UPDATE logbook_reports
SET value = jsonb_set(
    value,
    '{tripStartDate}',
    concat(
        '"',
        to_char(CURRENT_DATE AT TIME ZONE 'UTC' - interval '6 days', 'YYYY-MM-DDT00:00:00Z'),
        '"'
    )::jsonb
)
WHERE operation_number = 'd5c3b039-aaee-4cca-bcae-637f5fe574f5';

UPDATE logbook_reports
SET
    enriched = true,
    trip_gears = '[]'::jsonb,
    trip_segments = '[]'::jsonb,
    value = jsonb_set(value, '{pnoTypes}', '[]'::jsonb)
WHERE operation_number IN ('OOF20191011059902', 'OOF20190439686457', 'd5c3b039-aaee-4cca-bcae-637f5fe574f5');

UPDATE logbook_reports
SET
    enriched = true,
    trip_gears = '[{"gear": "GTR", "mesh": 100, "dimensions": "250;180"}, {"gear": "GTR", "mesh": 120.5, "dimensions": "250;280"}]'::jsonb,
    trip_segments = '[{"segment": "NWW01", "segmentName": "Chalutiers de fond"}, {"segment": "PEL01", "segmentName": "Chalutiers pélagiques"}]'::jsonb,
    value = jsonb_set(
        value,
        '{pnoTypes}',
        '[
            {
                "pnoTypeName": "Préavis type X",
                "minimumNotificationPeriod": 4.0,
                "hasDesignatedPorts": false
            },
            {
                "pnoTypeName": "Préavis type Y",
                "minimumNotificationPeriod": 8.0,
                "hasDesignatedPorts": true
            }
        ]'::jsonb
    )
WHERE operation_number = 'OOF20191011059902';
