type waitingConfig = {
    wait: string;
    src: string;
    id: string;
}[];
declare const getWaitingPath: () => Promise<waitingConfig>;
declare const checkDynamicRoute: (requestHTML: string, config: waitingConfig) => false | {
    wait: string;
    src: string;
    id: string;
};
declare const viteDynamicRouting: (tsxPath: string, id: string) => Promise<string>;
export { viteDynamicRouting, checkDynamicRoute, getWaitingPath, type waitingConfig, };
