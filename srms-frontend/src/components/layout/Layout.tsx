import React, { type ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:ml-0">{children}</main>
      </div>
    </div>
  )
}
