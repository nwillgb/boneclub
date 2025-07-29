import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Video, VideoOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Test() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  const getCameraFeed = async () => {
    setError('');
    if (stream) {
      // Stop existing stream
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera: ", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera access was denied. Please allow camera access in your browser settings and try again.");
      } else {
        setError("Could not access the camera. Please ensure it is connected and not in use by another application.");
      }
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    // Cleanup function to stop the stream when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#e5e4cd' }}>
      <div className="max-w-6xl mx-auto space-y-4">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 hover:opacity-70 transition-colors" style={{ color: '#5a3217' }}>
          <ArrowLeft className="w-4 h-4" /> <span>Back to Tools</span>
        </Link>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#5a3217' }}>Camera Feed Test</h1>
        </div>
        
        <Card className="elegant-shadow border-0" style={{ backgroundColor: '#9fd3ba' }}>
          <CardHeader>
            <CardTitle style={{ color: '#5a3217' }}>Webcam Integration</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-full max-w-lg aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
                style={{ display: stream ? 'block' : 'none' }}
              />
              {!stream && (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-bone-color-faded">Camera feed is off</p>
                </div>
              )}
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            
            <Button onClick={getCameraFeed} style={{ backgroundColor: '#f26222' }} className="text-white hover:opacity-90">
              {stream ? <VideoOff className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
              {stream ? 'Stop Camera' : 'Start Camera'}
            </Button>

            <p className="text-xs pt-4" style={{ color: '#5a3217' }}>
              Click the button to start or stop your webcam feed. You will be asked for permission by your browser.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}