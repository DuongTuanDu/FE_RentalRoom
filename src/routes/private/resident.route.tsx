import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'
import ContactRequest from '@/pages/ContactRequest'
import MyAppointment from '@/pages/MyAppointment'

import config from '@/config/config'
import { lazyLoad } from '@/utils/lazyLoad'

const residentRoutes = (
  <>
    <Route path={config.profilePath} element={lazyLoad(() => import('@/pages/Profile'))} />
    <Route path={config.postDetailUserPath} element={lazyLoad(() => import('@/pages/PostDetail/PostDetailResident'))} />
    <Route path={config.contactRequestPath} element={lazyLoad(() => import('@/pages/ContactRequest'))} />
    <Route path="/resident/contact-requests" element={<ContactRequest />} />
    <Route path="/resident/my-appointments" element={<MyAppointment />} />
  </>
) as ReactElement

export default residentRoutes