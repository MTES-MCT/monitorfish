import React, {useEffect, useState} from "react";
import {ReactComponent as SearchIcon} from '../icons/search.svg'

const RegulatoryLayerSearchBox = props => {
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (searchText.length > 1 && props.layerNames) {
            const foundLayerNames = props.layerNames
                .filter(layerName => layerName.toLowerCase().includes(searchText.toLowerCase()))
                .filter(layerName => layerName)

            props.setFoundLayerNames(foundLayerNames)
        } else {
            props.setFoundLayerNames([])
        }
    }, [searchText, props.layerNames])


    return (
        <div className={`regulatory-search-box`}>
            <SearchIcon className={'search-box-icon'}/>
            <input type="text" value={searchText} placeholder={'Chercher une REG...'} onChange={e => setSearchText(e.target.value)}/>
        </div>)
}

export default RegulatoryLayerSearchBox
