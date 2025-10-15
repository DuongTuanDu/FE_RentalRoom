import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import config from '@/config/config'
import Profile from '@/pages/Profile'

const residentRoutes = (
  <>
    <Route path={config.profilePath} element={<Profile />} />
  </>
) as ReactElement

export default residentRoutes
