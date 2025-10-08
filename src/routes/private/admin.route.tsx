import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import DashBoard from '@/pages/DashBoard'

const adminRoutes = (
  <>
    <Route path='dashboard' element={<DashBoard />} />
  </>
) as ReactElement

export default adminRoutes
