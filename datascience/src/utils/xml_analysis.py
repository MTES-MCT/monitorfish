import xml.etree.ElementTree as ET
from xml.etree.ElementTree import ParseError

from src.pipeline.parsers.utils import remove_namespace


def xml_tag_structure_func_factory(max_depth: int = None, max_nb_siblings: int = None):
    """Factory that returns a function that takes an xml string and returns its tag
    structure, with a maximum depth of `max_depth` and a maximum number of siblings of


    Args:
        max_depth (int, optional): Maximum depth to explore. Defaults to None.
        max_nb_siblings (int, optional): Maximum number of sibling nodes to return at
          each level. Defaults to None.

    Returns:
        function: Function that takes an xml string and return its tag structure, with
          the limits on depth and number of siblings, if provided.
    """

    def get_xml_tag_structure(
        xml_element, max_depth=max_depth, max_nb_siblings=max_nb_siblings
    ):
        children = list(xml_element)
        tag = remove_namespace(xml_element.tag)

        if children == [] or max_depth == 1:
            return tag
        else:
            if max_nb_siblings:
                children = children[:max_nb_siblings]

            if max_depth:
                max_depth -= 1

            children_tag_structures = [
                get_xml_tag_structure(
                    child, max_depth=max_depth, max_nb_siblings=max_nb_siblings
                )
                for child in children
            ]

            if len(children) == 1:
                children_tag_structures = children_tag_structures[0]

            return {tag: children_tag_structures}

    def get_xml_string_tag_structure(xml_string: str):
        """Parses the input string as xml object and returns its struture."""
        try:
            xml_element = ET.fromstring(xml_string)
        except ParseError:
            return None
        return get_xml_tag_structure(xml_element, max_depth, max_nb_siblings)

    return get_xml_string_tag_structure
