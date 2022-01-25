import React, { useCallback } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as REGPaperSVG } from '../../icons/reg_paper_dark.svg'
import { ReactComponent as AlertSVG } from '../../icons/Picto_alerte.svg'
import { FingerprintSpinner } from 'react-epic-spinners'
import closeRegulatoryZoneMetadata from '../../../domain/use_cases/closeRegulatoryZoneMetadata'
import { useDispatch, useSelector } from 'react-redux'
import { CloseIcon } from '../../commonStyles/icons/CloseIcon.style'
import { fishingPeriodToString, getTitle } from '../../../domain/entities/regulatory'
import { RedCircle, GreenCircle, BlackCircle } from '../../commonStyles/Circle.style'

const RegulatoryLayerZoneMetadata = () => {
  const dispatch = useDispatch()

  const {
    regulatoryZoneMetadata,
    regulatoryZoneMetadataPanelIsOpen
  } = useSelector(state => state.regulatory)

  const { healthcheckTextWarning } = useSelector(state => state.global)

  const displayRegulatoryZoneMetadata = useCallback(() => {
    function onCloseIconClicked () { dispatch(closeRegulatoryZoneMetadata()) }

    const {
      lawType,
      topic,
      region,
      fishingPeriod,
      regulatoryGears,
      regulatorySpecies
    } = regulatoryZoneMetadata

    return (<>
      <Header>
        <REGPaperIcon/>
        <RegulatoryZoneName title={getTitle(regulatoryZoneMetadata)}>
          {getTitle(regulatoryZoneMetadata)}
        </RegulatoryZoneName>
        <CloseIcon
          data-cy={'regulatory-layers-metadata-close'}
          onClick={onCloseIconClicked}
        />
      </Header>
      <Warning>
        <WarningIcon/>
        Travail en cours, bien vérifier dans Légipêche la validité de la référence et des infos réglementaires
      </Warning>
      <Content>
        <Zone>
          <Fields>
            <Body>
              <Field>
                <Key>Ensemble reg.</Key>
                <Value data-cy={'regulatory-layers-metadata-lawtype'}>
                  {lawType || <NoValue>-</NoValue>}
                </Value>
              </Field>
              <Field>
                <Key>Thématique</Key>
                <Value>{topic || <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key>Région</Key>
                <Value>{region || <NoValue>-</NoValue>}</Value>
              </Field>
            </Body>
          </Fields>
        </Zone>
        {fishingPeriod && <Section>
          <SectionTitle>{fishingPeriod.authorized ? <GreenCircle margin={'0 5px 0 0'} /> : <RedCircle margin={'0 5px 0 0'} />}
          Période de pêche {fishingPeriod.authorized ? 'autorisée' : 'interdites'}</SectionTitle>
          {fishingPeriodToString(fishingPeriod)}
        </Section>}
        {regulatoryGears && <Section>
          <SectionTitle>{regulatoryGears.authorized ? <GreenCircle margin={'0 5px 0 0'} /> : <RedCircle margin={'0 5px 0 0'} />}
          Engins {regulatoryGears.authorized ? 'réglementés' : 'interdits'}</SectionTitle>
          <List>
          {Object.keys(regulatoryGears.regulatedGears).length > 0
            ? Object.keys(regulatoryGears.regulatedGears).map(gearLabel => {
              const { code, name, meshType, mesh } = regulatoryGears.regulatedGears[gearLabel]
              return (<Elem key={gearLabel}><Label><BlackCircle />{`${code} (${name})`}</Label>
                {mesh && <Mesh><Key>Maillage</Key>
                <Value>{meshType === 'between' ? `entre ${mesh[0]} et ${mesh[1]} mm` : `supérieur ou égal à ${mesh[0]} mm`}</Value></Mesh>}
              </Elem>)
            })
            : null
          }
          {Object.keys(regulatoryZoneMetadata.regulatoryGears.regulatedGearCategories).length > 0
            ? Object.keys(regulatoryZoneMetadata.regulatoryGears.regulatedGearCategories).map(gearCategoryLabel => {
              const { name, meshType, mesh } = regulatoryZoneMetadata.regulatoryGears.regulatedGearCategories[gearCategoryLabel]
              return (<Elem key={gearCategoryLabel}><Label><BlackCircle />{name}</Label>
                {mesh && <Mesh><Key>Maillage</Key>
                <Value>{meshType === 'between' ? `entre ${mesh[0]} et ${mesh[1]} mm` : `supérieur ou égal à ${mesh[0]} mm`}</Value></Mesh>}
              </Elem>)
            })
            : null
          }
          </List>
          {regulatoryZoneMetadata.regulatoryGears.otherInfo &&
            <><SectionTitle>Mesures techniques</SectionTitle>
              {regulatoryZoneMetadata.regulatoryGears.otherInfo}
            </>
          }
        </Section>}
        {regulatorySpecies && <Section>
          <SectionTitle>{regulatorySpecies.authorized ? <GreenCircle margin={'0 5px 0 0'} /> : <RedCircle margin={'0 5px 0 0'} />}
          Espèces {regulatorySpecies.authorized ? 'réglementées' : 'interdites'}</SectionTitle>
          <List>
          {regulatorySpecies.species.length > 0
            ? regulatorySpecies.species.map((specie) => {
              const { code, quantity, minimumSize } = specie
              return (<Elem key={specie}><Label><BlackCircle />{code}</Label>
                  {quantity && <Mesh><Key>Quantité</Key><Value>{quantity}</Value></Mesh>}
                  {minimumSize && <Mesh><Key>Taille min.</Key><Value>{minimumSize}</Value></Mesh>}
                </Elem>)
            })
            : null
          }
          {Object.keys(regulatorySpecies.speciesGroups).length > 0
            ? Object.keys(regulatorySpecies.speciesGroups).map(group => {
              return (<Elem key={group}><Label><BlackCircle />{group}</Label></Elem>)
            })
            : null
          }
          </List>
          {regulatorySpecies.otherInfo &&
            <><SectionTitle>Mesures techniques</SectionTitle>
              {regulatorySpecies.otherInfo}
            </>
          }
        </Section>}
      </Content>
    </>)
  }, [regulatoryZoneMetadata, dispatch])

  return (
    <Wrapper
      healthcheckTextWarning={healthcheckTextWarning}
      regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}>
      {
        regulatoryZoneMetadata
          ? displayRegulatoryZoneMetadata()
          // eslint-disable-next-line react/forbid-component-props
          : <FingerprintSpinner color={COLORS.background} className={'radar'} size={100}/>
      }
    </Wrapper>
  )
}

const Label = styled.span``

const Mesh = styled.span`
  display: flex;
  flex-direction: row;
  margin-left: 10px;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  padding-bottom: 20px;
`

const Elem = styled.div`
  display: flex;
  flex-direction: column;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  font-weight: 500;
  padding: 15px 20px;
  text-align: left;
  border-bottom: 1px solid ${COLORS.lightGray};
`

const SectionTitle = styled.span`
  display: flex;
  flex-direction: row;
  color: ${COLORS.slateGray};
  font-size: 13px;
  align-items: center;
`

const Wrapper = styled.div`
  border-radius: 2px;
  width: 400px;
  display: block;
  color: ${COLORS.charcoal};
  opacity: ${props => props.regulatoryZoneMetadataPanelIsOpen ? 1 : 0};
  z-index: -1;
  padding: 0;
  transition: all 0.5s;
`

const RegulatoryZoneName = styled.span`
  flex: 1;
  line-height: initial;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
  margin-left: 5px;
  margin-right: 5px;
`

const Header = styled.div`
  color: ${COLORS.gunMetal};
  margin-left: 6px;
  text-align: left;
  height: 40px;
  display: flex;
  font-weight: 500;
  font-size: 15px;
  align-items: center;
  justify-content: center;
`

const Content = styled.div`
  border-radius: 2px;
  color: ${COLORS.lightGray};
  background: ${COLORS.background};
  overflow-y: auto;
  max-height: 72vh;
`

const Warning = styled.div`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  background: ${COLORS.orange};
  display: flex;
  text-align: left;
  font: normal normal bold 13px/18px Marianne;
  padding: 10px;
`

const WarningIcon = styled(AlertSVG)`
  width: 30px;
  flex: 57px;
  height: 30px;
  margin: 4px 10px 0px 0;
`

const REGPaperIcon = styled(REGPaperSVG)`
  margin-left: 3px;
  width: 25px;
`

const Body = styled.tbody``

const Zone = styled.div`
  margin: 0;
  padding: 10px 5px 9px 16px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid ${COLORS.lightGray};
`

const Fields = styled.table`
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  padding: unset;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
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

const Value = styled.td`
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-size: 13px;
  font-weight: 500;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
  font-size: 13px;
  display: block;
`

export default RegulatoryLayerZoneMetadata
