import React from 'react';
import Screen from "@/app/chat/[id]/screen";
import {userAgent} from "next/server";
import {headers} from "next/headers";

export default async function Page() {
    const {device} = userAgent({headers: await headers()});
    return <Screen isMobile={device.type === 'mobile'}/>
}
