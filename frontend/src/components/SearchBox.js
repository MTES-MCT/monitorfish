import React, {useContext, useEffect, useRef, useState} from "react";
import {Context} from "../Store";
import {ReactComponent as SearchIcon} from './icons/search.svg'

const SearchBox = () => {
    const [state, dispatch] = useContext(Context)
    const firstUpdate = useRef(true);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        console.log(searchText)
    }, [searchText])

    return (<div className={`search-box`}>
        <SearchIcon className={'search-box-icon'}/>
        <input type="text" placeholder={'Chercher un CFR, MMSI...'} onChange={e => setSearchText(e.target.value)}/>
    </div>)
}

export default SearchBox
