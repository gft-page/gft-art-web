import React, { useEffect, useState } from 'react';
import NFTList from './NFTList';
import { allNFTs } from '../helpers';

import { Tabs } from "antd";
const { TabPane } = Tabs

export default function NFTTabs(props) {

    const [burnerNfts, setBurnerNfts] = useState([])
    const [nfts, setNfts] = useState([])
    const [account, setAccount] = useState("")

    async function getBurnerNFTS() {
        if (!props.list) return

        const allBurners = []

        const burners = props.list.map(i => i.burnerAddress)
        for (const b of burners) {
            const all = await allNFTs(b, props.network)
            console.log(b, all)
            if (all && all.data && all.data.length)
                allBurners.push(...(all.data.map(d => ({ ...d, owner: b }))))
        }

        console.log("allBurners", allBurners)

        setBurnerNfts(props.list.filter(l => allBurners.some(
            b => b.owner.toLowerCase() == l.burnerAddress.toLowerCase()
                && b.tokenAddress.toLowerCase() === l.tokenAddress.toLowerCase()
                && b.tokenId == l.tokenId
        )))
    }

    async function getAccountNFTS() {
        if (!props.provider) return

        const acct = (await props.provider.listAccounts())[0]
        if (!acct) return

        setAccount(acct)

        const all = await allNFTs(acct, props.network)
        console.log("all", all)
        if (all && all.data && all.data.length)
            setNfts(all.data)
    }

    useEffect(() => {
        (async () => {
            await getBurnerNFTS()
            await getAccountNFTS()
        })()
    }, [props])

    return (
        <Tabs defaultActiveKey="1" >
            <TabPane tab="NFTs to secure" key="1">
                <NFTList list={burnerNfts} burner network={props.network} />
            </TabPane>
            <TabPane tab={burnerNfts.some(b => b.burnerAddress.toLowerCase() === account.toLowerCase()) ? "Unsecured NFTs in this wallet" : "Secured NFTs"} key="2">
                <NFTList list={nfts} network={props.network} showTransfer={true} provider={props.provider} />
            </TabPane>
        </Tabs>
    )
}