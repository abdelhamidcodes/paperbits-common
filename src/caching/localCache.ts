﻿import { ILocalCache } from "../caching/ILocalCache";
import { LruCache } from "../caching/lruCache";

export class LocalCache implements ILocalCache {
    private lrucache: LruCache<any>;

    constructor() {
        this.lrucache = new LruCache<any>(10000);
    }

    public getKeys(): string[] {
        const keys = new Array<string>();

        for (const key in window.localStorage) {
            if (window.localStorage.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        const lrucacheKeys = this.lrucache.getKeys();

        for (let i = 0; i < lrucacheKeys.length; i++) {
            keys.push(lrucacheKeys[i]);
        }

        return keys;
    }

    public setItem(key: string, value: any): void {
        if (this.estimateSize(value) < 10240) {
            this.lrucache.setItem(key, value);
        }
        window.localStorage.setItem(key, JSON.stringify(value));
    }

    public getItem<T>(key: string): T {
        const content = this.lrucache.getItem(key);
        return content ? content : JSON.parse(window.localStorage.getItem(key));
    }

    private estimateSize(object: any) {
        const list = [];
        const stack = [object];
        let bytes = 0;

        while (stack.length) {
            const value = stack.pop();

            if (!value) {
                continue;
            }
            if (typeof value === "boolean") {
                bytes += 4;
            }
            else if (typeof value === "string") {
                bytes += value.length * 2;
            }
            else if (typeof value === "number") {
                bytes += 8;
            }
            else if (typeof value === "object" &&
                list.indexOf(value) === -1
            ) {
                list.push(value);
                for (const i in value) {
                    if (value.hasOwnProperty(i)) {
                        stack.push(value[i]);
                    }
                }
            }
        }
        return bytes;
    }

    public getOccupiedSpace(): number {
        return 0;
    }

    public getRemainingSpace(): number {
        return 0;
    }

    public addChangeListener(callback: () => void) {
        // Do nothing
    }

    public removeItem(key: string): void {
        this.lrucache.removeItem(key);
        window.localStorage.removeItem(key);
    }

    public clear() {
        this.lrucache.clear();
        window.localStorage.clear();
    }
}