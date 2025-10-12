import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import DashboardLandlord from '@/pages/DashboardLandlord'
import BuildingManageLandlord from '@/pages/BuildingManageLandlord'
import RoomManageLandlord from '@/pages/RoomManageLandlord'
import FloorManageLandlord from '@/pages/FloorManageLandlord'

const landlordRoutes = (
  <>
    <Route path='dashboard' element={<DashboardLandlord />} />
    <Route path='buildings' element={<BuildingManageLandlord />} />
    <Route path='rooms' element={<RoomManageLandlord />} />
    <Route path='floors' element={<FloorManageLandlord />} />
  </>
) as ReactElement

export default landlordRoutes
