import { COLORS } from '../../constants/constants'
import styled from 'styled-components'
import SearchIconSVG from '../icons/Loupe_dark.svg'

const FilterTableInput = styled.input`
  margin-bottom: 5px;
  background-color: white;
  border: 1px ${COLORS.lightGray} solid;
  border-radius: 0px;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  height: 40px;
  width: 280px;
  padding: 0 5px 0 10px;
  flex: 3;
  background-image: url(${p => p.baseUrl}/${SearchIconSVG});
  background-size: 25px;
  background-position: bottom 3px right 5px;
  background-repeat: no-repeat;

  :hover, :focus {
    border-bottom: 1px ${COLORS.lightGray} solid;
  }
`

export default FilterTableInput
const EmptyTable = styled.div`
  text-align: center;
  color: ${COLORS.slateGray};
  margin-top: 20px;
`
