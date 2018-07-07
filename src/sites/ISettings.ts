﻿export interface ISettings {
    integration?: IIntegrationSettings;
    site: ISiteSettings;
}

export interface ISiteSettings {
    /**
     * Web site title.
     */
    title: string;

    /**
     * Web site description.
     */
    description?: string;

    /**
     * Web site keywords.
     */
    keywords?: string;

    faviconPermalinkKey?: string;

    author?: string;
    /**
     * Facebook Open Graph settings.
     */
    ogSiteName?: string;

    ogUrl?: string;

    ogType?: "website" | "article" | "blog";

    ogImagePermalinkKey?: string;
}

export interface IIntegrationSettings {
    googlemaps?: IGMapsConfig;
    gtm?: IGtmConfig;
    intercom?: IIntercomConfig;
}

export interface IGMapsConfig {
    apiKey: string;
}

export interface IGtmConfig {
    containerId: string;
    dataLayerName?: string;
}

export interface IIntercomConfig {
    appId: string;
}