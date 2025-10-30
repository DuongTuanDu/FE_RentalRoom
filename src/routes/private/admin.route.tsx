import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import DashBoard from '@/pages/DashBoard'
import BuildingManagement from '@/pages/BuildingManagement'
import ServiceManagement from '@/pages/ServiceManagement'
import AccountManagement from '@/pages/AccountManagement'

const adminRoutes = (
  <>
    <Route path='dashboard' element={<DashBoard />} />
    <Route path='buildings' element={<BuildingManagement />} />
    <Route path='package-services' element={<ServiceManagement />} />
    <Route path='account-management' element={<AccountManagement />} />
  </>
) as ReactElement

export default adminRoutes
  