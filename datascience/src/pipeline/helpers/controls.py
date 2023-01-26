from typing import List, Set, Union


def make_infractions(
    natinfs: Union[None, Set[int]],
    only_natinfs: Set[int] = None,
    exclude_natinfs: Set[int] = None,
) -> List[dict]:
    """
    Generates a list of infraction dicts.

    Args:
        natinfs (Union[None, Set[int]]): Set of infractions natinfs.
        only_natinfs (Set[int], optional): If given, only natinfs in this list will be
          kept. Defaults to None.
        exclude_natinfs (Set[int], optional): If given, natinfs of this list will be
          excluded. Defaults to None.

    Raises:
        ValueError: If both `only_natinfs` and `exclude_natinfs` are given.

    Returns:
        List[dict]: `list` of the form `[{"natinf": 1234}, {"natinf": 9876}]`

    Examples:
        >>> make_infractions({1, 2, 4})
        [{"natinf": 1}, {"natinf": 2}, {"natinf": 4}]

        >>> make_infractions(None)
        []

        >>> make_infractions({})
        []

        >>> make_infractions({1, 2, 4}, only_natinfs={1, 4, 9})
        [{"natinf": 1}, {"natinf": 4}]

        >>> make_infractions({1, 2, 4}, exclude_natinfs={1, 4, 9})
        [{"natinf": 9}]
    """

    try:
        assert only_natinfs is None or exclude_natinfs is None
    except AssertionError:
        raise ValueError("Cannot pass both `only_natinfs` and `exclude_natinfs`")

    if not natinfs:
        infractions = []

    else:
        if only_natinfs:
            natinfs = natinfs.intersection(only_natinfs)

        if exclude_natinfs:
            natinfs = natinfs.difference(exclude_natinfs)

        infractions = [{"natinf": n} for n in natinfs]

    return infractions
