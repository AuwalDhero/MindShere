import React from 'react';

const ResponseDisplay = ({ transcription, response }) => {
  return (
    <div>
      <div>Transcription: {transcription}</div>
      <div>
        {Array.isArray(response) ? (
          response.map((item, index) => (
            <p key={index}>{item}</p>
          ))
        ) : (
          <p>{response}</p>
        )}
      </div>
    </div>
  );
};

export default ResponseDisplay;
