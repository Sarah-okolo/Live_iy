import React from 'react'
import '../component-styles/CTA_section.scss'
import { Link } from 'react-router-dom'

function CTA_section() {
  return (
    <>
      <div id="cta-section" data-aos="zoom-in-up">
        <h2 className="cta-heading">Dont Miss Out!</h2>
        <p className="cta-text">Bring boring portraits to life with our innovative and creative solutions. Transform your photos into stunning works of art. Whether it's for personal or professional use, we've got you covered.</p>
        <Link to='/transform-image'><button className="cta-button btns">Get Started</button></Link>
      </div>
    </>
  )
}

export default CTA_section