import {searchVesselsFromAPI} from "../../api/fetch";

const searchVessels = searched => () => {
    return searchVesselsFromAPI(searched)
}

export default searchVessels
