import { useState } from "react";

export function PromptGiver({prompts, promptReserve}){
    const [active,setActive] = useState(false);
    


    return(
        <>
            <div className="PromptGiver" onClick={(e)=>{
                if(e.target.classList.contains("PromptGiver")) setActive(active?false:true);
            }}>
                <div>Prompt Giver</div>
            {active && <PromptDisplay prompts={prompts} promptReserve={promptReserve} setActive={setActive}/>}
            {active && <ListPrompts prompts={prompts} promptReserve={promptReserve} setActive={setActive}/>}
            </div>
        </>
    );
}

//TODO Factor in target Value
function PromptDisplay({prompts,promptReserve, setActive}){
    const [quantity, setQuantity] = useState(5);
    const [targetCount, setTargetCount] = useState(200);


    return (
        <>
            <div>
                <form onSubmit={(e)=>{
                    e.preventDefault();
                    promptReserve(getPrompts(prompts, quantity));
                    setActive(false);
                }}>
                    <div>Number of Prompts</div>
                    <input type="text" inputMode="numeric"   value={quantity} required onChange={(e) => {
                        if(Number.isInteger(Number(e.target.value))) setQuantity(e.target.value);
                    }}/>
                    <div>Target Number of Cards (Unused)</div>
                    <input type="text" inputMode="numeric"  value={targetCount} required onChange={(e) => {
                        if(Number.isInteger(Number(e.target.value))) setTargetCount(e.target.value);
                    }}/>
                    <input type="submit" />
                </form>
            </div>
        </>
    )
}

function getPrompts(prompts, quantity){
    let sortedPrompts = prompts.sort((a,b)=>{
        if(a.lastUsed.year === b.lastUsed.year){
            if(a.lastUsed.month === b.lastUsed.month){
                return a.lastUsed.day - b.lastUsed.day;
            }
            return a.lastUsed.month - b.lastUsed.month;
        }
        return a.lastUsed.year - b.lastUsed.year;
    })
    let result = [];
    for(let i = 0; i<quantity && i<sortedPrompts.length; i++){
        result.push(sortedPrompts[i]);
    }
    return result;
}

function ListPrompts({prompts,promptReserve, setActive}){
    const [display,setDisplay] = useState(false);
    //use i:i, bool

    const [selected, setSelected] = useState(prompts.map(()=>false));


    return(
        <>
            <div className="promptList">
                <div className="title" onClick={()=>setDisplay(display? false:true)}>List Prompts</div>
                {display && <div className="list">
                    {getPrompts(prompts, prompts.length).map((n,i)=>(
                        <div key={i} className={`prompt ${selected[i]? "active": "" }`} id={`prompt${i}`} onClick={()=>{setSelected(prev => toggle(prev, i))}}>{n.nick}</div>
                    ))}
                    <div className="submit" onClick={()=>{
                        const stored = prompts.filter((n,i)=>selected[i]);
                        promptReserve(stored);
                        setActive(false);
                    }}>Confirm Selection</div>
                </div>}
            </div>
        </>
    )
}

function toggle(array, i){
    let output = [...array];
    output[i] = !output[i];
    return output;
}