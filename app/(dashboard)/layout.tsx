import React from 'react'
import Header from '@/components/header'
import DashboardTabbar from '@/components/dashboard-tabbar'

const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className='w-full flex flex-col px-7.5'>
        <Header/>
        <DashboardTabbar/>
        <div className='flex-1 overflow-hidden py-10'>
            {children}
        </div>
    </div>
  )
}

export default Layout