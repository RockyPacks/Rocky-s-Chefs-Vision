
import React, { useState, useCallback, useRef, useEffect } from 'react';

interface IngredientUploaderProps {
  onImageAnalyzed: (base64: string) => void;
}

const IngredientUploader: React.FC<IngredientUploaderProps> = ({ onImageAnalyzed }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Effect to handle starting and stopping the camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (isCameraOpen && videoRef.current) {
         if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Camera not supported on this browser.");
          setIsCameraOpen(false);
          return;
        }
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera access error:", err);
          setError("Permission to use camera was denied. Please allow camera access in your browser settings.");
          setIsCameraOpen(false);
        }
      }
    };

    startCamera();

    // Cleanup function to stop the stream
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const openCamera = () => {
      setError(null);
      setIsCameraOpen(true);
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
  };
  
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        closeCamera();
      } else {
        setError("Failed to capture image.");
      }
    }
  };

  const handleAnalyzeClick = () => {
    if (imagePreview) {
      const base64Data = imagePreview.split(',')[1];
      onImageAnalyzed(base64Data);
    } else {
      setError('Please select an image first.');
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();
  
  const resetSelection = () => {
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isCameraOpen) {
    return (
        <div className="text-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Camera Mode</h2>
            <div className="relative w-full max-w-xl mx-auto">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg shadow-lg bg-black"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <div className="mt-4 flex justify-center space-x-4">
                <button onClick={takePicture} className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-colors">
                    <i className="fas fa-camera mr-2"></i> Capture
                </button>
                <button onClick={closeCamera} className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:bg-gray-600 transition-colors">
                    <i className="fas fa-times mr-2"></i> Cancel
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="animate-fade-in">
        {/* Hero Section */}
        <section className="hero-bg text-white py-20 sm:py-32">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
                    What's in your fridge?
                </h1>
                <p className="text-lg sm:text-xl max-w-3xl mx-auto text-gray-200">
                    Turn random ingredients into culinary masterpieces. Just snap a photo, and let our AI chef do the rest.
                </p>
            </div>
        </section>

        {/* Uploader Card */}
        <div className="relative -mt-16 sm:-mt-20 z-10">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-3xl mx-auto p-6 sm:p-10 text-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    
                    {imagePreview ? (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Analyze!</h2>
                            <img src={imagePreview} alt="Ingredients preview" className="mx-auto max-h-60 rounded-lg shadow-md mb-6" />
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <button
                                    onClick={handleAnalyzeClick}
                                    className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 flex items-center justify-center"
                                >
                                    <i className="fas fa-magic mr-2"></i>
                                    Unleash the AI Chef
                                </button>
                                <button 
                                    onClick={resetSelection} 
                                    className="w-full sm:w-auto px-8 py-3 bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                                >
                                    <i className="fas fa-undo mr-2"></i>
                                    Try Another
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <i className="fas fa-hat-chef text-green-500 text-4xl mb-4"></i>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Let's Get Cooking!</h2>
                            <p className="text-gray-600 mb-8">Start by uploading a photo or using your camera.</p>
                            {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={triggerFileSelect} className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105 flex items-center justify-center">
                                    <i className="fas fa-upload mr-2"></i> Upload from Device
                                </button>
                                <button onClick={openCamera} className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105 flex items-center justify-center">
                                    <i className="fas fa-camera-retro mr-2"></i> Use Camera
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* How It Works Section */}
        <section className="py-20 sm:py-28">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Cooking Made Easy</h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-12">Follow these three simple steps to your next delicious meal.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6">
                        <div className="bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-camera text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">1. Snap or Upload</h3>
                        <p className="text-gray-600">Show us the ingredients you have on hand with a quick photo.</p>
                    </div>
                    <div className="p-6">
                        <div className="bg-purple-100 text-purple-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-magic text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">2. Customize & Generate</h3>
                        <p className="text-gray-600">Tell us your preferences, and our AI will create three custom recipes for you.</p>
                    </div>
                    <div className="p-6">
                         <div className="bg-yellow-100 text-yellow-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-utensils text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">3. Cook & Enjoy</h3>
                        <p className="text-gray-600">Follow the simple instructions and enjoy your amazing, home-cooked meal!</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
  );
};

export default IngredientUploader;
