import axios from 'axios';
import * as esbuild from 'esbuild-wasm';
import { OnLoadResult } from 'esbuild-wasm';
import localForage from 'localforage';

const fileCache = localForage.createInstance({
  name: 'filecache'
});

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResolve', args);
        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' };
        } 

        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href
          };
        }

        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        }
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);

        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: `
              const react = require('react');
              const reactDom = require('react-dom');
              const axios = require('axios');
            `,
          };
        }

        let cachedItem = await fileCache.getItem<OnLoadResult>(args.path);
        if (!cachedItem) {
          const {data, request} = await axios.get(args.path);
          cachedItem = {
            loader: 'jsx',
            contents: data,
            resolveDir: new URL('./', request.responseURL).pathname
          };
          fileCache.setItem(args.path, cachedItem);
        }
        return cachedItem; 
      });
    },
  };
};
