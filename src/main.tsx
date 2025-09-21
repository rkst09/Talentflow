import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { startMockServer } from './mocks/server'
import { seedDatabase } from './services/seedData'

// Start mock server and seed database
const initializeApp = async () => {
  // Start MSW
  await startMockServer()
  
  // Seed database with initial data
  await seedDatabase()
  
  // Render the app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

initializeApp()
