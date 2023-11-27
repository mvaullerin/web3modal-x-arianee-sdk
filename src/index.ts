
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5'
import Core from "@arianee/core";
import {Wallet} from "@arianee/wallet";

// 1. set projectId
const projectId = ''

// 2. Set chains
const mainnet = {
    chainId: 77,
    name: 'Sokol',
    currency: 'SPOA',
    explorerUrl: 'https://sokol.explorer.arianee.com',
    rpcUrl: 'https://sokol.arianee.net'
}

// 3. Create modal
const metadata = {
    name: 'My Website',
    description: 'My Website description',
    url: 'https://mywebsite.com',
    icons: ['https://avatars.mywebsite.com/']
}
const modal = createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [mainnet],
    defaultChain: mainnet,
    projectId
});

let wallet:Wallet;

modal.subscribeProvider(async (provider)=>{
    const signer = modal.getSigner();

    const core = new Core(
        {
            getAddress: () => modal.getAddress(),
            signMessage: async (message) => { const signature = await signer.signMessage(message); return {message, signature} } ,

            sendTransaction: async (transaction) => {
                const mappedTx:any =  {
                    ...transaction
                };
                const txResponse = await signer.sendTransaction(mappedTx);
                const mappedTxResponse:any = {...txResponse};
                return mappedTxResponse
            },
        }
    )
    wallet = new Wallet({chainType:'testnet', auth:{core}}) // you can change to mainnet to get your NFT on mainnet
    document.getElementById("connectedArea").classList.remove('hide');
    const connectedAddressElement= document.getElementById("connectedAddress")
    connectedAddressElement.innerText = `connected address: ${await wallet.getAddress()}`
    connectedAddressElement.classList.remove('hide');

})
async function walletConnect(){
    await modal.open();
}
async function getOwnedSmartAsset(){
    if(!wallet) throw new Error('wallet not connected');
    const nftList = await wallet.smartAsset.getOwned()
    const nftListElement = document.getElementById('ownedSmartAssetList');

    if(nftList.length === 0){
        nftListElement.innerText = 'no NFT owned';
        return;
    }

    for(const nft of nftList){
        const nftElement = document.createElement('li');
        nftElement.innerText = nft.data.content.name;
        nftListElement.appendChild(nftElement);
    }
    return;
}

document.getElementById("connectBtn").addEventListener("click", walletConnect);
document.getElementById("getOwnedSmartAsset").addEventListener("click", getOwnedSmartAsset);
