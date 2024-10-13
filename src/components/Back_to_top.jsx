import React, { useEffect, useRef } from 'react'

function Back_to_top() {
  const topBtnRef = useRef(null);
  
  useEffect(() => {
    document.onscroll = () => {
      if (document.documentElement.scrollTop > 50) {
        topBtnRef.current.style.visibility='visible';
        topBtnRef.current.style.opacity='1';
      }
      else {
        topBtnRef.current.style.visibility='hidden';
        topBtnRef.current.style.opacity='0';
      }
    }
  }, [])


  return (
    <button onClick={() => {
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    }} ref={topBtnRef} style={{
      width: '0',
      aspectRatio: '1/1',
      minWidth: 'none',
      visibility: 'hidden',
      padding: '17px',
      borderRadius: '50%',
      position: 'absolute',
      bottom: '20px',
      right: '30px',
      border: 'none',
      zIndex: '300',
      fontSize: '25px',
    }} className='btns'><ion-icon name="arrow-up"></ion-icon></button>
  )
}

export default Back_to_top