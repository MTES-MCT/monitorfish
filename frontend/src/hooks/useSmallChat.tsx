import { isCypress } from '@utils/isCypress'
import { useEffect, useRef } from 'react'

const SMALLCHAT_SCRIPT_ID = 'smallchat-script'
const SMALLCHAT_SCRIPT_URL = '/proxy/scripts/smallchat.js'

export function useSmallChat() {
  const isFirstRenderRef = useRef(true)

  useEffect(() => {
    if (!isFirstRenderRef.current || isCypress()) {
      return
    }

    isFirstRenderRef.current = false

    const script = document.createElement('script')
    script.id = SMALLCHAT_SCRIPT_ID
    script.src = SMALLCHAT_SCRIPT_URL
    script.async = true
    script.defer = true

    document.body.appendChild(script)
  }, [])
}
