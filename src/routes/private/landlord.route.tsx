import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'
import { lazyLoad } from '@/utils/lazyLoad'

const landlordRoutes = (
  <>
    <Route path='dashboard' element={lazyLoad(() => import('@/pages/DashboardLandlord'))} />
    <Route path='buildings' element={lazyLoad(() => import('@/pages/BuildingManageLandlord'))} />
    <Route path='rooms' element={lazyLoad(() => import('@/pages/RoomManageLandlord'))} />
    <Route path='floors' element={lazyLoad(() => import('@/pages/FloorManageLandlord'))} />
    <Route path='package-services' element={lazyLoad(() => import('@/pages/ServiceManageLandlord'))} />
    <Route path='furnitures' element={lazyLoad(() => import('@/pages/FurnitureManageLandlord'))} />
    <Route path='building-furniture' element={lazyLoad(() => import('@/pages/BuildingFurnitureLandlord'))} />
    <Route path='room-furniture' element={lazyLoad(() => import('@/pages/RoomFurnitureLandlord'))} />
    <Route path='regulations' element={lazyLoad(() => import('@/pages/RegulationManageLandlord'))} />
    <Route path='building-services' element={lazyLoad(() => import('@/pages/BuildingServiceManageLandlord'))} />
    <Route path='posts' element={lazyLoad(() => import('@/pages/PostManageLandlord'))} />
    <Route path='posts/:slug' element={lazyLoad(() => import('@/pages/PostDetail'))} />
    <Route path='payment-success' element={lazyLoad(() => import('@/pages/PaymentSubscription'))} />
    <Route path='history-subscription' element={lazyLoad(() => import('@/pages/HistorySubscription'))} />
    <Route path='profile' element={lazyLoad(() => import('@/pages/ProfileLandlord'))} />
    <Route path='settings' element={lazyLoad(() => import('@/pages/SettingLandlord'))} />
    <Route path='terms' element={lazyLoad(() => import('@/pages/TermManagement'))} />
    <Route path='contracts-template' element={lazyLoad(() => import('@/pages/ContractTemplateManagement'))} />
    <Route path='contact-management' element={lazyLoad(() => import('@/pages/ContactManageLandlord/ContactManageLandlord'))} />
    <Route path='maintenance' element={lazyLoad(() => import('@/pages/MaintenanceManagement'))} />
    <Route path='availability-management' element={lazyLoad(() => import('@/pages/AvailabilityManageLandlord'))} />
    <Route path='appointment-management' element={lazyLoad(() => import('@/pages/AppointmentManageLandlord'))} />
    <Route path='revenues' element={lazyLoad(() => import('@/pages/RevenueManagement'))} />
    <Route path='contracts' element={lazyLoad(() => import('@/pages/ContractManagement'))} />
    <Route path='staff-management' element={lazyLoad(() => import('@/pages/StaffManagementLandlord'))} />
    <Route path='staff-detail' element={lazyLoad(() => import('@/pages/StaffManagementLandlord/components/ModalStaffDetail'))} />
    <Route path='notifications' element={lazyLoad(() => import('@/pages/NotificationManageLandlord'))} />
    <Route path='invoices' element={lazyLoad(() => import('@/pages/InvoiceManagement'))} />
    <Route path='utilities' element={lazyLoad(() => import('@/pages/UtilityManagement'))} />
  </>
) as ReactElement

export default landlordRoutes