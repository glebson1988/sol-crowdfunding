import './App.css';
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils } from "@coral-xyz/anchor";
import { useEffect, useState } from 'react';

const programID = new PublicKey(idl.address);
const network = clusterApiUrl('devnet');
const opts = {
    preflightCommitment: 'processed',
};
const { SystemProgram } = web3;

const App = () => {
    const [wallet, setWallet] = useState(null);
    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment);
        const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
        return provider;
    }
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

    const createCampaign = async () => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programID, provider);
            const [campaign] = await PublicKey.findProgramAddressSync(
                [
                    utils.bytes.utf8.encode('CAMPAIGN_DEMO'),
                    provider.wallet.publicKey.toBuffer(),
                ],
                program.programId
            );
            await program.rpc.create('Campaign Demo', 'Campain Description', {
                accounts: {
                    campaign,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
            });
            console.log('Campaign created:', campaign.toString());
        }
        catch (error) {
            console.error('Error creating campaign:', error);
        }
    }

    const renderNotConnectedContainer = () => {
        return (
            <button onClick={connectWallet} className="btn btn-primary">
                Connect Wallet
            </button>
        );
    };

    const renderConnectedContainer = () => {
        return (
            <div>
                <button onClick={createCampaign} className="btn btn-primary">
                    Create Campaign
                </button>
            </div>
        );
    }

    useEffect(() => {
        const onLoad = async () => {
            await checkIfWalletIsConnected();
        };
        window.addEventListener('load', onLoad);
        return () => window.removeEventListener('load', onLoad);
    }, []);

    return (
        <div className="App">
            {wallet ? renderConnectedContainer() : renderNotConnectedContainer()}
        </div>
    );
};

export default App;
