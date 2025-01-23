import './App.css';
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN } from "@coral-xyz/anchor";
import { useEffect, useState } from 'react';
import { Buffer } from "buffer";
window.Buffer = Buffer;

const network = clusterApiUrl('devnet');
const opts = {
    preflightCommitment: 'processed',
};
const { SystemProgram } = web3;

const App = () => {
    const [wallet, setWallet] = useState(null);
    const [campaigns, setCampaigns] = useState([]);

    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment);
        const provider = new AnchorProvider(connection, window.solana, opts.preflightCommitment);
        return provider;
    };

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

    const getCampaigns = async () => {
        try {
            const connection = new Connection(network, opts.preflightCommitment);
            const provider = getProvider();
            const program = new Program(idl, provider);
            const campaignAccounts = await connection.getProgramAccounts(program.programId);

            const campaigns = await Promise.all(
                campaignAccounts.map(async (campaign) => {
                    const accountData = await program.account.campaign.fetch(campaign.pubkey);
                    return {
                        campaignId: campaign.pubkey.toString(),
                        pubkey: campaign.pubkey,
                        name: accountData.name,
                        description: accountData.description,
                        balance: accountData.amountDonated
                            ? accountData.amountDonated / web3.LAMPORTS_PER_SOL
                            : 0,
                    };
                })
            );

            setCampaigns(campaigns);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        }
    };

    const createCampaign = async () => {
        try {
            const provider = getProvider();
            const program = new Program(idl, provider);
            const [campaign] = await PublicKey.findProgramAddressSync(
                [utils.bytes.utf8.encode('CAMPAIGN_DEMO'), provider.wallet.publicKey.toBuffer()],
                program.programId
            );
            await program.methods.create('Campaign Demo', 'Campaign Description').accounts({
                campaign,
                user: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            }).rpc();

            console.log('Campaign created:', campaign.toString());
        } catch (error) {
            console.error('Error creating campaign:', error);
        }
    };

    const donate = async (campaignPublicKey) => {
        try {
            if (!campaignPublicKey) {
                throw new Error("Campaign public key is undefined or invalid.");
            }

            const campaignKey = new PublicKey(campaignPublicKey);
            const provider = getProvider();
            const program = new Program(idl, provider);
            const amount = new BN(0.2 * web3.LAMPORTS_PER_SOL);

            console.log("Donating amount (lamports):", amount.toString());
            console.log("Campaign PublicKey:", campaignKey.toString());

            await program.rpc.donate(amount, {
                accounts: {
                    campaign: campaignKey,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                },
            });

            console.log("Donated to campaign:", campaignKey.toString());
            await getCampaigns();
        } catch (error) {
            console.error("Error donating to campaign:", error);
        }
    };

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
                <h3>Wallet: {wallet}</h3>
                <button onClick={createCampaign} className="btn btn-primary">
                    Create Campaign
                </button>
                <button onClick={getCampaigns} className="btn btn-secondary">
                    Fetch Campaigns
                </button>
                <div className="campaign-list">
                    {campaigns.length > 0 ? (
                        <ul>
                            {campaigns.map((campaign) => (
                                <li key={campaign.campaignId}>
                                    <h3>{campaign.name}</h3>
                                    <p>{campaign.description}</p>
                                    <p>Public Key: {campaign.pubkey.toString()}</p>
                                    <p>Balance: {campaign.balance} SOL</p>
                                    <button onClick={() => donate(campaign.pubkey)} className="btn btn-primary">
                                        Donate
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No campaigns found.</p>
                    )}
                </div>
            </div>
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
            {wallet ? renderConnectedContainer() : renderNotConnectedContainer()}
        </div>
    );
};

export default App;
