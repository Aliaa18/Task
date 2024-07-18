import React from 'react'
import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom'
import Layout from './Components/Layout/Layout'
import Home from './Components/Home/Home'
import NotFound from './Components/NotFound/NotFound'

const routers= createHashRouter(
  [
    {path:"/" , element: <Layout/> , children:[
      {index:true , element:<Home/>} ,
      {path:"home" , element : <Home/>},
      {path:"*" , element : <NotFound/>}
  ]}
  ])
export default function App() {

  return <>
    <RouterProvider router={routers} />
  </>
}



