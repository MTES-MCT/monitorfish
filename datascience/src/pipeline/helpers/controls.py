from typing import List, Set, Union

from src.pipeline.entities.missions import InfractionType


def make_infractions(
    natinfs: Union[None, Set[int]],
    infraction_type: InfractionType,
    only_natinfs: Set[int] = None,
    exclude_natinfs: Set[int] = None,
) -> List[dict]:
    """
    Generates a list of infraction dicts.

    Args:
        natinfs (Union[None, Set[int]]): Set of infractions natinfs.
        infraction_type (InfractionType): infraction_type to set in the infractions.
        only_natinfs (Set[int], optional): If given, only natinfs in this list will be
          kept. Defaults to None.
        exclude_natinfs (Set[int], optional): If given, natinfs of this list will be
          excluded. Defaults to None.

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

        >>> make_infractions(
        ...     {1, 2, 4},
        ...     InfractionType.WITHOUT_RECORD,
        ...     only_natinfs={1, 4, 9}
        ... )
        [
            {"natinf": 1, "infractionType": "WITHOUT_RECORD"},
            {"natinf": 4, "infractionType": "WITHOUT_RECORD"}
        ]

        >>> make_infractions(
        ...     {1, 2, 4}, InfractionType.WITHOUT_RECORD, exclude_natinfs={1, 4, 9}
        ... )
        [{"natinf": 9, "infractionType": "WITHOUT_RECORD"}]
    """

    try:
        assert only_natinfs is None or exclude_natinfs is None
    except AssertionError:
        raise ValueError("Cannot pass both `only_natinfs` and `exclude_natinfs`")

    assert isinstance(infraction_type, InfractionType)

    if not natinfs:
        infractions = []

    else:
        if only_natinfs:
            natinfs = natinfs.intersection(only_natinfs)

        if exclude_natinfs:
            natinfs = natinfs.difference(exclude_natinfs)

        infractions = [
            {"natinf": n, "infractionType": infraction_type.value} for n in natinfs
        ]

    return infractions
