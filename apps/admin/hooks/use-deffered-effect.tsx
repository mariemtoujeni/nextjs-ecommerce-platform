"use client"

import { EffectCallback, useEffect, useRef } from "react";


export const useDeferredEffect = (effect: EffectCallback, deps: any[]) => {
    const isInitialRender = useRef(true);

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        return effect();
    }, deps);

    useEffect(() => {
        return () => {
            isInitialRender.current = true;
        }
    }, []);
};