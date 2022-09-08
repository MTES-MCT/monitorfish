import { forwardRef, KeyboardEvent, useCallback, useImperativeHandle, useRef } from 'react'
import styled from 'styled-components'

import type { FocusEvent, ForwardedRef, InputHTMLAttributes, MouseEvent, MutableRefObject } from 'react'
import type { Promisable } from 'type-fest'

export type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'maxLength' | 'onInput' | 'pattern' | 'type'
> & {
  max: number
  min: number
  /** Called when the use press backspace key while the input is empty. */
  onBack?: () => Promisable<void>
  /** Called when the input value reaches the size property. */
  onFilled?: () => Promisable<void>
  onFormatError: (hasNextFormatError: boolean) => Promisable<void>
  onInput?: (nextValue: string) => Promisable<void>
  /** Called when the right arrow is pressed while the cursor is positionned at the input end. */
  onNext?: () => Promisable<void>
  /** Called when the left arrow is pressed while the cursor is positionned at the input start. */
  onPrevious?: () => Promisable<void>
  size: number
}
function NumberInputWithRef(
  {
    defaultValue,
    max,
    min,
    onBack,
    onClick,
    onFilled,
    onFocus,
    onFormatError,
    onInput,
    onNext,
    onPrevious,
    size,
    ...nativeProps
  }: NumberInputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const inputRef = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

  const handleClick = useCallback(
    (event: MouseEvent<HTMLInputElement>) => {
      // event.stopPropagation()

      if (onClick) {
        onClick(event)
      }
    },
    [onClick]
  )

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      inputRef.current.select()

      if (onFocus) {
        onFocus(event)
      }
    },
    [onFocus]
  )

  const handleInput = useCallback(() => {
    onFormatError(false)

    const { value } = inputRef.current
    if (onInput) {
      onInput(value)
    }
    if (value.length !== size) {
      return
    }

    const valueAsNumber = Number(inputRef.current.value)
    if (Number.isNaN(valueAsNumber) || valueAsNumber < min || valueAsNumber > max) {
      onFormatError(true)

      return
    }

    if (onFilled && value.length === size) {
      onFilled()
    }
  }, [max, min, onFilled, onFormatError, onInput, size])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (
        onPrevious &&
        event.key === 'ArrowLeft' &&
        inputRef.current.selectionStart === 0 &&
        // We don't want to call that function when the user is selecting the input text
        inputRef.current.selectionEnd === inputRef.current.selectionStart
      ) {
        event.preventDefault()

        onPrevious()

        return
      }

      if (
        onNext &&
        event.key === 'ArrowRight' &&
        inputRef.current.selectionStart === inputRef.current.value.length &&
        // We don't want to call that function when the user is selecting the input text
        inputRef.current.selectionEnd === inputRef.current.selectionStart
      ) {
        event.preventDefault()

        onNext()

        return
      }

      if (onBack && event.key === 'Backspace' && !inputRef.current.value.length) {
        event.preventDefault()

        onBack()
      }
    },
    [onBack, onNext, onPrevious]
  )

  return (
    <StyledNumberInput
      key={String(defaultValue)}
      ref={inputRef}
      defaultValue={defaultValue}
      maxLength={size}
      onClick={handleClick}
      onFocus={handleFocus}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      pattern="\d*"
      size={size}
      type="text"
      {...nativeProps}
    />
  )
}

export const NumberInput = forwardRef(NumberInputWithRef)

const StyledNumberInput = styled.input<{
  size: number
}>`
  background-color: transparent;
  border: 0;
  font-size: inherit;
  outline: none;
  padding: 0;
  text-align: center;
  /* 1 digit = 0.5rem */
  width: ${p => p.size * 0.5}rem;
`
