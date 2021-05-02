import { providers } from 'ethers'
export const MAINNET = "MAINNET"
export const RINKEBY = "RINKEBY"

export async function getNetwork(provider) {
    const chainId = (await provider.getNetwork()).chainId
    return chainId === 1 ? MAINNET :
        (chainId === 4 ? RINKEBY : new Error("NET: unsupported network"))
}

export async function getProvider(web3Modal) {
  if (!web3Modal || !web3Modal.cachedProvider) {
    throw new Error('NET: Failed to get provider')
  }
  return new providers.Web3Provider(await web3Modal.connect());
}