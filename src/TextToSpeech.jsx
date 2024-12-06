import React, { useState, useRef } from "react";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

export const TextToSpeech = () => {
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [speechMessage, setSpeechMessage] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState("Joanna"); // Default voice
  const audioRef = useRef(null);
  const voices = [
    "Joanna",
    "Danielle",
    "Ruth",
    "Salli",
    "Kimberly",
    "Kendra",
    "Ivy",
    "Gregory",
    "Kevin",
    "Matthew",
    "Justin",
    "Joey",
    "Stephen",
  ];
 
  // 
  const handleTogglePlayback = async (message) => {
    if (activeMessageId === message.id) {
      // Stop playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset playback to the beginning
        audioRef.current.src = "";
      }
      setActiveMessageId(null);
      setSpeechMessage(null);
    } else {
      // Start playback
      setActiveMessageId(message.id);
      setSpeechMessage(message.text);

      const client = new PollyClient({
        region: "ap-southeast-1",
        credentials: {
          accessKeyId: import.meta.env.VITE_API_KEY,
          secretAccessKey: import.meta.env.VITE_API_SECRET
        },
      });

      try {
        const command = new SynthesizeSpeechCommand({
          Text: message.text,
          OutputFormat: "mp3",
          VoiceId: selectedVoice,
          Engine: "neural",
        });

        const response = await client.send(command);

        if (response.AudioStream) {
          const audioChunks = [];
          const reader = response.AudioStream.getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            audioChunks.push(value);
          }

          const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
          const audioUrl = URL.createObjectURL(audioBlob);

          if (audioRef.current) {
            audioRef.current.src = audioUrl;

            // Add 'ended' event listener to reset activeMessageId
            audioRef.current.onended = () => {
              setActiveMessageId(null);
              setSpeechMessage(null);
            };

            audioRef.current.play();
          }
        }
      } catch (error) {
        console.error("Error synthesizing speech:", error);
      }
    }
  };

  return (
    <div>
      <h3>Text-to-Speech Demo</h3>
      <label htmlFor="voiceSelect">Select Voice:</label>
      <select
        id="voiceSelect"
        value={selectedVoice}
        onChange={(e) => setSelectedVoice(e.target.value)}
      >
        {voices.map((voice) => (
          <option key={voice} value={voice}>
            {voice}
          </option>
        ))}
      </select>

      <h3>Message 1</h3>
      <button
        onClick={() =>
          handleTogglePlayback({
            id: "msg1",
            text: "The Abu Dhabi Dark Sky Policy is a strategic initiative aimed at reducing light pollution in the Emirate.",
          })
        }
      >
        {activeMessageId === "msg1" ? "Stop Playback" : "Start Playback"}
      </button>
      <div>
        {speechMessage && activeMessageId === "msg1" && (
          <p>Speaking: {speechMessage}</p>
        )}
      </div>

      <h3>Message 2</h3>
      <button
        onClick={() =>
          handleTogglePlayback({
            id: "msg2",
            text: `Once upon a time, in a small, enchanted village nestled between the rolling hills of Evergreen Forest, lived a curious young girl named Lily. She loved exploring, asking questions, and, most of all, uncovering secrets hidden in plain sight.

One sunny morning, as Lily strolled down the cobblestone path to the market, she spotted something unusual. A shimmering, golden key was lying on the ground, glinting under the soft rays of the sun. "What could this unlock?" she wondered aloud, her heart pounding with excitement.

She picked up the key, turning it over in her hands. It was engraved with tiny symbols—ones she had never seen before. “Perhaps the old librarian would know something about this!” she exclaimed, hurrying to the ancient stone library at the edge of the village.

The librarian, Mr. Whittaker, was a frail yet wise man with spectacles that always seemed slightly crooked. As Lily held out the key, he gasped. "This... this is the Key of Whimsy! Legend says it opens the door to a magical world."

"A magical world?" Lily repeated, her eyes widening with wonder. "Where is this door?"

Mr. Whittaker hesitated, then whispered, "Deep in Evergreen Forest, beneath the tallest oak tree. But beware—the path is not without its challenges."

Lily, determined and fearless, thanked him and set off on her journey. The forest was dense, its towering trees casting long, mysterious shadows. As she ventured deeper, strange sounds filled the air—whispers, rustling leaves, and an occasional distant howl.

Finally, she arrived at the majestic oak tree. Its roots twisted like gnarled hands, and its branches reached toward the sky. At its base, she saw a small, rusted lock embedded in the trunk. With trembling fingers, Lily inserted the golden key and turned it.

Click.

The tree creaked and groaned as a hidden door swung open. Inside was a world unlike any she had ever imagined—a kaleidoscope of colors, floating islands, and creatures with wings that sparkled like diamonds.

"Welcome, Lily," a gentle voice said. It was a creature resembling a fox, but its fur shimmered like starlight. "You have unlocked the Realm of Wonders. Here, your dreams will guide you."

And so, Lily stepped into the magical world, her heart brimming with joy and curiosity. From that day forward, she became the Keeper of Whimsy, ensuring that its magic was protected for generations to come.`,
          })
        }
      >
        {activeMessageId === "msg2" ? "Stop Playback" : "Start Playback"}
      </button>
      <div>
        {speechMessage && activeMessageId === "msg2" && (
          <p>Speaking: {speechMessage}</p>
        )}
      </div>

      <audio ref={audioRef} controls />
    </div>
  );
};
