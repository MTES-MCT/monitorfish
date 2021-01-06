def parse_far(far):
    root_tag = get_root_tag(far, assert_tag='FAR')
    
    gear_declarations = [
        child for child in list(far) 
        if remove_namespace(child.tag) == 'GEA'
    ]
    
    data = {
        'date': far.get('DA'),
        'time': far.get('TI'),
        'catches': [parse(child) for child in list(far) if remove_namespace(child.tag) == 'SPE']
    }
    
    return data, gear_declarations


def parse_gea(gea):
    root_tag = get_root_tag(gea, assert_tag='GEA')
    
    data = {"gear": gea.get('GE')}
    
    return data, []


def parse_spe(spe):
    root_tag = get_root_tag(spe, assert_tag='SPE')
    
    data = {
        'species': spe.get('SN'),
        'weight': spe.get('WT'),
        'gear': spe.get('')}

    return data, []