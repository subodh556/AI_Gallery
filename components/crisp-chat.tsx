"use client"

import { useEffect } from "react"
import { Crisp } from "crisp-sdk-web"

export const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("022ec391-bc93-462c-957a-4df63a03e4f5");
    }, []);

    return null;
}