export default async function allNFTs(account, network) {
    console.log("==================================================================")

    const url = `https://${network && network.toUpperCase() == "RINKEBY" ? 'rinkeby-' : ''}api.opensea.io/api/v1/assets?order_direction=desc&owner=${account}&offset=0&limit=20&cache_clearer=${Math.round(Date.now() / 5000)}`
    await timeout(300)

    try {
        const fetchResponse = await fetch(url, { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } });
        try {
            const data = await fetchResponse.clone().json();
            return { data: data.assets.map(a => ({ tokenId: a.token_id, tokenAddress: a.asset_contract.address })) };
        } catch (error) {
            const text = await fetchResponse.text()

            return (fetchResponse.status === 200) ?
                { data: text } : { error: text }
        }
    } catch (error) {
        return { error };
    }

}


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
