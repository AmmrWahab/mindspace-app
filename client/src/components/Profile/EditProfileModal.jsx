// client/src/components/Profile/EditProfileModal.jsx
import { useState, useRef, useEffect } from 'react';

function EditProfileModal({ user, onSave, onClose }) {
  const [name, setName] = useState(user.name);
  const [profilePic, setProfilePic] = useState(user.profilePic || '');
  const [useCamera, setUseCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' = front, 'environment' = back
  const [mirror, setMirror] = useState(true); // ✅ Mirror by default in front camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cropMode, setCropMode] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });



  // Force re-render when imageSrc is set
useEffect(() => {
  console.log('🔄 useEffect triggered:', { imageSrc: !!imageSrc, cropMode }); // 🔍 Debug

  if (imageSrc && !cropMode) {
    console.log('⏳ Scheduling cropMode activation...'); // 🔍 Debug
    setTimeout(() => {
      console.log('✅ Activating cropMode'); // 🔍 Debug
      setCropMode(true);
    }, 50);
  }
}, [imageSrc, cropMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  // File input handler
 const handleFileChange = (e) => {
  const file = e.target.files[0];
  console.log('📁 File selected:', file); // 🔍 Debug

  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert('Image is too large. Please choose a file under 2MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    console.log('🖼️ Image loaded, setting imageSrc'); // 🔍 Debug
    setImageSrc(reader.result);
    setCropPosition({ x: 0, y: 0 });
    // Let useEffect handle cropMode
  };
  reader.onerror = (err) => {
    console.error('❌ FileReader error:', err); // 🔍 Debug
  };
  reader.readAsDataURL(file);
};



  // Start Camera
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });

      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setUseCamera(true);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Camera access denied or not available.');
    }
  };

  // Switch Camera (Front ↔ Back)
  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setMirror(true); // Reset mirror when switching
    if (useCamera) setTimeout(startCamera, 100);
  };

  // Toggle Mirror (only for front camera)
  const toggleMirror = () => {
    if (facingMode === 'user') {
      setMirror(prev => !prev);
    }
  };

  // Capture Photo
const capturePhoto = () => {
  console.log('📸 Capturing photo...'); // 🔍 Debug
  const video = videoRef.current;
  const canvas = canvasRef.current;

  if (!video || !canvas) {
    console.error('❌ Video or canvas is null'); // 🔍 Debug
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg');

  console.log('✅ Photo captured, setting imageSrc'); // 🔍 Debug
  setImageSrc(dataUrl);
  setCropPosition({ x: 0, y: 0 });
  // Let useEffect handle cropMode
  stopCamera();
};




const applyCrop = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const outputSize = 120;

  canvas.width = outputSize;
  canvas.height = outputSize;

  const img = new Image();
  img.src = imageSrc;

  img.onload = () => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set clipping path to circle
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // === Match the small preview exactly ===
    // The small preview shows:
    // - 300px image
    // - offset by -cropPosition.x/y
    // - scaled to 0.4 (120/300)

    const scale = 0.4; // This is the key: 120 / 300

    // Draw the image with the same transform as the small preview
    const scaledWidth = 300 * scale;
    const scaledHeight = 300 * scale;
    const offsetX = (outputSize - scaledWidth) / 2;
    const offsetY = (outputSize - scaledHeight) / 2;

    ctx.drawImage(
      img,
      -cropPosition.x * scale + offsetX,
      -cropPosition.y * scale + offsetY,
      scaledWidth,
      scaledHeight
    );

    // ✅ Compress and save
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setProfilePic(dataUrl);
    setCropMode(false);
    setImageSrc(null);
  };

  img.onerror = () => {
    alert('Failed to process image. Please try again.');
    setCropMode(false);
    setImageSrc(null);
  };

  if (img.complete && img.naturalWidth !== 0) {
    img.onload();
  }
};


  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  // Save Profile
  const handleSave = async () => {
    onSave({ name, profilePic });
    onClose();
  };

 

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 3000
    }}>
      <div style={{
        width: '90%',
        maxWidth: '500px',
        padding: '2rem',
        borderRadius: '20px',
        backgroundColor: 'rgba(30, 15, 50, 0.95)',
        backdropFilter: 'blur(20px)',
        color: '#e0e7ff',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Edit Profile</h3>

        {/* Name Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c7d2fe' }}>
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              color: '#e0e7ff'
            }}
          />
        </div>

        {/* Profile Picture */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#c7d2fe' }}>
            Profile Photo
          </label>

          {!useCamera ? (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
              {/* Upload from File */}
              <label style={{
                padding: '10px 16px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}>
                🖼️ Browse
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              {/* Open Camera */}
              <button
                onClick={startCamera}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                📷 Use Camera
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              {/* Live Video Preview */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  marginBottom: '0.5rem',
                  transform: facingMode === 'user' && mirror ? 'scaleX(-1)' : 'scaleX(1)', // ✅ Mirror only in front cam
                  transition: 'transform 0.2s ease'
                }}
              />

              {/* Capture & Controls */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={capturePhoto}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  ✅ Capture
                </button>

                {facingMode === 'user' && (
                  <button
                    onClick={toggleMirror}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: mirror ? '#8b5cf6' : '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    {mirror ? '🪞 Unmirror' : '↩️ Mirror'}
                  </button>
                )}

                <button
                  onClick={switchCamera}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Switch
                </button>

                <button
                  onClick={stopCamera}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}

         {/* Profile Picture with Edit Icon */}
{!useCamera && (
  <div style={{
    marginTop: '1rem',
    textAlign: 'center'
  }}>
    <div style={{
      position: 'relative',
      display: 'inline-block'
    }}>
      {/* Profile Circle */}
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#f97316',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '2rem',
        fontWeight: 600,
        overflow: 'hidden',
        border: '3px solid rgba(249, 115, 22, 0.3)',
        margin: '0 auto'
      }}>
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          user?.name?.charAt(0).toUpperCase()
        )}
      </div>

      {/* Pencil Edit Icon */}
      {profilePic && (
        <button
          type="button"
          onClick={() => {
            setImageSrc(profilePic);
            setCropMode(true);
          }}
          style={{
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#8b5cf6',
            border: '2px solid white',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
            zIndex: 10,
            padding: 0,
            margin: 0
          }}
          title="Change profile photo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
      )}
    </div>
  </div>
)}
        </div>

        {/* Crop Mode */}
{cropMode && imageSrc && (
  <div style={{
    position: 'relative',
    width: '100%',
    height: '300px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '1rem'
  }}>
    <img
  src={imageSrc}
  alt="Crop preview"
  draggable={false}
  style={{
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain', // ✅ This ensures the full image is visible
  cursor: 'move'
}}
  onMouseDown={(e) => {
  const startX = e.clientX;
  const startY = e.clientY;
  const start = { ...cropPosition };

  const handleMouseMove = (e) => {
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  setCropPosition({
    x: start.x + dx,
    y: start.y + dy
  });
};

  const stopDrag = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopDrag);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopDrag);
}}
/>

    {/* Circular Frame Overlay */}
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: '3px solid #8b5cf6',
      boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
      pointerEvents: 'none',
      zIndex: 1
    }} />

   {/* Small Live Preview */}
<div style={{
  position: 'absolute',
  top: '10px',
  right: '10px',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  overflow: 'hidden',
  border: '2px solid #8b5cf6',
  backgroundColor: '#1e0f32',
  zIndex: 1
}}>
  <div style={{
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    overflow: 'hidden'
  }}>
    {imageSrc && (
     <img
  src={imageSrc}
  alt="Preview"
  style={{
    width: '300px',
    height: '300px',
    position: 'absolute',
    left: `${-cropPosition.x}px`,
    top: `${-cropPosition.y}px`,
    transform: 'scale(0.4)',
    transformOrigin: 'top left'
  }}
/>
    )}
  </div>
</div>

    {/* Drag to adjust */}
    <div style={{
      position: 'absolute',
      bottom: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '0.8rem',
      color: '#94a3b8',
      textAlign: 'center',
      zIndex: 1
    }}>
      Drag to adjust
    </div>
  </div>
)}

{cropMode && imageSrc && (
  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '1rem' }}>
    <button
      onClick={() => {
        setCropMode(false);
        setImageSrc(null);
      }}
      style={{
        padding: '8px 16px',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    >
      ❌ Cancel
    </button>
    <button
      onClick={applyCrop}
      style={{
        padding: '8px 16px',
        backgroundColor: '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    >
      ✅ Apply
    </button>
  </div>

  
)}

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #422062',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;