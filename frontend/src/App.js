import './App.css';
import { useEffect } from 'react';

const App = () => {
  const checkIfWalletIsConnected = async() => {
    try {
      const { solana } = window;
      if(solana) {
        if(solana.isPhantom) {
          console.log('Phantom is installed!');
        }
      } else {
        alert('Phantom is not installed!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const onLoad = async() => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
};

export default App;
