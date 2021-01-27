import React from "react";
import styled from "styled-components";
import {COLORS} from "../../constants/constants";
// todo fix anticipatedActivityName
const DEPMessageResume = props => {
    return <>
        { props.message ?
            <Zone>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>Activité prévue</Key>
                            <Value>{props.message.anticipatedActivity ? <>{props.message.anticipatedActivityName} ({props.message.anticipatedActivity})</> : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Captures à bord</Key>
                            <Value>{props.message.speciesOnboard && props.message.speciesOnboard.length ?
                                props.message.speciesOnboard.map(speciesCatch => {
                                    return <span key={speciesCatch.species}>
                                        {
                                            speciesCatch.speciesName ?
                                                <>{speciesCatch.speciesName} ({speciesCatch.species})</> : speciesCatch.species
                                        }
                                        {''} - {speciesCatch.weight} kg<br/>
                                    </span>
                                }) : <NoValue>-</NoValue>}</Value>
                        </Field>
                    </TableBody>
                </Fields>
            </Zone> : null }
    </>
}

const TableBody = styled.tbody``

const Zone = styled.div`
  margin: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
`

const Fields = styled.table`
  padding: 0px 5px 5px 5px; 
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  margin-top: 5px;
  margin-bottom: 5px;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${COLORS.textGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const Value = styled.td`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const NoValue = styled.span`
  color: ${COLORS.textBueGray};
  font-weight: 300;
  line-height: normal;
`

export default DEPMessageResume
