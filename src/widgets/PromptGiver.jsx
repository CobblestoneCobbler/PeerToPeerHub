import { useState } from "react";

export function PromptGiver({prompts, promptReserve, setActiveTab}){
    
    return(
        <>
            <div className="PromptGiver promptsTab">
                <div>Prompt Giver</div>
                <PromptDisplay prompts={prompts} promptReserve={promptReserve} setActiveTab={setActiveTab} />
                <ListPrompts prompts={prompts} promptReserve={promptReserve} setActiveTab={setActiveTab} />
            </div>
        </>
    );
}

//TODO Factor in target Value
function PromptDisplay({prompts,promptReserve, setActiveTab}){
    const [quantity, setQuantity] = useState(5);
    const [targetCount, setTargetCount] = useState(200);


    return (
        <>
            <div>
                <form onSubmit={(e)=>{
                    e.preventDefault();
                    promptReserve(getPrompts(prompts, quantity));
                    if(typeof setActiveTab === 'function') setActiveTab('card');
                    if(typeof window !== 'undefined' && typeof window.scrollTo === 'function'){
                        window.scrollTo({top:0, behavior:'smooth'});
                    }
                }}>
                    <div>Number of Prompts</div>
                    <input type="text" inputMode="numeric"   value={quantity} required onChange={(e) => {
                        if(Number.isInteger(Number(e.target.value))) setQuantity(e.target.value);
                    }}/>
                    <div>Target Number of Cards (Unused)</div>
                    <input type="text" inputMode="numeric"  value={targetCount} required onChange={(e) => {
                        if(Number.isInteger(Number(e.target.value))) setTargetCount(e.target.value);
                    }}/>
                    <button type="submit" className="submit">Submit</button>
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

function ListPrompts({prompts,promptReserve, setActiveTab}){
    const [display,setDisplay] = useState(false);
    const [selected, setSelected] = useState({});


    return(
        <>
            <div className="promptList">
                <div className="title list-prompts" onClick={()=>setDisplay(display? false:true)}>List Prompts</div>
                {display && <div className="list">
                    {getPrompts(prompts, prompts.length).map((n,i)=>(
                        <div key={n.nick} className={`prompt ${selected[n.nick]? "active": "" }`} onClick={()=>{setSelected(prev => ({...prev, [n.nick]: !prev[n.nick]}))}}>{n.nick}</div>
                    ))}
                    <div className="submit submit-sticky" onClick={()=>{
                        const stored = prompts.filter(n=>selected[n.nick]);
                        promptReserve(stored);
                        if(typeof setActiveTab === 'function') setActiveTab('card');
                        if(typeof window !== 'undefined' && typeof window.scrollTo === 'function'){
                            window.scrollTo({top:0, behavior:'smooth'});
                        }
                    }}>Confirm Selection</div>
                </div>}
            </div>
        </>
    )
}

