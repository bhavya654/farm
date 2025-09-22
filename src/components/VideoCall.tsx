import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Camera, 
  Settings,
  Monitor,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  trigger?: React.ReactNode;
  onCall?: (callData: any) => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ trigger, onCall }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && !hasPermissions) {
      requestPermissions();
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const requestPermissions = async () => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setHasPermissions(true);
      
      toast({
        title: "Camera Access Granted",
        description: "You can now start your video call",
      });
    } catch (error: any) {
      console.error('Error accessing media devices:', error);
      
      let errorMessage = "Failed to access camera and microphone";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Camera and microphone access denied. Please allow permissions in your browser settings.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera or microphone found on this device.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "Camera or microphone is already in use by another application.";
      }
      
      setPermissionError(errorMessage);
      
      toast({
        title: "Permission Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const startCall = async () => {
    if (!hasPermissions) {
      await requestPermissions();
      return;
    }

    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsInCall(true);
      
      // Simulate remote video (in real implementation, this would be the peer connection)
      if (remoteVideoRef.current) {
        // For demo purposes, mirror the local stream
        remoteVideoRef.current.srcObject = streamRef.current;
      }
      
      if (onCall) {
        onCall({
          type: 'call_started',
          timestamp: new Date(),
          participants: ['farmer', 'veterinarian']
        });
      }
      
      toast({
        title: "Call Connected",
        description: "You are now connected with the veterinarian",
      });
    }, 2000);
  };

  const endCall = () => {
    setIsInCall(false);
    setIsConnecting(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setHasPermissions(false);
    setIsOpen(false);
    
    toast({
      title: "Call Ended",
      description: "The video call has been disconnected",
    });
  };

  const PermissionScreen = () => (
    <div className="text-center space-y-6 py-8">
      <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
        <Camera className="h-10 w-10 text-primary" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
        <p className="text-muted-foreground mb-4">
          To start a video call, we need access to your camera and microphone.
        </p>
      </div>

      {permissionError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm text-destructive">
                {permissionError}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <Button onClick={requestPermissions} className="w-full">
          <Camera className="h-4 w-4 mr-2" />
          Grant Camera Access
        </Button>
        
        <div className="text-xs text-muted-foreground">
          Your privacy is important. Video calls are not recorded.
        </div>
      </div>
    </div>
  );

  const VideoCallInterface = () => (
    <div className="space-y-4">
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Local Video */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-0 aspect-video bg-muted">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary">You</Badge>
            </div>
            {!videoEnabled && (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <VideoOff className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Remote Video */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-0 aspect-video bg-muted">
            {isInCall ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary">Dr. Smith</Badge>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Waiting for veterinarian...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Call Controls */}
      <div className="flex items-center justify-center space-x-4 py-4 bg-muted/30 rounded-lg">
        <Button
          variant={audioEnabled ? "outline" : "destructive"}
          size="sm"
          onClick={toggleAudio}
        >
          {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>

        <Button
          variant={videoEnabled ? "outline" : "destructive"}
          size="sm"
          onClick={toggleVideo}
        >
          {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>

        {!isInCall && !isConnecting && (
          <Button onClick={startCall} className="px-8">
            <Phone className="h-4 w-4 mr-2" />
            Start Call
          </Button>
        )}

        {isConnecting && (
          <Button disabled className="px-8">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Connecting...
          </Button>
        )}

        {isInCall && (
          <Button variant="destructive" onClick={endCall} className="px-8">
            <PhoneOff className="h-4 w-4 mr-2" />
            End Call
          </Button>
        )}

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Call Status */}
      <div className="text-center">
        {isConnecting && (
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="animate-pulse">🔄</div>
            <span>Connecting to veterinarian...</span>
          </div>
        )}
        {isInCall && (
          <div className="flex items-center justify-center space-x-2 text-success">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span>Connected - Call in progress</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Video className="h-4 w-4 mr-2" />
            Start Video Call
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Video Consultation</DialogTitle>
        </DialogHeader>
        
        {!hasPermissions ? (
          <PermissionScreen />
        ) : (
          <VideoCallInterface />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoCall;