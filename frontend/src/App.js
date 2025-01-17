import './App.css';
import { useEffect, useState } from 'react';

const App = () => {
    const [wallet, setWallet] = useState(null);

    const checkIfWalletIsConnected = async () => {
        try {
            const { solana } = window;
            if (solana) {
                if (solana.isPhantom) {
                    console.log('Phantom is installed!');
                    const response = await solana.connect({ onlyIfTrusted: true });
                    console.log('Connected with public key:', response.publicKey.toString());
                    setWallet(response.publicKey.toString());
                }
            } else {
                alert('Phantom is not installed!');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const connectWallet = async () => {
        try {
            const { solana } = window;
            if (solana) {
                if (solana.isPhantom) {
                    const response = await solana.connect();
                    console.log('Connected with public key:', response.publicKey.toString());
                    setWallet(response.publicKey.toString());
                }
            } else {
                alert('Solana object not found! Install Phantom Wallet.');
            }
        } catch (error) {
            console.error('Error connecting to wallet:', error);
        }
    };

    const renderNotConnectedContainer = () => {
        return (
            <button onClick={connectWallet} className="btn btn-primary">
                Connect Wallet
            </button>
        );
    };

    useEffect(() => {
        const onLoad = async () => {
            await checkIfWalletIsConnected();
        };
        window.addEventListener('load', onLoad);
        return () => window.removeEventListener('load', onLoad);
    }, []);

    return (
        <div className="App">
            {wallet ? (
                <p>Wallet connected: {wallet}</p>
            ) : (
                renderNotConnectedContainer()
            )}
        </div>
    );
};

export default App;
