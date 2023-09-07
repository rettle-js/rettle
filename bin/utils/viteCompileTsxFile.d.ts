declare const compileTsx: (tsxPath: string) => Promise<string>;
declare const compileDynamicTsx: (tsxPath: string, id: string) => Promise<string>;
export { compileTsx, compileDynamicTsx };
