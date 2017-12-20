import { IWidgetBinding } from "./../../editing/IWidgetBinding";
import { IViewModelBinder } from "./../IViewModelBinder";
import { IModelBinder } from "./../../editing/IModelBinder";
import { Contract } from "./../../editing/contentNode";
import { TextblockModel } from "./textblockModel";
import { IHyperlink } from "../../permalinks/IHyperlink";
import { IPermalinkService } from "../../permalinks/IPermalinkService";


export class TextblockModelBinder implements IModelBinder {
    private readonly permalinkService: IPermalinkService;

    constructor(permalinkService: IPermalinkService) {
        this.permalinkService = permalinkService;
    }

    private async resolveHyperlinks(nodes: Contract[]): Promise<void> {
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];

            if (node && node.type == "link") {
                let hyperlink: IHyperlink = node["data"];

                if (hyperlink.permalinkKey) {
                    const permalink = await this.permalinkService.getPermalinkByKey(hyperlink.permalinkKey);

                    if (permalink) {
                        hyperlink.href = permalink.uri;

                        if (permalink.parentKey) {
                            const parentPermalink = await this.permalinkService.getPermalinkByKey(permalink.parentKey);

                            if (parentPermalink) {
                                // TODO: Probably we should use separate property of permalink instead of URI, i.e. "hash".
                                hyperlink.href = `${parentPermalink.uri}#${hyperlink.href}`;
                            }
                            else {
                                // TODO: Show permalink is broken somehow
                                console.warn(`Broken parent permalink: ${permalink.parentKey}.`);
                            }
                        }
                    }
                    else {
                        // TODO: Show permalink is broken somehow
                        console.warn(`Broken permalink: ${hyperlink.permalinkKey}.`);
                    }
                }
            }

            if (node.nodes) {
                await this.resolveHyperlinks(node.nodes);
            }
        }
    }

    private async resolveAnchors(nodes: Contract[]) {
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];

            if (node && node["data"] && node["data"]["categories"] && node["data"]["categories"]["anchorKey"]) {
                const anchorKey = node["data"]["categories"]["anchorKey"];
                const anchorPermalink = await this.permalinkService.getPermalinkByKey(anchorKey);

                if (anchorPermalink) {
                    node["data"]["categories"]["anchorId"] = anchorPermalink.uri;
                }
                else {
                    // TODO: Show permalink is broken somehow
                    console.warn(`Broken anchor permalink: ${anchorKey}.`);
                }
            }

            if (node && node.nodes) {
                await this.resolveAnchors(node.nodes);
            }
        }
    }

    public async nodeToModel(node: Contract): Promise<TextblockModel> {
        // TODO: Scan for unresolved hyperlink permalinks (this is compensation of Slate not being able to do async work)

        if (node.nodes) {
            await this.resolveHyperlinks(node.nodes);
        }

        if (node.nodes) {
            await this.resolveAnchors(node.nodes);
        }

        let textblockModel = new TextblockModel({ "nodes": node.nodes });

        return textblockModel;
    }

    public canHandleWidgetType(widgetType: string): boolean {
        return widgetType === "text";
    }

    public canHandleModel(model): boolean {
        return model instanceof TextblockModel;
    }

    public getConfig(model: TextblockModel): Contract {
        let state;

        if (model.htmlEditor) {
            state = model.htmlEditor.getState();
            model.state = state;
        }
        else {
            state = model.state;
        }

        let textblockConfig: Contract = {
            kind: "widget",
            type: "text",
            nodes: state["nodes"]
        }

        return textblockConfig;
    }
}