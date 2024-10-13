import React from 'react'
import '../component-styles/Hero.scss'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <>
    <div id="hero-section">
      <div className='alert-box'>An error occured</div>
      <div className="hero-content glass-effect">
        <h1 id='hero-heading'>Bring your static portraits<br/>to life</h1>
        <Link to='/transform-image'><button className='btns'>Upload Image</button></Link>
      </div>
    </div>
    </>
  )
}

export default Hero