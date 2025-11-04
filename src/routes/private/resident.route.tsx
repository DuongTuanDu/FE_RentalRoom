import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import config from '@/config/config'
import Profile from '@/pages/Profile'
import PostDetailResident from '@/pages/PostDetail/PostDetailResident'

const residentRoutes = (
  <>
    <Route path={config.profilePath} element={<Profile />} />
    <Route path={config.postDetailUserPath} element={<PostDetailResident />} />
  </>
) as ReactElement

export default residentRoutes
