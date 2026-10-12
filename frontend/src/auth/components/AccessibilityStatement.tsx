import styled from 'styled-components'

import { DsfrLayout } from './DsfrLayout'

export function AccessibilityStatement() {
  return (
    <DsfrLayout>
      <Main className="fr-container fr-py-6w" id="content">
        <h1>Déclaration d’accessibilité</h1>
        <p>Établie le 14 septembre 2026.</p>
        <p>
          Le ministère de la Transition écologique, de la Biodiversité et des Négociations internationales sur le climat
          et la nature s’engage à rendre son service accessible, conformément à l’article 47 de la loi n° 2005-102 du 11
          février 2005.
        </p>
        <p>
          Cette déclaration d’accessibilité s’applique à MonitorFish (
          <a href="https://monitorfish.din.developpement-durable.gouv.fr/">
            https://monitorfish.din.developpement-durable.gouv.fr/
          </a>
          ).
        </p>

        <h2>État de conformité</h2>
        <p>
          MonitorFish est <strong>non conforme</strong> avec le{' '}
          <abbr title="Référentiel général d’amélioration de l’accessibilité">RGAA</abbr>. Le site n’a encore pas été
          audité.
        </p>

        <h2>Amélioration et contact</h2>
        <p>
          Si vous n’arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable de
          MonitorFish pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme.
        </p>
        <ul>
          <li>
            E-mail : <a href="mailto:monitor@beta.gouv.fr">monitor@beta.gouv.fr</a>
          </li>
          <li>Adresse : 40 Av. Louis Bougo, 56410 Étel</li>
        </ul>
        <p>Nous essayons de répondre dans les 2 jours ouvrés.</p>

        <h2>Voie de recours</h2>
        <p>
          Cette procédure est à utiliser dans le cas suivant : vous avez signalé au responsable du site internet un
          défaut d’accessibilité qui vous empêche d’accéder à un contenu ou à un des services du portail et vous n’avez
          pas obtenu de réponse satisfaisante.
        </p>
        <p>Vous pouvez :</p>
        <ul>
          <li>
            Écrire un message au{' '}
            <a
              href="https://formulaire.defenseurdesdroits.fr/"
              rel="noopener noreferrer"
              target="_blank"
              title="Défenseur des droits - nouvelle fenêtre"
            >
              Défenseur des droits
            </a>
          </li>
          <li>
            Contacter{' '}
            <a
              href="https://www.defenseurdesdroits.fr/saisir/delegues"
              rel="noopener noreferrer"
              target="_blank"
              title="le délégué du Défenseur des droits dans votre région - nouvelle fenêtre"
            >
              le délégué du Défenseur des droits dans votre région
            </a>
          </li>
          <li>
            Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre) :
            <br />
            Défenseur des droits
            <br />
            Libre réponse 71120 75342 Paris CEDEX 07
          </li>
        </ul>

        <p className="fr-text--sm fr-mt-6w">
          Cette déclaration d’accessibilité a été créée le 14 septembre 2026 grâce au{' '}
          <a
            href="https://betagouv.github.io/a11y-generateur-declaration/#create"
            rel="noopener noreferrer"
            target="_blank"
            title="Générateur de Déclaration d’Accessibilité - nouvelle fenêtre"
          >
            Générateur de Déclaration d’Accessibilité
          </a>
          .
        </p>
      </Main>
    </DsfrLayout>
  )
}

const Main = styled.main`
  flex: 1 0 auto;
`
