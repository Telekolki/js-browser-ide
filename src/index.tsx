import ReactDom from 'react-dom';
import { useState, useRef, useEffect } from 'react';
import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin'

const App = () => {
    const [input, setInput] = useState('');
    const [code, setCode] = useState('');

    const startService = () => {
        esbuild.initialize({
            worker: true,
            wasmURL: '/esbuild.wasm'
        })
    };

    useEffect( () => {
        startService();
    }, []);

    const onSubmit = async () => {
        const result = await esbuild.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            define: {
                'process.env.NODE_ENV': "production",
                global: 'window',
            },
            plugins: [unpkgPathPlugin()]
        });
        setCode(result.outputFiles[0].text);
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