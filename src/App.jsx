import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { TextToSpeech } from './TextToSpeech'

function App() {
  const [count, setCount] = useState(0)

  return (
 <>
 <TextToSpeech/>
 </>
  )
}

export default App
