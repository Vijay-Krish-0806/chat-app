import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import ChatPage from './Pages/ChatPage'
import './App.css'
import ChatProvider from './Context/ChatProvider'

function App() {
  return (
    <div className='App'>
      <Router>
        <ChatProvider>
          <Routes>
            <Route path='/' exact element={<Home />} />
            <Route path='/chats' exact element={<ChatPage />} />
          </Routes>
        </ChatProvider>
      </Router>
    </div>
  )
}

export default App
