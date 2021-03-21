import React, { useEffect, useState } from 'react';
import NFTList from './NFTList';
import { allNFTs } from '../helpers';

import { Tabs } from "antd";
const { TabPane } = Tabs

export default function NFTTabs(props) {

    const [burnerNfts, setBurnerNfts] = useState([])
    const [nfts, setNfts] = useState([])

    async function getBurnerNFTS() {
        if (!props.list) return

        const allBurners = []

        const burners = props.list.map(i => i.burnerAddress)
        burners.forEach(async (b) => {
            const all = await allNFTs(b, props.network)
            console.log(b, all)
            if (all && all.data && all.data.length)
                allBurners.push(...all.data)
        })

        setBurnerNfts(props.list.filter(l => allBurners.some(b => b.tokenAddress === l.tokenAddress && b.tokenId === l.tokenId)))
    }

    async function getAccountNFTS() {
        if (!props.provider) return

        const account = (await props.provider.listAccounts())[0]

        const all = await allNFTs(account, props.network)
        console.log("all", all)
        if (all && all.data && all.data.length)
            setNfts(all.data)
    }

    useEffect(() => {
        getBurnerNFTS()
        getAccountNFTS()
    }, [props])

    return (
        <Tabs defaultActiveKey="1" >
            <TabPane tab="NFTs to secure" key="1">
                <NFTList list={burnerNfts} burner network={props.network} />
            </TabPane>
            <TabPane tab="Secured NFTs" key="2">
                <NFTList list={nfts} network={props.network} />
            </TabPane>
        </Tabs>
    )
}