import { useState } from "react";

export function CardEntry({setManager,setGiver,rows, prompts, changeRows, recordPrompts}){
    const [submitted, setSubmitted] = useState(false);
    const [giverFirstName, setGiverFirstName] = useState("");
    const [giverLastName, setGiverLastName] = useState("");
    const [manager, setManagerName] = useState("");
    const [giver,setGiverBool] = useState(false);
    //TODO Headers, Rows And columns
    //Operators are row Headers
    //Prompts are Column headers
    //Build array to store bools
    //  Allow operators by group select all / deselect all

    //TODO Local store reserve vs rows. due to refresh safe
    return (
        <>
            <div className="CardEntrySection">
                <div>Card Entry</div>
                {!giver && <div className="GiverEntry">

                    {/*TODO Submit attempt on loose focus? */}
                    <input type="text" id="giverFirstName" placeholder="Your First Name" value={giverFirstName} onChange={(e)=>{
                        setGiverFirstName(e.target.value);
                    }}/>
                    <input type="text" id="giverLastName" placeholder="Your Last Name" value={giverLastName} onChange={(e)=>{
                        setGiverLastName(e.target.value);
                    }}/>
                    <input type="text" id="managerName" placeholder="Manager Full Name" value={manager} onChange={(e)=>{
                        setManagerName(e.target.value);
                    }}/>
                    <div className="submit" onClick={()=>{
                        if(giverFirstName==="" || giverLastName === ""){
                            alert("You must provide your name");
                            return;
                        }
                        if(manager === ""){
                            alert("You must provide a manager name")
                            return;
                        }
                        setManager(manager);
                        setGiver(giverFirstName,giverLastName);
                        setGiverBool(true);

                    }}>Submit</div>
                </div>}
                <div className="title-row">
                    {prompts.map((p, i)=>{
                        
                        return(
                            <div key={`prompt${i+1}`}>
                                {`${i+1}. ${p.nick}`}
                            </div>
                        )
                    })}
                </div>
                <div className="switch-all" onClick={()=>{
                    changeRows((x,y,r) => {
                        return r?false:true;
                    })
                }}>Swap all</div>
                {/*TODO switch this to be 2 flex boxes, operator names, and checklist
                    OR Align left and right for each "justify space inbetween"*/ }
                {rows.map((n,index)=>{
                    
                    return (
                            <div className="operator-row" key={`row${index}`}>
                                {operatorRow(n,index, changeRows)}
                            </div>
                    )
                })}
                {submitted? "":<div className="submit" onClick={()=>{
                    if(!giver){
                        alert("You must provide a name");
                        return;
                    }
                    recordPrompts();
                    setSubmitted(true);
                }}>Submit Counts</div>}
            </div>
        </>
    );
}

function operatorRow(row, index, changeRows){
    
    
    return (

        <>
            <div className="operator" onClick={()=>{
                changeRows((x,y,r) =>{
                    if(x === index){
                        return r?false:true;
                    }
                    return r;
                });
            }}>{row[0].firstName}, {row[0].lastName}</div>
            <div className="checklist">
                {row.map((r,i) => {
                    if(i=== 0){
                        return;
                    }
                    return (<div className="checkbox" key={`slot${i}`} onClick={() =>{
                        changeRows((x,y,rp) =>{
                            if(x === index && y === i){
                                return rp?false:true;
                            }
                            return rp;
                        })
                    }}>{r?"✅":"❌"}</div>);
                })}
            </div>
        </>
    )

}

function setPrompt(rows, i, state){
    for(let row of rows){
        row[i] = state;
    }
    return rows;
}

function setGroup(rows, group, i, state){
    for(let row of rows){
        if(row[0].group === group){
            row[i] = state;
        }
    }
    return rows;
}