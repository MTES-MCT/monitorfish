from typing import List, Sequence


def remove_redundant_fao_area_codes(s: Sequence[str]) -> List[str]:
    """Filters the input sequence of FAO areas to keep only the smallest non
    overlapping areas.

    This is useful to prune lists of FAO areas that result from intersecting a
    geometry (ports, vessel position...) with all FAO areas. In such cases we only
    want to keep the smallest (most precise) FAO areas in the result.

    Args:
        s (Sequence[str]): list of FAO areas.

    Returns:
        List[str]: subset of the input sequence.

    Examples:
        >>> remove_redundant_fao_area_codes(['27.8.a', '27', '37.1'])
        ['27.8.a', '37.1']
    """
    s = set(s)
    return [a for a in s if True not in {a == t[: len(a)] for t in (s - {a})}]
