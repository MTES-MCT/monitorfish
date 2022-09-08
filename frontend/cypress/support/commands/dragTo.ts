type Position = {
  x: number
  y: number
}

type ScopedWindow = Window & typeof globalThis

const getElementCenterPosition = (element: Element): Position => {
  const { height, left, top, width } = element.getBoundingClientRect()
  const position = { x: left + width / 2, y: top + height / 2 }

  return position
}

function triggerMouseEvent(window: ScopedWindow, element: Element, position: Position, type: string): void {
  element.dispatchEvent(
    new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: position.x, clientY: position.y })
  )
}

function drag({
  delay,
  draggedElement,
  fromPosition,
  log,
  steps,
  toPosition,
  window
}: {
  delay: number
  draggedElement: Element
  fromPosition: Position
  log: Cypress.Log
  steps: number
  toPosition: Position
  window: ScopedWindow
}): void {
  const perStepDeltaX = (toPosition.x - fromPosition.x) / steps
  const perStepDeltaY = (toPosition.y - fromPosition.y) / steps

  triggerMouseEvent(window, draggedElement, fromPosition, 'mouseover')
  triggerMouseEvent(window, draggedElement, fromPosition, 'mousedown')

  cy.then(() =>
    Cypress.Promise.try(() => {
      if (steps <= 1) {
        throw new Error('`steps` should be equal or greater than 1.')
      }

      // Cypress doesn't run promises in order, so we can't trust the internal array mapped index.
      let stepIndex = 0

      return Cypress.Promise.map(
        Array(steps).fill(true),
        () => {
          stepIndex += 1

          const toStepPosition: Position = {
            x: fromPosition.x + perStepDeltaX * stepIndex,
            y: fromPosition.y + perStepDeltaY * stepIndex
          }

          triggerMouseEvent(window, draggedElement, toStepPosition, 'mousemove')
          log.snapshot(`${Math.round((100 * stepIndex) / steps)}%`)

          return Cypress.Promise.delay(delay)
        },
        { concurrency: 1 }
      )
    }).then(() => {
      triggerMouseEvent(window, draggedElement, toPosition, 'mouseup')
    })
  )
}

Cypress.Commands.add(
  'dragTo',
  {
    prevSubject: 'element'
  },
  (
    prevSubject: JQuery<Element>,
    toSelector: string,
    options: Partial<{
      delay: number
      isSmooth: boolean
    }> = {}
  ) => {
    const { delay = 250, isSmooth = false } = options

    const draggedElement = prevSubject[0]
    if (!draggedElement) {
      throw new Error('`draggedElement` is undefined.')
    }

    const toElement = cy.$$(toSelector)[0]
    if (!toElement) {
      throw new Error('`toElement` is undefined.')
    }

    const window = draggedElement.ownerDocument.defaultView
    if (!window) {
      throw new Error('`window` is null.')
    }

    const fromPosition = getElementCenterPosition(draggedElement)
    const toPosition = getElementCenterPosition(toElement)
    const steps = isSmooth ? 10 : 5

    const log = Cypress.log({
      $el: prevSubject as JQuery<HTMLElement>,
      autoEnd: true,
      consoleProps: () => ({
        delay,
        fromPosition,
        steps,
        toPosition
      })
    }).snapshot('0%')

    drag({ delay, draggedElement, fromPosition, log, steps, toPosition, window })
  }
)
