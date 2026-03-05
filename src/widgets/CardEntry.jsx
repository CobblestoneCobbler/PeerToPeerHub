import { useState } from "react";

export function CardEntry({setManager,setGiver,rows, prompts, changeRows, recordPrompts}){
    const [submitted, setSubmitted] = useState(false);
    const [giverFirstName, setGiverFirstName] = useState("");
    const [giverLastName, setGiverLastName] = useState("");
    const [manager, setManagerName] = useState("");
    const [giver,setGiverBool] = useState(false);

    const groups = {};
    rows.forEach((r, idx) => {
        const g = (r && r[0] && r[0].group) || "Ungrouped";
        if(!groups[g]) groups[g] = [];
        groups[g].push({row: r, idx});
    });

    const gridStyle = { gridTemplateColumns: `200px repeat(${prompts.length}, 1fr)` };

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

                <div className="title-row" style={gridStyle}>
                    <div className="title-name">Operator</div>
                    {prompts.map((p, i)=>{
                        return(
                            <div className="title-prompt" key={`prompt${i}`}>{p.nick}</div>
                        )
                    })}
                </div>

                <div className="switch-all" onClick={()=>{
                    changeRows((x,y,r) => {
                        return r?false:true;
                    })
                }}>Swap all</div>

                {Object.keys(groups).map((groupName)=>{
                    const items = groups[groupName];
                    return (
                        <div className="group-block" key={`group-${groupName}`}>
                            <div className="group-header" onClick={() => {
                                changeRows((x,y,r) => {
                                    if(rows[x] && rows[x][0] && rows[x][0].group === groupName){
                                        return r?false:true;
                                    }
                                    return r;
                                })
                            }}>{groupName}</div>

                            {items.map(({row, idx}) => (
                                operatorRow(row, idx, changeRows, prompts.length)
                            ))}
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

function operatorRow(row, index, changeRows, promptCount){
    const gridStyle = { gridTemplateColumns: `200px repeat(${promptCount}, 1fr)` };

    return (
        <div className="operator-row" style={gridStyle} key={`operator-${index}`}>
            <div className="operator" onClick={() => {
                changeRows((x,y,r) =>{
                    if(x === index){
                        return r?false:true;
                    }
                    return r;
                });
            }}>{row[0].firstName}, {row[0].lastName}</div>

            {row.map((r,i) => {
                if(i === 0) return null;
                return (
                    <div className="checkbox" key={`slot${i}`} onClick={() =>{
                        changeRows((x,y,rp) =>{
                            if(x === index && y === i){
                                return rp?false:true;
                            }
                            return rp;
                        })
                    }}>{r?"✅":"❌"}</div>
                )
            })}
        </div>
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