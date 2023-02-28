/* eslint-disable no-console */

import { Component } from 'react'
import styled from 'styled-components'

import { FrontendError } from '../libs/FrontendError'

import type { ErrorInfo, ReactNode } from 'react'

export type FrontendErrorBoundaryProps = {
  children: ReactNode
}
export type FrontendErrorBoundaryState = {
  hasError: boolean
  isHandled: boolean
  message: string | undefined
  scope: string | undefined
}
export class FrontendErrorBoundary extends Component<FrontendErrorBoundaryProps, FrontendErrorBoundaryState> {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
      isHandled: false,
      message: undefined,
      scope: undefined
    }
  }

  static getDerivedStateFromError(error: any) {
    if (error instanceof FrontendError) {
      return {
        hasError: true,
        isHandled: true,
        message: error.message,
        scope: error.scope
      }
    }

    return {
      hasError: true,
      isHandled: false,
      message: String(error)
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO Add a log to Sentry?

    console.debug('[FrontendErrorBoundary]', 'error:', error)
    console.debug('[FrontendErrorBoundary]', 'errorInfo:', errorInfo)
  }

  override render() {
    const { children } = this.props
    // For the moment, we do not show any error message
    // TODO Should we remove that part ? We should not throw matrix-style error message
    //  to the user but fetch them from Sentry
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hasError, isHandled, message, scope } = this.state

    return children

    // For the moment, we do not show any error message
    // @ts-ignore
    return (
      <Wrapper>
        <p>Une erreur est survenue :</p>

        <code>
          {JSON.stringify(
            {
              isHandled,
              message,
              scope
            },
            null,
            2
          )}
        </code>
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  position: fixed;
  box-sizing: border-box;
  inset: 0px;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  color: rgb(232, 232, 232);
  padding: 2rem;
  overflow: auto;

  * {
    box-sizing: border-box;
  }

  > p {
    font-size: 18px;
    line-height: 1;
    margin: 0 0 32px 0;
  }

  > code {
    background-color: black;
    color: #00ff00;
    display: block;
    font-family: monospace;
    font-size: 18px;
    line-height: 1.5;
    margin-top: 1rem;
    padding: 1rem;
    white-space: pre-wrap;
    overflow: auto;
  }
`
