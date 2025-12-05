import { useState, useRef } from "react";
import api from "../api";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

function VoiceInput({ onParsedTask }) {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [loadingParse, setLoadingParse] = useState(false);

  const recognitionRef = useRef(null);

  const startRecording = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      parseTranscript(text);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const parseTranscript = async (text) => {
    try {
      setLoadingParse(true);
      const res = await api.post("/voice/parse", { transcript: text });
      setParsed(res.data.parsed);
    } catch (err) {
      console.error("Failed to parse transcript", err);
    } finally {
      setLoadingParse(false);
    }
  };

  const handleCreateFromParsed = () => {
    if (!parsed) return;
    onParsedTask({
      title: parsed.title,
      dueDate: parsed.dueDate,
      priority: parsed.priority,
      status: parsed.status,
      rawTranscript: transcript,
    });
    setTranscript("");
    setParsed(null);
  };

  return (
    <section className="voice-input">
      <div className="voice-header">
        <h2> Voice Task Creation</h2>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`voice-record-btn ${isRecording ? "recording" : ""}`}
        >
          {isRecording ? "Stop Recording" : "Start Voice Input"}
        </button>
      </div>

      {transcript && (
        <div className="voice-preview">
          <p>
            <strong>Transcript:</strong> *{transcript}*
          </p>
          {loadingParse && <p>Parsing...</p>}
          {parsed && (
            <div className="parsed-fields">
              <p>
                <strong>Parsed Title:</strong> {parsed.title}
              </p>
              <p>
                <strong>Parsed Due Date:</strong>{" "}
                {parsed.dueDate
                  ? new Date(parsed.dueDate).toLocaleDateString()
                  : "Not detected"}
              </p>
              <p>
                <strong>Parsed Priority:</strong>{" "}
                <span className={`priority ${parsed.priority}`}>
                  {parsed.priority}
                </span>
              </p>
              <p>
                <strong>Status:</strong> {parsed.status.replace(/_/g, " ")}
              </p>
              <button onClick={handleCreateFromParsed}>Create Task</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default VoiceInput;
