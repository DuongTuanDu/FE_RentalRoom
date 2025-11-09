import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import config from '@/config/config'
import Profile from '@/pages/Profile'
import PostDetailResident from '@/pages/PostDetail/PostDetailResident'
import ContactRequest from '@/pages/ContactRequest'
import MyAppointment from '@/pages/MyAppointment'

const residentRoutes = (
  <>
    <Route path={config.profilePath} element={<Profile />} />
    <Route path={config.postDetailUserPath} element={<PostDetailResident />} />
    <Route path={config.contactRequestPath} element={<ContactRequest />} />
    <Route path="/resident/contact-requests" element={<ContactRequest />} />
    <Route path="/resident/my-appointments" element={<MyAppointment />} />
  </>
) as ReactElement

export default residentRoutes
