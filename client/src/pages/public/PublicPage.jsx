import React from 'react'
import { Outlet } from 'react-router-dom'
import { Footer, Header, TopHeader } from 'components'
import Navigation from 'components/Navigation/Navigation'

const PublicPage = () => {
    return (
        <div className='max-h-screen overflow-auto flex flex-col items-center'>
            <TopHeader />
            <Header />
            <Navigation />
            <div className='w-full flex items-center flex-col'>
                <Outlet />
            </div>
            <Footer />
        </div>

    )
}

export default PublicPage
