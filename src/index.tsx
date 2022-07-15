import ReactDom from 'react-dom';
import { useState, useRef, useEffect } from 'react';
import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin'

const App = () => {
    const [input, setInput] = useState('');
    const [code, setCode] = useState('');
    const esBuildService = useRef<any>();

    const startService = async () => {
        return esBuildService.current = await esbuild.initialize({
            worker: true,
            wasmURL: '/esbuild.wasm'
        })
    };

    // useEffect( () => {
    //     startService();
    // }, []);

    const onSubmit = async () => {
        if (!esBuildService) {
            return;
        }

        const result = startService().then(() => {esbuild.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            format: 'iife',
            plugins: [unpkgPathPlugin()]
        })});
    }

    return <div>
        <textarea value={input} onChange={(e) => {setInput(e.target.value)}} cols={30} rows={5}></textarea>
        <div>
            <button onClick={onSubmit}>Submit</button>
        </div>
        <pre>{code ? code : 'Code transpiling result will be here'}</pre>
    </div>
};

ReactDom.render(<App/>, document.querySelector('#root'));