import React, { useState, useRef } from "react";
import axios from "axios";

const BACKEND_URL = "https://YOUR_BACKEND_URL/api/transcribe";

function App() {

  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Ready");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // generate random user id
  const userIdRef = useRef("user_" + Math.floor(Math.random() * 10000));

  const toggleRecording = async () => {

    if (isRecording) {

      setIsRecording(false);
      setStatus("Saving...");

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }

    } else {

      try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          chunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {

          const blob = new Blob(chunksRef.current, { type: "audio/webm" });

          const formData = new FormData();
          formData.append("audio", blob, "speech.webm");
          formData.append("user_id", userIdRef.current);

          try {

            await axios.post(BACKEND_URL, formData);

            setStatus("Saved");

          } catch (error) {

            console.error(error);
            setStatus("Error Saving");

          }

        };

        mediaRecorder.start();

        setIsRecording(true);
        setStatus("Recording...");

      } catch (error) {

        console.error(error);
        setStatus("Microphone Error");

      }

    }

  };

  return (

    <div style={{ textAlign:"center", marginTop:"150px", fontFamily:"Arial" }}>

      <h1>Speech Recorder</h1>

      <p>User ID: <b>{userIdRef.current}</b></p>

      <p>Status: <b>{status}</b></p>

      <button
        onClick={toggleRecording}
        style={{
          width:"250px",
          height:"100px",
          fontSize:"22px",
          borderRadius:"15px",
          backgroundColor: isRecording ? "#d9534f" : "#5cb85c",
          color:"white",
          border:"none",
          cursor:"pointer"
        }}
      >
        {isRecording ? "STOP & SAVE" : "START SPEAKING"}
      </button>

    </div>

  );

}

export default App;