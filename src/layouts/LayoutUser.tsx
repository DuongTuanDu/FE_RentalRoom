import { Outlet } from 'react-router-dom'

import Header from './header/Header'
import Footer from './logo/LogoHeader'

const LayoutUser = () => {
  return (
    <div className='min-h-screen flex flex-col overflow-hidden'>
      <Header />
      <div className='flex-grow min-h-screen'>
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default LayoutUser
