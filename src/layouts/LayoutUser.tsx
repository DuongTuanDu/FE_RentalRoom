import { Outlet } from 'react-router-dom'

import Header from './header/Header'
import Footer from './logo/LogoHeader'

const LayoutUser = () => {
  return (
    <div className='min-h-screen flex flex-col overflow-x-hidden'>
      <Header />
      <div className='flex-grow min-h-screen px-4 lg:px-16 py-3 mt-16'>
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default LayoutUser
