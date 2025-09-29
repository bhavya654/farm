// src/components/VoiceflowChatbot.tsx
import React, { useEffect } from 'react';

const VoiceflowChatbot = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    script.id = 'voiceflow-script'; // Add an ID to prevent duplicates

    script.onload = () => {
      window.voiceflow.chat.load({
        verify: { projectID: '68d7a3abb1c4c1f3c8573fec' }, // IMPORTANT: Replace with your actual projectID
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production',
      });
    };

    // Prevent adding the script multiple times
    if (!document.getElementById('voiceflow-script')) {
      document.head.appendChild(script);
    }

    // Cleanup on component unmount (good practice, though we won't unmount it)
    return () => {
      const existingScript = document.getElementById('voiceflow-script');
      if (existingScript) {
        // Note: Removing the script might not fully "unload" the widget.
        // The best practice is to load it once and leave it.
      }
    };
  }, []);

  return null; // This component doesn't render any UI itself
};

export default VoiceflowChatbot;