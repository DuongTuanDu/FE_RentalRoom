import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import DashBoard from '@/pages/DashBoard'
import BuildingManagement from '@/pages/BuildingManagement'

const adminRoutes = (
  <>
    <Route path='dashboard' element={<DashBoard />} />
    <Route path='buildings' element={<BuildingManagement />} />
  </>
) as ReactElement

export default adminRoutes
