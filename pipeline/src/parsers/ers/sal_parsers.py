from datetime import datetime

from src.parsers.ers.childless_parsers import parse_css, parse_cst, parse_src
from src.parsers.utils import tagged_children


def parse_sli(sli):
    children = tagged_children(sli)

    data = {
        "sale_type": "SN",
        "sales_datetime_utc": datetime.fromisoformat(sli.get("DA")),
        "sale_country": sli.get("SC"),
        "sale_port_code": sli.get("SL"),
        "seller_name": sli.get("NS"),
        "buyer_name": sli.get("NB"),
        "buyer_id": sli.get("VN"),
        "sales_contract_reference": sli.get("CN"),
        "bcd_number": sli.get("BC"),
    }

    assert "SRC" in children
    assert len(children["SRC"]) == 1
    data = {**data, **parse_src(children["SRC"][0])}

    assert "CSS" in children
    data["products"] = [parse_css(css) for css in children["CSS"]]

    return data


def parse_tli(tli):
    children = tagged_children(tli)

    data = {
        "sale_type": "TOD",
        "sales_datetime_utc": tli.get("DA"),
        "sale_country": tli.get("SC"),
        "sale_port_code": tli.get("SL"),
        "takeoverOrganizationName": tli.get("NT"),
        "storage_facility_name": tli.get("NF"),
        "storage_facility_address": tli.get("AF"),
        "transport_document_reference": tli.get("TR"),
    }

    assert "SRC" in children
    assert len(children["SRC"]) == 1
    data = {**data, **parse_src(children["SRC"][0])}

    assert "CST" in children
    data["products"] = [parse_cst(cst) for cst in children["CST"]]

    return data
