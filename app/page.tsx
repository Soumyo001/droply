import { redirect } from 'next/navigation'
import React from 'react'

const Home = () => {
  redirect("/login")
}

export default Home