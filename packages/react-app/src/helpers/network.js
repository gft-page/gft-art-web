export const MAINNET = "MAINNET";
export const RINKEBY = "RINKEBY";

export async function getNetwork(provider) {
    const chainId = (await provider.getNetwork()).chainId
    return chainId === 1 ? MAINNET :
        (chainId === 4 ? RINKEBY : new Error("unsupported network"))
}
