import { useEffect, useRef, useState } from 'react';
import '../component-styles/Edit_img_page.scss';
import { PinataSDK } from "pinata";
import { i, p, s, u } from 'framer-motion/client';


function Edit_img_page() {
  // State to store the file data
  const [fileData, setFileData] = useState(null);
  const [refVideoData, setRefVideoData] = useState(null);
  const [isRdmVidLoading, setIsRdmVidLoading] = useState(false);
  const [isImgFileLoading, setIsImgFileLoading] = useState(false);
  const [livePortraitData, setLivePortraitData] = useState(null);
  const [uploadedImgUrl, setuploadedImgUrl] = useState(null);
  const [uploadedRefVideoUrl, setuploadedRefVideoUrl] = useState(null);

  const uploadContainerRef = useRef(null);
  const editContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragAndDropBoxRef = useRef(null);
  const selectFromFolderRef = useRef(null);
  const imageFileDisplay = useRef(null);
  const alertBox = useRef(null);
  const generatingLoaderRef = useRef(null);
  const refVideoInputRef = useRef(null);
  const refvideoRef = useRef(null);
  const refVidContRef = useRef(null);
  const LivePortraitContRef = useRef(null);
  const liveVidDisplayRef = useRef(null);
  const downloadLiveVidRef = useRef(null);

  const randomRefVideos = [
    '/ref_videos/ref-vid1.mp4',
    '/ref_videos/ref-vid3.mp4',
    '/ref_videos/ref-vid4.mp4',
    '/ref_videos/ref-vid5.mp4',
    '/ref_videos/ref-vid6.mp4',
    '/ref_videos/ref-vid7.mp4',
    '/ref_videos/ref-vid8.mp4',
  ];

  const uploadNewImage = () => {
    uploadContainerRef.current.style.display = 'block';
    setFileData(null); // Clear the file data
    generatingLoaderRef.current.style.display = "none";
  };

  const handleFileChange = (event) => {
    setFileData(event.target.files[0]); // Store the selected file in state
  };

  useEffect(() => {
    alertBox.current.classList.remove('reveal');
    const uploadFile = async () => {
      if (fileData) {
        const imageCID = await handleFileUploadToPinata(fileData); // Await the promise
        setuploadedImgUrl(imageCID); // Store the uploaded image URL
      }
    };
    uploadFile(); // Call the inner async function
  }, [fileData]);

  useEffect(() => {
    if (uploadedImgUrl) {
      imageFileDisplay.current.src = URL.createObjectURL(fileData);
      imageFileDisplay.current.alt = fileData.name;
    }
  }, [uploadedImgUrl]);

  useEffect(() => {
    // Fires when dragging over the dropbox
    const handleDragOver = (event) => {
      event.preventDefault();
    };

    // Fires when dropping a file on the dropbox
    const handleDrop = (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      const validFileTypes = ['image/png', 'image/jpeg', 'image/jpg']; // Valid file type (.png, .jpg, .jpeg)
      if (file && validFileTypes.includes(file.type)) {
        setFileData(file); // Store the dragged file in state
      } else {
        alertBox.current.innerHTML = 'Invalid file type (jpg, png, jpeg only)';
        alertBox.current.classList.add('reveal');
        alertBox.current.style.backgroundColor = 'hsl(356, 58%, 52%)';
        setTimeout(() => {
          alertBox.current.classList.remove('reveal');
        }, 5000);
      }
    };

    // Fires when dragging of file starts
    const handleDragStart = (event) => {
      const file = event.dataTransfer.files[0];
      // Creates a temporary image preview while dragging
      if (file) {
        const previewImg = new Image();
        previewImg.src = URL.createObjectURL(file);  // Use the temporary URL of the image
        previewImg.onload = () => {
          event.dataTransfer.setDragImage(previewImg, 0, 0);  // Set the image as the drag preview
        };
      }
    };

    // Add event listeners to the dragging and dropping on the dropbox
    const dropBox = dragAndDropBoxRef.current;
    dropBox.addEventListener('dragover', handleDragOver);
    dropBox.addEventListener('drop', handleDrop);
    dropBox.addEventListener('dragstart', handleDragStart);

    // Cleans up the event listeners on unmount
    return () => {
      dropBox.removeEventListener('dragover', handleDragOver);
      dropBox.removeEventListener('drop', handleDrop);
      dropBox.removeEventListener('dragstart', handleDragStart); // Clean up dragstart listener
    };
  }, []);

  // Pinata SDK
  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
  });

  // Handles uploading of files to Pinata
  const handleFileUploadToPinata = async (file) => {
    setIsImgFileLoading(true);
    try {
      const upload = await pinata.upload.file(file);
      // Create a signed URL for the uploaded file that expires after 30 minutes
      const signedUrl = await pinata.gateways.createSignedURL({
        cid: upload.cid,
        expires: 1800
      })
      const CID = signedUrl;
      console.log(CID)

      alertBox.current.innerHTML = 'File uploaded';
      alertBox.current.classList.add('reveal');
      alertBox.current.style.backgroundColor = 'hsl(163, 72%, 41%)';
      setTimeout(() => {
        alertBox.current.classList.remove('reveal');
      }, 4000);
      setIsImgFileLoading(false);
      setIsRdmVidLoading(false);
      uploadContainerRef.current.style.display = 'none';

      return CID;
    } 
    catch (error) {
      alertBox.current.innerHTML = error.message ? error.message : `An error occured<br/>(Please try again)`;
      alertBox.current.classList.add('reveal');
      alertBox.current.style.backgroundColor = 'hsl(356, 58%, 52%)';
      console.log(error)
      setIsImgFileLoading(false);
      setIsRdmVidLoading(false);
    }
  }

  // Segmind API
  const segmind_api_key = import.meta.env.VITE_SEGMIND_API_KEY;
  const segmind_url = "https://api.segmind.com/v1/live-portrait";
  const segmind_options = {
    method: 'POST',
    headers: {
      'x-api-key': segmind_api_key,
      'Content-Type': 'application/json'
    },
    body: null
  };

  // Generates the live image from the static image and reference video file urls using the Segmind API
  const generateLiveImage = async () => {
    alertBox.current.classList.remove('reveal');
    if (uploadedImgUrl && uploadedRefVideoUrl) {
      generatingLoaderRef.current.style.display = 'block';
      try {
        // Converts the static image to base64
        async function toB64(imgUrl) {
          const response = await fetch(imgUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          return new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }


        // Proxy the pinata files url to my node server to avoid CORS issues
        const videoProxyUrl = `https://live-iy-node-server.vercel.app/proxy-file?url=${encodeURIComponent(uploadedRefVideoUrl)}`;
        const imageProxyUrl = `https://live-iy-node-server.vercel.app/proxy-file?url=${encodeURIComponent(uploadedImgUrl)}`;
        const faceImageBase64 = await toB64(imageProxyUrl);

        const data = {
          "face_image": faceImageBase64,
          "driving_video": videoProxyUrl,
          "live_portrait_dsize": 512,
          "live_portrait_scale": 2.3,
          "video_frame_load_cap": 128,
          "live_portrait_lip_zero": true,
          "live_portrait_relative": true,
          "live_portrait_vx_ratio": 0,
          "live_portrait_vy_ratio": -0.12,
          "live_portrait_stitching": true,
          "video_select_every_n_frames": 1,
          "live_portrait_eye_retargeting": false,
          "live_portrait_lip_retargeting": false,
          "live_portrait_lip_retargeting_multiplier": 1,
          "live_portrait_eyes_retargeting_multiplier": 1
        };
        segmind_options.body = JSON.stringify(data);

        const response = await fetch(segmind_url, segmind_options);
        if (!response.ok) {
          if (response.status === 500) {
            throw new Error('Face not detected<br/>(Ensure files have a clear face)');
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.blob();
        setLivePortraitData(result);
        console.log(result);
        generatingLoaderRef.current.style.display = 'none';

      } catch (error) {
        alertBox.current.innerHTML = error.message ? error.message : `An error occured<br/>(Try again later)`;
        alertBox.current.classList.add('reveal');
        alertBox.current.style.backgroundColor = 'hsl(356, 58%, 52%)';
        generatingLoaderRef.current.style.display = 'none';
        console.log(error)
      }
    } else {
      alertBox.current.innerHTML = 'Please select a reference video';
      alertBox.current.classList.add('reveal');
      alertBox.current.style.backgroundColor = 'hsl(356, 58%, 52%)';
      setTimeout(() => {
        alertBox.current.classList.remove('reveal');
      }, 4000);
    }
  };

  // Display the live portrait video when the livePortraitData state changes
  useEffect(() => {
    if (livePortraitData) {
      liveVidDisplayRef.current.src = URL.createObjectURL(livePortraitData);
      LivePortraitContRef.current.style.display = 'block';
    }
  }, [livePortraitData]);


  // Handles the reference video upload or change
  const handleRefVideoChange = (event) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (event.target.files[0].size <= MAX_FILE_SIZE) {
      setRefVideoData(event.target.files[0]); // Store the selected file in state
    }
    else {
      event.target.value = ""; // Clear the file input
      alertBox.current.innerHTML = 'File size exceeds 5MB';
      alertBox.current.classList.add('reveal');
      alertBox.current.style.backgroundColor = 'hsl(356, 58%, 52%)';
      setTimeout(() => {
        alertBox.current.classList.remove('reveal');
      }, 4000);
      return;
    }
  };


  // Updates the reference video when a new video is selected and uploads it to Pinata
  useEffect(() => {
    alertBox.current.classList.remove('reveal');
    if (refVideoData) {
      setIsRdmVidLoading(true);
      const uploadRefVid = async () => {
        const refVidCID = await handleFileUploadToPinata(refVideoData);
        setuploadedRefVideoUrl(refVidCID); // Store the uploaded reference video URL
      };
      uploadRefVid();
    }
  }, [refVideoData]);

  // Display the reference video when the uploadedRefVideoUrl state changes
  useEffect(() => {
    if (uploadedRefVideoUrl) {
      console.log(uploadedRefVideoUrl);
      // Display the reference video only after it has been uploaded
      refvideoRef.current.src = URL.createObjectURL(refVideoData);
      refVidContRef.current.style.display = 'block';
      setIsRdmVidLoading(false);
    }
  }, [uploadedRefVideoUrl]);


  // Generates a random reference video
  const generateRandomVid = (e) => {
    setIsRdmVidLoading(true);
    try {
      const randomVid = randomRefVideos[Math.floor(Math.random() * randomRefVideos.length)];
      // Fetch the file as a Blob, then convert it into a File object
      fetch(randomVid)
      .then(res => res.blob())
      .then(blob => {
        const randomVidFileObject = new File([blob], randomVid.split('/').pop(), { type: blob.type });
        setRefVideoData(randomVidFileObject); // Update state with the random video URL
      })
      .catch(error => console.error('Error:', error))
    } 
    catch (error) {
      alertBox.current.innerHTML = error.message;
      alertBox.current.classList.add('reveal');
      alertBox.current.style.backgroundColor = 'hsl(356, 58%, 52%)';
      setIsRdmVidLoading(false);
    }
  };

  const handleDownload = () => {
    const videoElement = liveVidDisplayRef.current; // Get the video element
    if (videoElement) {
      const videoSrc = videoElement.src; // Get the source of the video
      if (videoSrc) {
        const a = document.createElement('a');
        a.href = videoSrc; // Set the href to the video source
        console.log(videoSrc);
        a.download = 'live_portrait_video.mp4'; // Specify the default filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alertBox.current.innerHTML = 'File downloaded successfully';
        alertBox.current.classList.add('reveal');
        alertBox.current.style.backgroundColor = 'hsl(163, 72%, 41%)';
        setTimeout(() => {
          alertBox.current.classList.remove('reveal');
        }, 3000);
      }
      LivePortraitContRef.current.style.display = 'none'; // Hide the video container
    }
  };


  return (
    <>
      <div id="edit-img-page">
        <div className="alert-box" ref={alertBox}></div>
        <div id="edit-container" ref={editContainerRef}>
          <h2>Transform Image</h2>
          <div id="edit-container-wrapper">
            <div id="image-transform-container">
              <button className="new-img-btn" onClick={uploadNewImage}>Upload new image <ion-icon name="cloud-upload-outline"></ion-icon></button>
              <div id="image-diff-wrapper">
                <div id="generating-loader" ref={generatingLoaderRef}>
                  <p>Please wait<br />the magic is happening...</p>
                </div>
                <img src="" alt="" ref={imageFileDisplay} />
              </div>
              <div id="transform-btn-wrapper">
                <button className="btns to-life-btn" onClick={generateLiveImage}>Transform</button>
              </div>
            </div>

            <div id="properties-container">
              <input
                type="file"
                accept="video/mp4, video/webm, video/ogg"
                ref={refVideoInputRef} 
                style={{ display: 'none' }} 
                onChange={handleRefVideoChange}
              />
              <div id="reference-video-container" ref={refVidContRef}>
                { uploadedRefVideoUrl ?
                  <>
                    <h3 id='rev-vid-h'>Reference Video</h3>
                    <video src="" controls muted loop autoPlay id='ref-video' ref={refvideoRef}></video>
                    <button className='other-btn chng-vid' onClick={() => refVideoInputRef.current.click()}>
                      {isRdmVidLoading ? <div className='loading-icon'></div> : <>Change video</>}
                    </button>
                    <p id='ref-vid-p'>or</p>
                    <button className="other-btn upld-btn genbtn" onClick={(e) => generateRandomVid(e)}>
                      {isRdmVidLoading ? <div className='loading-icon'></div> : <>Generate random <ion-icon name="shuffle-outline"></ion-icon></>}
                    </button>
                  </>
                  :
                  <>
                    <h3>Select Reference video</h3>
                    <button className="other-btn upld-btn genbtn" onClick={() => refVideoInputRef.current.click()}>
                      {isRdmVidLoading ? <div className='loading-icon'></div> : <>Upload Video <ion-icon name="cloud-upload-outline"></ion-icon></>}
                    </button>
                    <p>or</p>
                    <button className='other-btn' onClick={(e) => generateRandomVid(e)}> 
                      {isRdmVidLoading ? <div className='loading-icon'></div> : <>Generate random <ion-icon name="shuffle-outline"></ion-icon></>}
                    </button>
                  </>
                }
              </div>

              
            </div>
          </div>
        </div>


        <div className="display-live-portrait upload-container" ref={LivePortraitContRef}>
          <h2>Your live portrait is readyyy!</h2>
          <div id="live-portrait-wrapper">
            <video src="" controls autoPlay loop muted id='live-portrait' ref={liveVidDisplayRef}></video>
          </div>
          <button className='btns' ref={downloadLiveVidRef} onClick={handleDownload}>Download <ion-icon name="download-outline"></ion-icon></button>
        </div>


        <div className="upload-container" ref={uploadContainerRef}>
          <h2>Upload Image</h2>
          <div id="upload-wrapper">
            <div className="drag-drop-box">
              <div className="glass-wrapper" ref={dragAndDropBoxRef}>
                <ion-icon name="cloud-upload-outline"></ion-icon>
                <h3>Drag and drop</h3>
                <p>( 1 file at a time )</p>
              </div>
            </div>
            <p>Or</p>

            <input 
              type="file" 
              accept=".png, .jpg, .jpeg"
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <button 
              className="btns upload-image-btn" 
              onClick={() => fileInputRef.current.click()}
              ref={selectFromFolderRef}
            >
              {isImgFileLoading ? <div className='loading-icon'></div> : <>Select from folder</>}          
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Edit_img_page;
