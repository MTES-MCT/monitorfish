from typing import List, Set, Union

from src.entities.missions import InfractionType


def make_infractions(
    natinfs: Union[None, Set[int]],
    infraction_type: InfractionType
) -> List[dict]:
    """
    Generates a list of infraction dicts.

    Args:
        natinfs (Union[None, Set[int]]): Set of infractions natinfs.
        infraction_type (InfractionType): infraction_type to set in the infractions.

    Raises:
        ValueError: If both `only_natinfs` and `exclude_natinfs` are given.

    Returns:
        List[dict]: `list` of the form `[{"natinf": 1234}, {"natinf": 9876}]`

    Examples:
        >>> make_infractions({1, 2, 4}, InfractionType.WITH_RECORD)
        [
            {"natinf": 1, "infractionType": "WITH_RECORD"},
            {"natinf": 2, "infractionType": "WITH_RECORD"},
            {"natinf": 4, "infractionType": "WITH_RECORD"}
        ]

        >>> make_infractions(None, InfractionType.WITH_RECORD)
        []

        >>> make_infractions({}, InfractionType.WITH_RECORD)
        []
    """

    assert isinstance(infraction_type, InfractionType)

    if not natinfs:
        infractions = []

    else:
        infractions = [
            {"natinf": n, "infractionType": infraction_type.value} for n in natinfs
        ]

    return infractions
