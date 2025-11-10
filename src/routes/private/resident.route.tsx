import type { ReactElement } from 'react'
import { Route } from 'react-router-dom'

import config from '@/config/config'
import { lazyLoad } from '@/utils/lazyLoad'

const residentRoutes = (
  <>
    <Route path={config.profilePath} element={lazyLoad(() => import('@/pages/Profile'))} />
    <Route path={config.postDetailUserPath} element={lazyLoad(() => import('@/pages/PostDetail/PostDetailResident'))} />
    <Route path={config.contactRequestPath} element={lazyLoad(() => import('@/pages/ContactRequest'))} />
  </>
) as ReactElement

export default residentRoutes