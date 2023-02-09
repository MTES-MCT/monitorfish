import { FormikMultiRadio } from '@mtes-mct/monitor-ui'
// import ReactMarkdown from 'react-markdown'

import { FormikMultiInfractionPicker } from './FormikMultiInfractionPicker'
import { MissionAction } from '../../../../../domain/types/missionAction'

export function LicencesAndLogbookField() {
  return (
    <FormikMultiInfractionPicker
      addButtonLabel="Ajouter une infraction obligations déclaratives / autorisations"
      generalObservationTextareaProps={{
        label: 'Observations (hors infractions) sur les obligations déclaratives / autorisations',
        name: 'licencesAndLogbookObservations'
      }}
      label="Obligations déclaratives et autorisations de pêche"
      name="logbookInfractions"
    >
      <FormikMultiRadio
        isInline
        label="Bonne émission VMS"
        name="emitsVms"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />
      <FormikMultiRadio
        isInline
        label="Bonne émission AIS"
        name="emitsAis"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />
      <FormikMultiRadio
        isInline
        label="Déclarations journal de pêche conformes à l'activité du navire"
        name="logbookMatchesActivity"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />
      <FormikMultiRadio
        isInline
        label="Autorisations de pêche conformes à l'activité du navire (zone, engins, espèces)"
        name="licencesMatchActivity"
        options={[
          { label: 'Oui', value: MissionAction.ControlCheck.YES },
          { label: 'Non', value: MissionAction.ControlCheck.NO },
          { label: 'Non concerné', value: MissionAction.ControlCheck.NOT_APPLICABLE }
        ]}
      />

      {/* <Button accent={Accent.SECONDARY} Icon={Icon.Plus} isFullWidth onClick={addLogbookInfraction}>
        Ajouter une infraction obligations déclaratives / autorisations
      </Button> */}

      {/* {logbookInfractions && logbookInfractions.length > 0 && (
        <LogbookInfractionWrapper>
          {logbookInfractions.map((logbookInfraction, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={`logbookInfraction-${index}`}>
              <FieldsetGroupSeparator />

              <Legend>Infraction obligations déclaratives et autorisations {index + 1}</Legend>

              {index !== editedIndex && (
                <LogbookInfractionInnerWrapper>
                  <div>
                    <TagGroup>
                      <Tag accent={Accent.PRIMARY}>{logbookInfraction.infractionType}</Tag>
                      <Tag accent={Accent.PRIMARY}>{logbookInfraction.natinf}</Tag>
                    </TagGroup>

                    <div>
                      <IconButton
                        accent={Accent.SECONDARY}
                        Icon={Icon.Edit}
                        onClick={() => setEditedIndex(index)}
                        style={{ marginRight: '8px' }}
                      />
                      <IconButton
                        accent={Accent.SECONDARY}
                        color={THEME.color.chineseRed}
                        Icon={Icon.Delete}
                        onClick={() => removeLogbookInfraction(index)}
                      />
                    </div>
                  </div>

                  <article>
                    <ReactMarkdown>{logbookInfraction.comments}</ReactMarkdown>
                  </article>
                </LogbookInfractionInnerWrapper>
              )}

              {index === editedIndex && (
                <LogbookInfractionFormWrapper>
                  <FormikMultiRadio
                    isInline
                    label="Type d'infraction"
                    name={`compliance.customInfractions[${index}].type`}
                    options={[
                      { label: 'Avec PV', value: 'Avec PV' },
                      { label: 'Sans PV', value: 'Sans PV' },
                      { label: 'En attente', value: 'En attente' }
                    ]}
                  />
                  <FormikMultiSelect
                    baseContainer={newWindowContainerRef.current}
                    fixedWidth={460}
                    label="NATINF"
                    name={`compliance.customInfractions[${index}].natinfs`}
                    options={[
                      { label: 'NATINF 1', value: 'NATINF 1' },
                      { label: 'NATINF 2', value: 'NATINF 2' },
                      { label: 'NATINF 3', value: 'NATINF 3' },
                      { label: 'NATINF 4', value: 'NATINF 4' },
                      { label: 'NATINF 5', value: 'NATINF 5' },
                      { label: 'NATINF 6', value: 'NATINF 6' },
                      { label: 'NATINF 7', value: 'NATINF 7' },
                      { label: 'NATINF 8', value: 'NATINF 8' },
                      { label: 'NATINF 9', value: 'NATINF 9' }
                    ]}
                  />
                  <FormikTextarea
                    label="Observations sur l'infraction"
                    name={`compliance.customInfractions[${index}].note`}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button accent={Accent.TERTIARY} onClick={cancelLogbookInfractionEdition}>
                      Annuler
                    </Button>
                    <Button accent={Accent.PRIMARY} onClick={() => setEditedIndex(undefined)}>
                      {`${isEditedIndexNew ? 'Ajouter' : 'Modifier'} l’infraction`}
                    </Button>
                  </div>
                </LogbookInfractionFormWrapper>
              )}
            </Fragment>
          ))}
        </LogbookInfractionWrapper>
      )} */}

      {/* <FieldsetGroupSeparator />

      <FormikTextarea
        label="Observations (hors infractions) sur les obligations déclaratives / autorisations"
        name="licencesAndLogbookObservations"
      /> */}
    </FormikMultiInfractionPicker>
  )
}
