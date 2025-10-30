import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import DashboardLandlord from '@/pages/DashboardLandlord'
import BuildingManageLandlord from '@/pages/BuildingManageLandlord'
import RoomManageLandlord from '@/pages/RoomManageLandlord'
import FloorManageLandlord from '@/pages/FloorManageLandlord'
import ServiceManageLandlord from '@/pages/ServiceManageLandlord'
import FurnitureManageLandlord from '@/pages/FurnitureManageLandlord'
import BuildingFurnitureLandlord from '@/pages/BuildingFurnitureLandlord'
import RoomFurnitureLandlord from '@/pages/RoomFurnitureLandlord'
import RegulationManageLandlord from '@/pages/RegulationManageLandlord'
import BuildingServiceManageLandlord from '@/pages/BuildingServiceManageLandlord'
import PostManageLandlord from '@/pages/PostManageLandlord'
import PaymentSuccess from '@/pages/PaymentSubscription'
import HistorySubscription from '@/pages/HistorySubscription'
import ProfileLandlord from '@/pages/ProfileLandlord'
import SettingLandlord from '@/pages/SettingLandlord'
import PostDetail from '@/pages/PostDetail'

const landlordRoutes = (
  <>
    <Route path='dashboard' element={<DashboardLandlord />} />
    <Route path='buildings' element={<BuildingManageLandlord />} />
    <Route path='rooms' element={<RoomManageLandlord />} />
    <Route path='floors' element={<FloorManageLandlord />} />
    <Route path='package-services' element={<ServiceManageLandlord />} />
    <Route path='furnitures' element={<FurnitureManageLandlord />} />
    <Route path='building-furniture' element={<BuildingFurnitureLandlord />} />
    <Route path='room-furniture' element={<RoomFurnitureLandlord />} />
    <Route path='regulations' element={<RegulationManageLandlord />} />
    <Route path='building-services' element={<BuildingServiceManageLandlord />} />
    <Route path='posts' element={<PostManageLandlord />} />
    <Route path='posts/:slug' element={<PostDetail />} />
    <Route path='payment-success' element={<PaymentSuccess />} />
    <Route path='history-subscription' element={<HistorySubscription />} />
    <Route path='profile' element={<ProfileLandlord />} />
    <Route path='settings' element={<SettingLandlord />} />
  </>
) as ReactElement

export default landlordRoutes
