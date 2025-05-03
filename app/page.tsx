"use client"

import { useEffect } from "react";
import LoginPage from "./auth/login/page";


export default function Home() {
  useEffect(()=>{
    localStorage.clear();
  },[])
  return (
    <>
    <LoginPage />
    </>
  )
}
