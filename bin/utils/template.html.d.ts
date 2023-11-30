import { RettleConfigInterface } from "./config";
export interface templateHTMLInterface extends Pick<RettleConfigInterface, "header"> {
    html: string;
    headers: Array<string>;
    script: string;
    style?: string;
    helmet: {
        html: string;
        body: string;
    };
    noScript: string[];
    isModule: boolean;
}
export declare const templateHtml: (options: templateHTMLInterface) => string;
