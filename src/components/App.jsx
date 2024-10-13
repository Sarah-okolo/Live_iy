import Footer from "./Footer"
import Header from "./Header"
import Home_page from "../pages/Home_page"
import Edit_img_page from "../pages/Edit_img_page"
import Back_to_top from '../components/Back_to_top'
import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  useEffect(() => {
    AOS.init();
  }, []);


  return (
    <BrowserRouter>
      <Header />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home_page />} />
          <Route path="/transform-image" element={<Edit_img_page />} />
        </Routes>
      </main>
      <Footer />
      <Back_to_top />
    </BrowserRouter>
  )
}

export default App