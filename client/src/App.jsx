import React, { useEffect } from 'react';
import { NavBar, Welcome, Footer, Transactions, Services } from './components';
const App = () => {
  /*const makeAPICall = async () => {
    try {
      const response = await fetch('http://localhost:8080/', {mode:'cors'});
      const data = await response.json();
      console.log({ data })
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    makeAPICall();
  }, [])*/

  return (
    <div className='min-h-screen'> 
      <div className='gradient-bg-welcome'>
        <NavBar />
        <Welcome />
      </div>
      <Services />
      <Transactions />
      <Footer />
    </div>
  );
}
  

export default App
