import xml.etree.ElementTree as ET
from xml.etree.ElementTree import ParseError


NS = {'ers': 'http://ec.europa.eu/fisheries/schema/ers/v3'}


def remove_namespace(tag:str):
    """Removes xmlns from tag string. 
    
    --------
    Examples
    
    >>> remove_namespace("{http://ec.europa.eu/fisheries/schema/ers/v3}OPS")
    "OPS"
    """
    return tag.split("}")[-1]


def xml_tag_structure_func_factory(max_depth, max_nb_children):
    def get_xml_tag_structure(xml_element, max_depth=max_depth, max_nb_children=max_nb_children):
        children = xml_element.getchildren()
        tag = remove_namespace(xml_element.tag)

        if children == [] or max_depth == 1:
            return tag
        else :
            if max_nb_children:
                children = children[:max_nb_children]

            if max_depth:
                max_depth -= 1

            children_tag_structures = [
                get_xml_tag_structure(
                    child, 
                    max_depth=max_depth, 
                    max_nb_children=max_nb_children) 
                for child in children
            ]

            if len(children) == 1:
                children_tag_structures = children_tag_structures[0]

            return {tag : children_tag_structures}
        
        
    def get_xml_string_tag_structure(xml_string):
        try:
            xml_element = ET.fromstring(xml_string)
        except ParseError:
            return None
        return get_xml_tag_structure(xml_element, max_depth, max_nb_children)
        
        
    return get_xml_string_tag_structure
    

def has_tag(tag):
    def has_tag_(xml_element):
        elements = xml_element.findall(f'.//ers:{tag}', NS)
        if elements == []:
            return False
        else :
            return True
    return has_tag_


def get_elements_by_ers_tag(xml_element, ers_tag):
    return xml_element.findall(f'.//ers:{ers_tag}', NS)
