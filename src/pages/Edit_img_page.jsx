import { useEffect, useRef, useState } from 'react';
import '../component-styles/Edit_img_page.scss';


function Edit_img_page() {
  // State to store the file data
  const [fileData, setFileData] = useState(null);
  const [refVideoData, setRefVideoData] = useState(null);
  const [isRdmVidLoading, setIsRdmVidLoading] = useState(false);
  const [livePortraitData, setLivePortraitData] = useState(null);

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
    '/ref_videos/ref-vid2.mp4',
    '/ref_videos/ref-vid3.mp4',
    '/ref_videos/ref-vid4.mp4',
    '/ref_videos/ref-vid5.mp4',
  ];

  const uploadNewImage = () => {
    uploadContainerRef.current.style.display = 'block';
    setFileData(null); // Clear the file data
    generatingLoaderRef.current.style.display = "none";
  };

  const uploadImage = () => {
    if (fileData) {
      // TODO: Add logic to upload the image to IPFS using Pinata to create a permanent URL
      uploadContainerRef.current.style.display = 'none';
      imageFileDisplay.current.src = URL.createObjectURL(fileData); // Creates a temporary blob URL that displays the file.
      imageFileDisplay.current.alt = fileData.name;
    }
  };

  const handleFileChange = (event) => {
    setFileData(event.target.files[0]); // Store the selected file in state
  };

  useEffect(() => {
    if (fileData) {
      uploadImage(); // Trigger upload when fileData is updated
    }
  }, [fileData]);

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


  // Segmind API
  const segmind_api_key = 'SG_66815f2b25931f21';
  const segmind_url = "https://api.segmind.com/v1/live-portrait";
  const segmind_options = {
    method: 'POST',
    headers: {
      'x-api-key': segmind_api_key,
      'Content-Type': 'application/json'
    },
    body: null
  };

  // Generates the live image from the static image and reference video using the Segmind API
  const generateLiveImage = async () => {
    if (fileData && refVideoData) {
      generatingLoaderRef.current.style.display = 'block';
      alertBox.current.classList.remove('reveal');
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

        // TODO: Retrieve the uploaded image and ref video from IPFS using Pinata and use the URL instead of the file

        const faceImageBase64 = await toB64('https://segmind-sd-models.s3.amazonaws.com/display_images/liveportrait-input.jpg');
        const data = {
          "face_image":  faceImageBase64,
          "driving_video": 'https://segmind-sd-models.s3.amazonaws.com/display_images/liveportrait-video.mp4',
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
          throw new Error(`Error: ${response.statusText}`);
        }
        
        const result = await response.blob();
        setLivePortraitData(result);
        console.log(result);
        generatingLoaderRef.current.style.display = 'none';

        // TODO: Logic to turn image into GIF

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
    alertBox.current.classList.remove('reveal');
    setRefVideoData(event.target.files[0]); // Store the selected file in state
  };
  // TODO: upload the video to pinata whenever the RefVideoData state changes

  // Updates the reference video when a new video is selected
  useEffect(() => {
    if (refVideoData) {
      refvideoRef.current.src = typeof refVideoData === 'string'
        ? refVideoData  // Use URL for random video
        : URL.createObjectURL(refVideoData); // Use blob URL for uploaded video
      refVidContRef.current.style.display = 'block';
      setIsRdmVidLoading(false);
    }
  }, [refVideoData]);


  // Generates a random reference video
  const generateRandomVid = (e) => {
    setIsRdmVidLoading(true);
    try {
      const randomVid = randomRefVideos[Math.floor(Math.random() * randomRefVideos.length)]; // TODO: remove when using pinata

      // TODO: Retrieve random video file from pinata and store in state below instead of the URL
        setRefVideoData(randomVid); // Update state with the random video URL
    } 
    catch (error) {
      alertBox.current.innerHTML = error.message;
      alertBox.current.classList.add('reveal');
      alertBox.current.style.backgroundColor = 'hsl(356, 58%, 52%)';
      setIsRdmVidLoading(false);
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
              <button className="btns to-life-btn" onClick={generateLiveImage}>Transform</button>
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
                <h3>Reference Video</h3>
                <video src="" controls muted id='ref-video' ref={refvideoRef}></video>
                <button className='other-btn chng-vid' onClick={() => refVideoInputRef.current.click()}>Change video</button>
                <p>or</p>
                <button className="other-btn upld-btn genbtn" onClick={(e) => generateRandomVid(e)}>
                {isRdmVidLoading ? <div className='loading-icon'></div> : <>Generate random <ion-icon name="shuffle-outline"></ion-icon></>}
                </button>
              </div>
              <h3>Select Reference video</h3>
              <button className="other-btn upld-btn genbtn" onClick={() => refVideoInputRef.current.click()}>Upload Video <ion-icon name="cloud-upload-outline"></ion-icon></button>
              <p>or</p>
              <button className="other-btn" onClick={(e) => generateRandomVid(e)}> 
                {isRdmVidLoading ? <div className='loading-icon'></div> : <>Generate random <ion-icon name="shuffle-outline"></ion-icon></>}
              </button>
            </div>
          </div>
        </div>


        <div className="display-live-portrait upload-container" ref={LivePortraitContRef}>
          <h2>Your live portrait is readyyy!</h2>
          <div id="live-portrait-wrapper">
            <video src="" controls muted id='live-portrait' ref={liveVidDisplayRef}></video>
          </div>
          <button className='btns' download='' ref={downloadLiveVidRef} onClick={() => LivePortraitContRef.current.style.display='none'}>Download <ion-icon name="download-outline"></ion-icon></button>
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
              Select from folder
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Edit_img_page;
