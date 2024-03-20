import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import TransactionsProvider from './context/Tx_Context.jsx'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<TransactionsProvider>
  <React.StrictMode>
      <App />
  </React.StrictMode>
</TransactionsProvider>
);  

