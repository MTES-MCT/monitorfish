import datetime
import os
import unittest
import pandas as pd

from config import TEST_DATA_LOCATION
from src.pipeline.parsers.flux.flux import FLUXParsingError, batch_parse, parse_xml_document

XML_TEST_DATA_LOCATION = TEST_DATA_LOCATION / "flux/business"
XML_EMPTY_DATA_LOCATION = TEST_DATA_LOCATION / "flux"

class TestLogParsers(unittest.TestCase):
    def parse_file(self, test_file: str, has_data: bool = False):
        with open(os.path.join(XML_EMPTY_DATA_LOCATION, test_file), "r") as f:
            xml_string = f.read()
        res = parse_xml_document(xml_string,False)
        metadata = res[0][0]
        data_iter = res[0][1]
        data_list = list(data_iter)
        return metadata, data_list

    def test_parse_empty_message(self):
        test_file = "empty_message.xml"
        self.assertRaises(FLUXParsingError, self.parse_file, test_file)

    def test_parser(self):
        unittest.TestCase.maxDiff=None

        flux_file_list=[]
        for filename in os.listdir(XML_TEST_DATA_LOCATION):
            with open(os.path.join(XML_TEST_DATA_LOCATION, filename), 'r') as f:
                    xml_string = f.read()
                    flux_file_list.append(xml_string)

        res = batch_parse(flux_file_list)
        df = res.get("parsed").drop("integration_datetime_utc", axis=1)

        expected_res = pd.DataFrame(
            columns=pd.Index(
                [
                    "operation_number",
                    "operation_datetime_utc",
                    "operation_type",
                    "report_id",
                    "referenced_report_id",
                    "report_datetime_utc",
                    "cfr",
                    "ircs",
                    "external_identification",
                    "vessel_name",
                    "flag_state",
                    "imo",
                    "log_type",
                    "value",
                    "trip_number",
                ]
            ),
            data=[
                ["9376ccbd-be2f-4d3d-b4ac-3c559ac9586a",datetime.datetime(2021, 1, 31, 12, 29, 2),"DAT","8eec0190-c353-4147-8a65-fcc697fbadbc",None,datetime.datetime(2021, 1, 22, 9, 2, 47),"BEL035102000","OPUF","Z.510","Dennis","BEL",None,"COE",{'effortZoneEntryDatetimeUtc': '2021-01-22T09:00:00Z', 'targetSpeciesOnEntry': 'DEMERSAL', 'faoZoneEntered': '27.4.c', 'economicZoneEntered': 'BEL', 'statisticalRectangleEntered': '31F3', 'effortZoneEntered': None, 'latitude': 51.333333, 'longitude': 3.2},"BEL-TRP-Z510-2021012200107"],
                ["8826952f-b240-4570-a9dc-59f3a24c7bf1",datetime.datetime(2020, 5, 6, 18, 39, 33),"DAT","1e1bff95-dfff-4cc3-82d3-d72b46fda745",None,datetime.datetime(2020, 5, 6, 15, 39, 33),"CYP123456789",None,None,"GOLF","CYP","1234567","DEP",{'departureDatetimeUtc': '2020-05-06T11:39:33.176Z', 'departurePort': 'ESCAR', 'anticipatedActivity': 'FIS', 'gearOnboard': [{'gear': 'PS', 'mesh': 140.0, 'dimensions': 14.0}], 'speciesOnboard': [{'species': 'COD', 'weight': 50.0, 'nbFish': None, 'economicZone': 'ESP', 'faoZone': '27.9.b.2', 'presentation': 'GUT', 'packaging': 'BOX', 'preservationState': 'FRO', 'conversionFactor': 1.1}]},"SRC-TRP-T2T20200506193933176"],
                ["5ee8be46-2efe-4a29-b2df-bdf2d3ed66a1",datetime.datetime(2020, 5, 6, 18, 39, 40),"DAT","7712fe73-cef2-4646-97bb-d634fde00b07",None,datetime.datetime(2020, 5, 6, 15, 39, 40),"CYP123456789",None,None,"GOLF","CYP","1234567","DEP",{'departureDatetimeUtc': '2020-05-06T11:39:40.722Z', 'departurePort': 'ESCAR', 'anticipatedActivity': 'FIS', 'gearOnboard': [{'gear': 'PS', 'mesh': 140.0, 'dimensions': 14.0}]},"SRC-TRP-TTT20200506193940722"],
                ["48794a8f-adfa-43b2-b4c3-2e8d3581bfb4",datetime.datetime(2020, 5, 6, 18, 39, 46),"DAT","2843bd5b-e4e7-4816-8372-76805201301e",None,datetime.datetime(2020, 5, 6, 15, 39, 46),"CYP123456789","IRCS6","XR006","GOLF","CYP","1234567","NOT-COE",None,"SRC-TRP-TTT20200506193946583"],
                ["196aca16-da66-4077-b340-ecad701be662",datetime.datetime(2020, 5, 6, 18, 39, 59),"DAT","b2fca5fb-d1cd-4ec7-8a8c-645cecab6866",None,datetime.datetime(2020, 5, 6, 15, 39, 59),"CYP123456789",None,None,None,"CYP",None,"FAR",{'farDatetimeUtc': '2020-05-06T11:39:59.462Z', 'gear': 'TBB', 'mesh': 140.0, 'dimensions': 250.0, 'catches': [{'species': 'COD', 'weight': 1000.0, 'nbFish': None}]},"SRC-TRP-TTT20200506193959462"],
                ["4a4c8d24-f4be-4ccb-8aef-99ab5aae7e02",datetime.datetime(2020, 5, 6, 18, 40, 5),"DAT","1a87f3de-dea9-4018-8c2e-d6cdfa97318e",None,datetime.datetime(2020, 5, 6, 15, 40, 5),"CYP123456789","IRCS6","XR006","GOLF","CYP","1234567","FAR",{'farDatetimeUtc': '2020-05-04T19:40:05.354Z', 'gear': 'TBB', 'mesh': 140.0, 'dimensions': 250.0, 'catches': [{'species': 'COD', 'weight': 1000.0, 'nbFish': None}], 'latitude': 57.7258, 'longitude': 0.5983},"SRC-TRP-TTT20200506194005354"],
                ["251db84c-1d8b-49be-b426-f70bb2c68a2d",datetime.datetime(2020, 5, 6, 18, 40, 11),"DAT","fe7acdb9-ff2e-4cfa-91a9-fd2e06b556e1",None,datetime.datetime(2020, 5, 6, 15, 40, 11),"CYP123456789",None,None,None,"CYP",None,"FAR",{'farDatetimeUtc': '2020-05-06T11:40:11.291Z'},"SRC-TRP-TTT20200506194011291"],
                ["08a125d6-6b6d-4f90-b26a-bf8426673eea",datetime.datetime(2020, 5, 6, 18, 40, 17),"DAT","74fcd0f7-8117-4791-9aa3-37d5c7dce880",None,datetime.datetime(2020, 5, 6, 15, 40, 17),"SVN123456789",None,None,None,"SVN",None,"FAR",{'farDatetimeUtc': '2020-04-29T12:00:00.000Z', 'catches': [{'species': 'BFT', 'weight': 0.0, 'nbFish': None}], 'latitude': 39.65, 'longitude': 6.83},"SRC-TRP-TTT20200506194017100"],
                ["9e38840b-f05a-49a4-ab34-e41131749fd0",datetime.datetime(2020, 5, 6, 18, 40, 22),"DAT","1706938b-c3c8-4d34-b32f-54c8d2c0705a",None,datetime.datetime(2020, 5, 6, 15, 40, 22),"CYP123456789","IRCS6","XR006","GOLF","CYP","1234567","FAR",{'farDatetimeUtc': '2020-05-06T11:40:22.885Z', 'catches': [{'species': 'MZZ', 'weight': 0.0, 'nbFish': None}]},"SRC-TRP-TTT20200506194022885"],
                ["60e0d2e0-2713-43d7-9fa1-fcf968e34d82",datetime.datetime(2020, 5, 6, 18, 40, 28),"DAT","a36d23c5-b339-455d-9b0b-bf766a9d57d9",None,datetime.datetime(2020, 5, 6, 15, 40, 28),"CYP123456789","IRCS6","XR006","GOLF","CYP","1234567","JOINT_FISHING_OPERATION",None,"SRC-TRP-TTT20200506194028615"],
                ["0e1ea2b6-f4f5-4958-bc48-cfb016a22f58",datetime.datetime(2020, 5, 6, 18, 40, 34),"DAT","a913a52e-5e66-4f40-8c64-148f90fa8cd9",None,datetime.datetime(2020, 5, 6, 15, 40, 34),"CYP123456789",None,None,None,"CYP",None,"DIS",{'discardDatetimeUtc': '2020-05-06T11:40:34.449Z', 'catches': [{'species': 'COD', 'weight': 100.0, 'nbFish': None}]},"SRC-TRP-TTT20200506194034449"],
                ["3cffa378-0f8c-4540-b849-747621cfcb4a",datetime.datetime(2020, 5, 6, 18, 40, 40),"DAT","7b487ada-019c-4b62-be32-7d15f7718344",None,datetime.datetime(2020, 5, 6, 15, 40, 40),"CYP123456789",None,None,None,"CYP","1234567","RLC",None,"SRC-TRP-TTT20200506194040138"],
                ["7bf7401d-cbb1-4e6f-bad8-7e309ee004cf",datetime.datetime(2020, 5, 6, 18, 40, 45),"DAT","ced42f65-a1ac-40e1-93c7-851d4933f770",None,datetime.datetime(2020, 5, 6, 15, 40, 45),"CYP123456789",None,None,"GOLF","CYP",None,"RLC",None,"SRC-TRP-TTT20200506194045960"],
                ["cc7ee632-e515-460f-a1c1-f82222a6d419",datetime.datetime(2020, 5, 6, 18, 40, 51),"DAT","f006a2e5-0fdd-48a0-9a9a-ccae00d052d8",None,datetime.datetime(2020, 5, 6, 15, 40, 51),"CYP123456789","IRCS6","XR006","GOLF","CYP","1234567","NOT-COX",None,"SRC-TRP-TTT20200506194051795"],
                ["a3c52754-97e1-4a21-ba2e-d8f16f4544e9",datetime.datetime(2020, 5, 6, 18, 40, 57),"DAT","9d1ddd34-1394-470e-b8a6-469b86150e1e",None,datetime.datetime(2020, 5, 6, 15, 40, 57),"CYP123456789",None,None,None,"CYP",None,"COX",{'effortZoneExitDatetimeUtc': '2020-05-06T11:40:57.580Z', 'targetSpeciesOnExit': None, 'faoZoneExited': None, 'economicZoneExited': None, 'statisticalRectangleExited': None, 'effortZoneExited': 'A', 'latitudeExited': 46.678, 'longitudeExited': -14.616},"SRC-TRP-TTT20200506194057580"],
                ["d5c3b039-aaee-4cca-bcae-637fa8effe14",datetime.datetime(2020, 5, 6, 18, 41, 3),"DAT","7ee30c6c-adf9-4f60-a4f1-f7f15ab92803",None,datetime.datetime(2020, 5, 6, 15, 41, 3),"CYP123456789",None,None,None,"CYP",None,"PNO",{'predictedArrivalDatetimeUtc': '2020-05-06T11:41:03.340Z', 'port': 'GBPHD', 'purpose': 'LAN', 'tripStartDate': '2020-05-04T19:41:03.340Z', 'economicZone': 'GBR', 'catchOnboard': [{'species': 'GHL', 'weight': 1500.0, 'nbFish': None}]},"SRC-TRP-TTT20200506194103340"],
                ["7cfcdde3-286c-4713-8460-2ed82a59be34",datetime.datetime(2020, 5, 6, 18, 41, 9),"DAT","fc16ea8a-3148-44b2-977f-de2a2ae550b9",None,datetime.datetime(2020, 5, 6, 15, 41, 9),"CYP123456789",None,None,None,"CYP",None,"PNO",{'predictedArrivalDatetimeUtc': '2020-05-06T11:41:09.200Z', 'port': 'GBPHD', 'purpose': 'SHE', 'tripStartDate': '2020-05-04T19:41:09.200Z', 'economicZone': 'GBR'},"SRC-TRP-TTT20200506194109200"],
                ["4f971076-e6c6-48f6-b87e-deae90fe4705",datetime.datetime(2020, 5, 6, 18, 41, 15),"DAT","cc45063f-2d3c-4cda-ac0c-8381e279e150",None,datetime.datetime(2020, 5, 6, 15, 41, 15),"CYP123456789",None,None,"GOLF","CYP",None,"RTP",{'returnDatetimeUtc': '2020-05-06T11:41:15.013Z', 'port': 'ESCAR', 'reasonOfReturn': 'REF'},"SRC-TRP-TTT20200506194115013"],
                ["8f06061e-e723-4b89-8577-3801a61582a2",datetime.datetime(2020, 5, 6, 18, 41, 20),"DAT","dde5df56-24c2-4a2e-8afb-561f32113256",None,datetime.datetime(2020, 5, 6, 15, 41, 20),"CYP123456789","IRCS6","XR006",None,"CYP",None,"RTP",{'returnDatetimeUtc': '2020-05-06T11:41:20.712Z', 'port': 'ESCAR', 'reasonOfReturn': 'LAN', 'gearOnboard': [{'gear': 'GN', 'mesh': 140.0, 'dimensions': 1000.0}]},"SRC-TRP-TTT20200506194120712"],
                ["8db132d1-68fc-4ae6-b12e-4af594351701",datetime.datetime(2020, 5, 6, 18, 41, 26),"DAT","83952732-ef89-4168-b2a1-df49d0aa1aff",None,datetime.datetime(2020, 5, 6, 15, 41, 26),"CYP123456789",None,None,None,"CYP",None,"LAN",{'landingDatetimeUtc': '2020-05-05T19:41:26.516Z', 'port': 'ESCAR', 'sender': None, 'catchLanded': [{'species': 'HAD', 'weight': 100.0, 'nbFish': None, 'economicZone': 'ESP', 'faoZone': '27.9.b.2', 'presentation': 'GUT', 'packaging': 'BOX', 'preservationState': 'FRO', 'conversionFactor': 1.2}]},"SRC-TRP-TTT20200506194126516"],
                ["b509d82f-ce27-46c2-b5a3-d2bcae09de8a",datetime.datetime(2020, 5, 6, 18, 41, 32),"DAT","ddf8f969-86f1-4eb9-a9a6-d61067a846bf",None,datetime.datetime(2020, 5, 6, 15, 41, 32),"SVN123456789",None,None,None,"SVN",None,"TRA",None,"SRC-TRP-TTT20200506194132307"],
                ["6c26236d-51ad-4aee-ac37-8e83978346a0",datetime.datetime(2020, 5, 6, 18, 41, 38),"DAT","b581876a-ae95-4a07-8b56-b6b5d8098a57",None,datetime.datetime(2020, 5, 6, 15, 41, 38),"SVN123456789",None,None,None,"SVN",None,"TRA",None,"SRC-TRP-TTT20200506194138089"],
                ["81cf0182-db9c-4384-aca3-a75b1067c41a",datetime.datetime(2020, 5, 6, 18, 41, 43),"DAT","ce5c46ca-3912-4de1-931c-d66b801b5362",None,datetime.datetime(2020, 5, 6, 15, 41, 43),"CYP123456789",None,None,None,"CYP",None,"NOT-TRA",None,"SRC-TRP-TTT20200506194143848"],
                ["ab1058c7-b7cf-4345-a0b3-a9f472cc6ef6",datetime.datetime(2020, 5, 6, 18, 41, 49),"DAT","e43c3bf0-163c-4fb0-a1de-1a61beb87988",None,datetime.datetime(2020, 5, 6, 15, 41, 49),"CYP123456789","IRCS6","XR006",None,"CYP","1234567","NOT-TRA",None,"SRC-TRP-TTT20200506194149664"],
            ]
        )

        pd.testing.assert_frame_equal(df.reset_index(drop=True), expected_res.reset_index(drop=True),check_dtype=False)