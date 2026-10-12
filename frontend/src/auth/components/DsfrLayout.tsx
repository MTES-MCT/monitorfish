import '@gouvfr/dsfr/dist/dsfr.min.css'
import { ROUTER_PATHS } from 'paths'
import styled from 'styled-components'

import type { ReactNode } from 'react'

const FOOTER_DOMAINS = ['info.gouv.fr', 'service-public.fr', 'legifrance.gouv.fr', 'data.gouv.fr']

type DsfrLayoutProps = {
  children: ReactNode
}
export function DsfrLayout({ children }: DsfrLayoutProps) {
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
                  <a href={ROUTER_PATHS.login} title="Accueil - MonitorFish">
                    <p className="fr-header__service-title">MonitorFish</p>
                  </a>
                  <p className="fr-header__service-tagline">Améliorer le contrôle des activités des navires de pêche</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {children}

      <footer className="fr-footer" id="footer" role="contentinfo">
        <div className="fr-container">
          <div className="fr-footer__body">
            <div className="fr-footer__brand">
              <MinistryLogo />
            </div>
            <div className="fr-footer__content">
              <p className="fr-footer__content-desc">Centre National de Surveillance des Pêches (CNSP)</p>
              <ul className="fr-footer__content-list">
                {FOOTER_DOMAINS.map(domain => (
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
          <div className="fr-footer__bottom">
            <ul className="fr-footer__bottom-list">
              <li className="fr-footer__bottom-item">
                <a className="fr-footer__bottom-link" href={ROUTER_PATHS.accessibilityStatement}>
                  Accessibilité : non conforme
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
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
  height: 100vh;
  overflow-y: auto;
`
