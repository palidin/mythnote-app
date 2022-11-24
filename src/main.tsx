// 环境变量
// console.log(import.meta.env)
// console.log(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)
// console.log(window.__APP_ENV__)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './assets/style/index.css'

// 严格模式，开发环境组件会被被重复调用，用于提供代码的健壮性
// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
//     <React.StrictMode>
//         <App/>
//     </React.StrictMode>
// )

// import Buffer from "buffer"
// // @ts-ignore
// window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App/>
)
