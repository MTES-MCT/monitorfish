import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'

export const Label = styled.div`
  display: flex;
`

export const Elem = styled.li`
  list-style-type: none;
`

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  padding-bottom: ${props => props.isLast ? 0 : 20}px;
  margin: 0;
`

export const Key = styled.th`
  color: ${COLORS.slateGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 6px 10px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: 400;
`

export const Value = styled.td`
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px ${props => props.isNotLastItem ? 0 : 5}px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-size: 13px;
  font-weight: 500;
  
  p {
    margin: 0;
  }
  ul {
    margin: 0;
  }
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  font-weight: 500;
  padding: 15px 45px 15px 20px;
  text-align: left;
  border-bottom: 1px solid ${COLORS.lightGray};
  
  p {
    margin: 0;
  }
  ul {
    margin: 0;
  }
`

export const SectionTitle = styled.span`
  display: flex;
  flex-direction: row;
  color: ${COLORS.slateGray};
  font-size: 13px;
  align-items: center;
  margin-top: ${props => props.hasPreviousRegulatedGearsBloc ? 20 : 0}px;
`

export const Fields = styled.table`
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  padding: unset;
`

export const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`
