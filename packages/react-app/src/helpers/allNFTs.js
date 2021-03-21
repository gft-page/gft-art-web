export default async function allNFTs(account, network) {
    const url = `https://${network && network == "RINKEBY" ? 'rinkeby-' : ''}api.opensea.io/api/v1/assets?order_direction=desc&owner=${account}&offset=0&limit=20`

    try {
        const fetchResponse = await fetch(url, { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } });
        try {
            const data = await fetchResponse.clone().json();
            return { data: data.assets.map(a => ({ tokenId: a.token_id, contract: a.asset_contract.address })) };
        } catch (error) {
            const text = await fetchResponse.text()

            return (fetchResponse.status === 200) ?
                { data: text } : { error: text }
        }
    } catch (error) {
        return { error };
    }

}