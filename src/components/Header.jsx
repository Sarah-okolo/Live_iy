import {useRef, useState, useEffect} from 'react'

import '../component-styles/Header.scss'

function Header() {
  const themeToggleBtnRef = useRef(null);
  const sliderRef = useRef(null);
  const logoImgRef = useRef(null);

   // Check if user has a saved theme preference, if not, set light mode as default. // true - light, false - dark
   const [isLightMode, setIsLightMode] = useState(() => {
    if (localStorage.getItem('userThemeChoice') === null) {
      localStorage.setItem('userThemeChoice', true);
      return true;
    }
    else {
      return localStorage.getItem('userThemeChoice') === 'true' ? true : false;
    }
  });
  
  // Save user's theme preference to local storage
  useEffect(() => {
    localStorage.setItem('userThemeChoice', isLightMode);
  }, [isLightMode])

   // On page load, set site theme based on user's currently saved theme.
   useEffect(() => {
    if (isLightMode) {
      sliderRef.current.classList.remove('slide');
      document.documentElement.classList.remove('dark-theme');
      logoImgRef.current.src = logoImgRef.current.src = '/images/Live-iy-logo-nobg.png';
    }
    else {
      sliderRef.current.classList.add('slide');
      document.documentElement.classList.add('dark-theme');
      logoImgRef.current.src = logoImgRef.current.src = '/images/Live-iy-logo-nobg-light.png';
    }
  }, []);

  function switchTheme() {
    document.documentElement.classList.toggle('dark-theme');
    logoImgRef.current.src = logoImgRef.current.src.includes('Live-iy-logo-nobg.png')
    ? '/images/Live-iy-logo-nobg-light.png'
    : '/images/Live-iy-logo-nobg.png';
    sliderRef.current.classList.toggle('slide');
    setIsLightMode(preVal => !preVal);
  }


  return (
    <>
      <header>
        <a href='/' id="logo">
          <img src="/images/Live-iy-logo-nobg.png" alt="live-iy logo" ref={logoImgRef}/>
          <span id='logo-name'>Live<span className='highlight'>_iy</span></span>
        </a>

        <div id="theme-toggle-btn" ref={themeToggleBtnRef} onClick={switchTheme}>
          <div className="slider" ref={sliderRef}></div>
        </div>
      </header>
    </>
  )
}

export default Header