import React from "react";
import styled from 'styled-components';
import {COLORS} from "../constants/constants";

const RegulatoryNameCard = props => {
    return (
        <Wrapper>
            {
                props.regulatory ? <>
                    {props.regulatory.getProperties().layer_name.replace(/[_]/g, ' ')}
                    {
                        props.regulatory.getProperties().zones ?
                            <ZoneName>{props.regulatory.getProperties().zones.replace(/[_]/g, ' ')}</ZoneName> : null
                    }
                </> : null
            }

        </Wrapper>
    )
}

const ZoneName = styled.span`
  font-weight: 400;
  color: ${COLORS.textGray}
  font-size: 13px;
  margin-left: 10px;
`

const Wrapper = styled.div`
  padding: 10px;
  width: max-content;
  border: 1px solid ${COLORS.textGray};
  background: ${COLORS.grayBackground};
  font-size: 13px;
  font-weight: 500;
  color: ${COLORS.grayDarkerTwo}
`

export default RegulatoryNameCard
