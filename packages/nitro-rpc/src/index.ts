import { type NitroModule } from 'nitropack/core'
import { arrayToNestedObject } from './utils/arrayToNestedObject';
import defu from 'defu'
import * as fs from 'fs';
import { injectValueToDeepProperties } from './utils/injectValueToDeepProperties';
export default () => ({
    name: "nitro-rpc",
    async setup(nitro) {
        const makeRpcDefinition = () => {
            let apiRoutes = {};
            nitro.scannedHandlers
            .filter((handler): handler is typeof handler & { route: string } => !!handler.route)
            .map(({ route, method, handler }) => {
                const [_, ...resources] = route.split('/');
                const r = injectValueToDeepProperties(
                    arrayToNestedObject(resources),
                    {
                        [`$${method || 'get'}`]: `~~` + 
                            `{ response: ReturnType<(typeof import('${handler}'))['default']> }` +
                            `& (typeof import('${handler}'))['schema']` +
                            `~~`
                    }
                )
                apiRoutes = defu(apiRoutes, r);
            })
            const file = `export type API = ${JSON.stringify(apiRoutes).replaceAll('"~~', '').replaceAll('~~"', '')}`;
            if (fs.existsSync('./.nuxt')) {
                fs.writeFileSync('./.nuxt/.rpc-definition.d.ts', file);
            } else if (fs.existsSync('./.nitro')) {
                fs.writeFileSync('./.nitro/.rpc-definition.d.ts', file);
            } else {
                throw new Error('.nitro or .nuxt directory not found');
            }
        }
        nitro.hooks.addHooks({
            'dev:reload': makeRpcDefinition,
            'types': makeRpcDefinition,
        })
    },
  }) satisfies NitroModule;