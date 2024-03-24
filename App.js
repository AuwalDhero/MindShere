import React, { useState } from 'react';
import SpeechRecognition from './components/SpeechRecognition';
import ResponseDisplay from './components/ResponseDisplay';
import './App.css';

const App = () => {
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');

  const startRecording = () => {
    // Your logic for starting recording
    // You can add code here to handle recording initiation
    console.log('Recording started in App.js');
  };

  const stopRecording = async () => {
    try {
      // Your logic for stopping recording
      // Call OpenAI API here with the transcribed text
      const response = await fetch('http://localhost:3001/process_transcription', {
        method: 'POST',
        body: JSON.stringify({
          question: transcription, // Updated to 'question' instead of 'transcription'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful response
        setResponse(data.message);
      } else {
        // Handle error response
        console.error('Error from server:', data.error);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };

  const handleTranscription = (transcribedText) => {
    // Update the transcription state
    setTranscription(transcribedText);
  };

  const handleResponse = (openaiResponse) => {
    // Update the response state
    setResponse(openaiResponse);
  };
  return (
    <div className="App">
      <header className="App-header">
        {/* Display your logo */}
        <img src="/logo.png" alt="Logo" className="logo" />

        {/* Your existing HTML content can go here */}
        <h1 className="mb-10 text-xl font-semibold text-center bg-gray-200 py-4 px-6 rounded-lg border-2 border-gray-400 shadow-md">
          How can I help you?
        </h1>

        <SpeechRecognition
          onStart={startRecording}
          onStop={stopRecording}
          onTranscription={handleTranscription}
          onResponse={handleResponse}
        />

        <ResponseDisplay transcription={transcription} response={response} />
      </header>
    </div>
  );
};

export default App;
