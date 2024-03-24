import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const SpeechRecognition = ({ onStart, onStop, onTranscription, onResponse }) => {
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let recognition;

    const startRecording = () => {
      recognition = new window.webkitSpeechRecognition();

      recognition.onstart = () => {
        console.log('Recording started');
        onStart();
      };

      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcribedText = event.results[last][0].transcript;
        handleTranscription(transcribedText);
      };

      recognition.onend = () => {
        console.log('Recording stopped');
        setIsRecording(false);
        onStop();
      };

      recognition.start();
    };

    const stopRecording = () => {
      if (recognition) {
        recognition.stop();
      }
    };

    const handleTranscription = (transcribedText) => {
      // Log the transcribed text to check if it's correct
      console.log('Transcription:', transcribedText);

      // Update the transcription state in App.js
      onTranscription(transcribedText);

      // Send the transcription to OpenAI API
      sendToOpenAI(transcribedText);
    };

    const sendToOpenAI = (transcription) => {
      axios
        .post('http://localhost:3001/process_question', {
          question: transcription, // Updated to 'question' instead of 'transcription'
        })
        .then((response) => {
          const openaiResponse = response.data.message;
          console.log('Response from OpenAI:', openaiResponse);
          // Handle the response from OpenAI as needed
          onResponse(openaiResponse); // Make sure onResponse is a function
        })
        .catch((error) => {
          console.error('Error from OpenAI:', error);
          // Handle errors from OpenAI API
        });
    };

    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [isRecording, onStart, onStop, onTranscription, onResponse]);

  const handleToggleRecording = () => {
    setIsRecording((prevIsRecording) => !prevIsRecording);
  };

  return (
    <div>
      <button onClick={handleToggleRecording} disabled={isRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default SpeechRecognition;
