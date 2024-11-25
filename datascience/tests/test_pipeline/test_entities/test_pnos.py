import dataclasses

import pytest

from src.pipeline.entities.communication_means import CommunicationMeans
from src.pipeline.entities.control_units import ControlUnit
from src.pipeline.entities.pnos import PnoAddressee, PnoSource, RenderedPno


@pytest.fixture
def rendered_pno() -> RenderedPno:
    return RenderedPno(
        report_id=4,
        vessel_id=25,
        cfr="VESSELCFR",
        vessel_name="VESSELNAME",
        is_verified=True,
        is_being_sent=False,
        trip_segments=["Segment 1", "Segment 2"],
        pno_types=["Préavis type 1", "Préavis type 7"],
        port_locode="FRAAA",
        facade="Facade 5",
        source=PnoSource.LOGBOOK,
        control_units=[
            ControlUnit(
                control_unit_id=2,
                control_unit_name="Unité 2",
                administration="Administration 1",
                emails=["alternative@email", "some.email@control.unit.4"],
                phone_numbers=["'00 11 22 33 44 55"],
            ),
            ControlUnit(
                control_unit_id=3,
                control_unit_name="Unité 3",
                administration="Administration 1",
                emails=[],
                phone_numbers=["44 44 44 44 44"],
            ),
        ],
        additional_addressees=[
            PnoAddressee(
                name="Nozey Joey",
                organization="PNO sniffers",
                communication_means=CommunicationMeans.EMAIL,
                email_address_or_number="nozey.joey@pno.snif",
            ),
            PnoAddressee(
                name="Ronald",
                organization="Mc Donald",
                communication_means=CommunicationMeans.SMS,
                email_address_or_number="0000000000",
            ),
            PnoAddressee(
                name="Ronald",
                organization="Mc Donald",
                communication_means=CommunicationMeans.EMAIL,
                email_address_or_number="ronald.mcdonald@ham.burger",
            ),
        ],
    )


def test_rendered_pno_get_addressees_returns_email_addressees(rendered_pno):
    addressees = rendered_pno.get_addressees(
        communication_means=CommunicationMeans.EMAIL
    )
    assert addressees == [
        PnoAddressee(
            name="Unité 2",
            organization="Administration 1",
            communication_means=CommunicationMeans.EMAIL,
            email_address_or_number="alternative@email",
        ),
        PnoAddressee(
            name="Unité 2",
            organization="Administration 1",
            communication_means=CommunicationMeans.EMAIL,
            email_address_or_number="some.email@control.unit.4",
        ),
        PnoAddressee(
            name="Nozey Joey",
            organization="PNO sniffers",
            communication_means=CommunicationMeans.EMAIL,
            email_address_or_number="nozey.joey@pno.snif",
        ),
        PnoAddressee(
            name="Ronald",
            organization="Mc Donald",
            communication_means=CommunicationMeans.EMAIL,
            email_address_or_number="ronald.mcdonald@ham.burger",
        ),
    ]


def test_rendered_pno_get_addressees_returns_sms_addressees(rendered_pno):
    addressees = rendered_pno.get_addressees(communication_means=CommunicationMeans.SMS)
    assert addressees == [
        PnoAddressee(
            name="Unité 2",
            organization="Administration 1",
            communication_means=CommunicationMeans.SMS,
            email_address_or_number="'00 11 22 33 44 55",
        ),
        PnoAddressee(
            name="Unité 3",
            organization="Administration 1",
            communication_means=CommunicationMeans.SMS,
            email_address_or_number="44 44 44 44 44",
        ),
        PnoAddressee(
            name="Ronald",
            organization="Mc Donald",
            communication_means=CommunicationMeans.SMS,
            email_address_or_number="0000000000",
        ),
    ]


def test_rendered_pno_get_addressees_with_empty_lists(rendered_pno):
    rendered_pno = dataclasses.replace(
        rendered_pno,
        control_units=[],
        additional_addressees=[],
    )
    assert rendered_pno.get_addressees(communication_means=CommunicationMeans.SMS) == []
    assert (
        rendered_pno.get_addressees(communication_means=CommunicationMeans.EMAIL) == []
    )


def test_rendered_pno_get_addressees_with_nones(rendered_pno):
    rendered_pno = dataclasses.replace(
        rendered_pno,
        control_units=None,
        additional_addressees=None,
    )
    assert rendered_pno.get_addressees(communication_means=CommunicationMeans.SMS) == []
    assert (
        rendered_pno.get_addressees(communication_means=CommunicationMeans.EMAIL) == []
    )
