import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import DashboardLandlord from '@/pages/DashboardLandlord'
import BuildingManageLandlord from '@/pages/BuildingManageLandlord'

const landlordRoutes = (
  <>
    <Route path='dashboard' element={<DashboardLandlord />} />
    <Route path='buildings' element={<BuildingManageLandlord />} />
  </>
) as ReactElement

export default landlordRoutes
