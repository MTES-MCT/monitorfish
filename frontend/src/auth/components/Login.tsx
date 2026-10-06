import '@gouvfr/dsfr/dist/dsfr.min.css'
import { BannerStack } from '@features/MainWindow/components/BannerStack'
import styled from 'styled-components'

const onConnect = () => {
  window.location.href = '/oauth2/authorization/proconnect'
}

export function Login() {
  const oidcEnabled = import.meta.env.FRONTEND_OIDC_ENABLED
  const oidcProvider = import.meta.env.FRONTEND_OIDC_LOGIN_BUTTON_PROVIDER

  if (!oidcEnabled) {
    return <div>OIDC is disabled</div>
  }

  return (
    <Wrapper>
      <header className="fr-header" role="banner">
        <div className="fr-header__body">
          <div className="fr-container">
            <div className="fr-header__body-row">
              <div className="fr-header__brand fr-enlarge-link">
                <div className="fr-header__brand-top">
                  <div className="fr-header__logo">
                    <MinistryLogo />
                  </div>
                </div>
                <div className="fr-header__service">
                  <p className="fr-header__service-title">MonitorFish</p>
                  <p className="fr-header__service-tagline">Améliorer le contrôle des activités des navires de pêche</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Main id="content">
        <div className="fr-container fr-py-10v">
          <div className="fr-grid-row fr-grid-row--center">
            <Card className="fr-col-12 fr-col-md-10 fr-col-lg-7 fr-p-4w fr-p-md-6w fr-mt-15w fr-mb-6w">
              <h1>Connexion à MonitorFish</h1>

              {oidcProvider === 'proconnect' ? (
                <div className="fr-connect-group">
                  <button
                    className="fr-connect fr-connect--pro"
                    onClick={onConnect}
                    title="S'identifier avec ProConnect"
                    type="button"
                  >
                    <span className="fr-connect__login">S’identifier avec</span>
                    <span className="fr-connect__brand">ProConnect</span>
                  </button>
                  <p>
                    <a
                      href="https://www.proconnect.gouv.fr/"
                      rel="noopener noreferrer"
                      target="_blank"
                      title="Qu’est-ce que ProConnect ? - nouvelle fenêtre"
                    >
                      Qu’est-ce que ProConnect ?
                    </a>
                  </p>
                </div>
              ) : (
                <button className="fr-btn" onClick={onConnect} title="S'identifier avec Cerbère" type="button">
                  S&apos;identifier avec Cerbère
                </button>
              )}
            </Card>
            <div className="fr-callout fr-mt-15w fr-mb-0">
              <p className="fr-callout__title">Vous accédez à une application réservée aux services de l&apos;Etat.</p>
              <p className="fr-callout__text fr-text--sm">
                Rappels législatifs : conformément à l&apos;art. L121-6 du Code de la fonction publique :
                &quot;l&apos;agent public est tenu au secret professionnel dans le respect des articles 226-13 et 226-14
                du code pénal&quot;. Conformément à l&apos;article 226-13 du Code pénal : &quot;La révélation d&apos;une
                information à caractère secret par une personne qui en est dépositaire est punie d&apos;un an
                d&apos;emprisonnement et de 15 000&euro; d&apos;amende&quot;.
              </p>
            </div>
          </div>
        </div>
      </Main>

      <footer className="fr-footer" id="footer" role="contentinfo">
        <div className="fr-container">
          <div className="fr-footer__body">
            <div className="fr-footer__brand">
              <MinistryLogo />
            </div>
            <div className="fr-footer__content">
              <p className="fr-footer__content-desc">Centre National de Surveillance des Pêches (CNSP)</p>
              <ul className="fr-footer__content-list">
                {['info.gouv.fr', 'service-public.fr', 'legifrance.gouv.fr', 'data.gouv.fr'].map(domain => (
                  <li key={domain} className="fr-footer__content-item">
                    <a
                      className="fr-footer__content-link"
                      href={`https://${domain}`}
                      rel="noopener external noreferrer"
                      target="_blank"
                      title={`${domain} - nouvelle fenêtre`}
                    >
                      {domain}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <BannerStack />
    </Wrapper>
  )
}

function MinistryLogo() {
  return (
    <p className="fr-logo">
      Ministère
      <br />
      chargé de la mer
      <br />
      et de la pêche
    </p>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const Main = styled.main`
  flex: 1 0 auto;
  background: url('landing_background.png') no-repeat center center;
  background-size: cover;
`

const Card = styled.div`
  background-color: var(--background-default-grey);
  text-align: center;

  .fr-callout {
    text-align: left;
  }
`
