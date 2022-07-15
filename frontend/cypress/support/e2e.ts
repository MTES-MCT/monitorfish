import './commands'
import 'cypress-mouse-position/commands'
import 'cypress-plugin-snapshots/commands'

declare global {
  namespace Cypress {
    interface Chainable {
      before(property: string): string
      cleanScreenshots(fromNumber: number): void
      clickButton(buttonText: string): Chainable<JQuery<HTMLButtonElement>>
      clickLink(linkText: string): Chainable<JQuery<HTMLAnchorElement>>
      clickOutside(): Chainable<JQuery<HTMLBodyElement>>
      fill(label: string, value: string): Chainable<Element>
    }
  }
}

type Position = {
  x: number
  y: number
}

const getCoords = ($el: JQuery<Element>) => {
  if (!$el[0]) {
    throw new Error('Failed to getCoords() of an undefined element.')
  }

  const domRect = $el[0].getBoundingClientRect()
  const coords = { x: domRect.left + (domRect.width / 2 || 0), y: domRect.top + (domRect.height / 2 || 0) }

  return coords
}

const dragTo = (subject: JQuery<Element>, toSelector: string, options: Partial<{
  /** delay inbetween steps */
  delay: number,
  /** interpolation between coords */
  steps: number,
  /** >=10 steps */
  smooth: number,
}> = {}) => {
  if (!subject[0]) {
    throw new Error('`subject[0]` is undefined.')
  }

  const config = {
    ...options,
    ...{
      delay: 0,
      steps: 5,
      smooth: false
    }
  }

  if (config.smooth) {
    config.steps = Math.max(config.steps, 10)
  }

  const win = subject[0].ownerDocument.defaultView
  if (!win) {
    throw new Error('`win` is null.')
  }

  const elFromCoords = (atPosition: Position): Element => {
    const foundElement = win.document.elementFromPoint(atPosition.x, atPosition.y)
    if (!foundElement) {
      throw new Error(`Failed to find element at coords ${JSON.stringify(atPosition)} using elementFromPoint().`)
    }

    return foundElement
  }
  const WindowMouseEvent = win.MouseEvent

  const send = (type: string, coords: Position, el?: Element): void => {
    // TODO Cannot use `??` because Node v12 instead of v16+
    const element = el || elFromCoords(coords)

    element.dispatchEvent(
      new WindowMouseEvent(type, Object.assign({}, { clientX: coords.x, clientY: coords.y }, { bubbles: true, cancelable: true }))
    )
  }

  function drag (fromPosition: Position, toPosition: Position, steps: number = 1): void {
    const fromEl = elFromCoords(fromPosition)

    const _log = Cypress.log({
      // TODO This should be wrapped to match jQuery type.
      $el: fromEl as any,
      name: 'drag to',
      message: toSelector
    })

    _log.snapshot('before', { next: 'after', at: 0 })
    // TODO Why this override? Does it work?
    _log.set({ coords: toPosition } as any)

    send('mouseover', fromPosition, fromEl)
    send('mousedown', fromPosition, fromEl)

    cy.then(() => {
      return Cypress.Promise.try(() => {
        if (steps === 0) {
          throw new Error('`steps` should not equal 0.')
        }

        const dx = (toPosition.x - fromPosition.x) / steps
        const dy = (toPosition.y - fromPosition.y) / steps

        return Cypress.Promise.map(Array(steps).fill(null), (_, i) => {
          i = steps - 1 - i

          const toPosition: Position = {
            x: fromPosition.x + dx * (i),
            y: fromPosition.y + dy * (i)
          }

          send('mousemove', toPosition, fromEl)

          return Cypress.Promise.delay(config.delay)
        }, { concurrency: 1 })
      })
        .then(() => {
          send('mousemove', toPosition, fromEl)
          send('mouseover', toPosition)
          send('mousemove', toPosition)
          send('mouseup', toPosition)
          _log.snapshot('after', {
            at: 1,
            next: ''
          }).end()
        })
    })
  }

  const $el = subject
  const fromCoords = getCoords($el)
  const toCoords = getCoords(cy.$$(toSelector))

  drag(fromCoords, toCoords, config.steps)
}

Cypress.Commands.addAll(
  { prevSubject: 'element' },
  {
    dragTo
  }
)
