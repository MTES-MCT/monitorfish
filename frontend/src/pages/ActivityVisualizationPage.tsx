import { mainStore } from '@store'
import { Provider } from 'react-redux'
import { Outlet } from 'react-router-dom'

export function ActivityVisualizationPage() {
  return (
    <Provider store={mainStore}>
      <Outlet />
    </Provider>
  )
}
