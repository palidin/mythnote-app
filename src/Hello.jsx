import {state} from "./store/state.tsx";

function Hello({count}) {
    return <div>
        <p>hello3324</p>
        <p>{count}</p>
        <p>resso value: {state.count}</p>
    </div>
}

export default Hello