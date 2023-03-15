/* eslint-disable no-console */

import { Component } from 'react'

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
  }
}
