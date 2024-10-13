import React from 'react'
import '../component-styles/Showcase.scss'

function Showcase() {

  return (
    <>
    <div id="showcase">
      <div id='img-compare-wrapper' data-aos="fade-right">
        <div id="static-img-display">
          <span>Static image</span>
          <img src="/images/static-portrait.png" alt="static image of girl" />
        </div>
        <div id="live-img-display" data-aos="fade-left">
          <span>Live image</span>
          <img src="/images/live-portrait.gif" alt="live image of girl" />
        </div>
      </div>

      <div id="showcase-info">
        <h2>Transform your portraits</h2>
        <p>Experience the magic of turning your static images into dynamic, lifelike portraits. Bring your photos to life, by adding movement and emotion to your cherished memories.</p>
        </div>
    </div>
    </>
  )
}

export default Showcase