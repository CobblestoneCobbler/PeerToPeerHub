import { useState, useEffect, useRef } from "react";
import { capitalizeFirstLetter } from "./helperFunctions";
import { useToast } from "../App";

export function CardEntry({ submit,setManager,setGiver,rows, prompts, changeRows, recordPrompts}){
    const addToast = useToast();
    const [submitted, setSubmitted] = useState(false);
    const [giverFirstName, setGiverFirstName] = useState("");
    const [giverLastName, setGiverLastName] = useState("");
    const [manager, setManagerName] = useState("");
    const [giver,setGiverBool] = useState(false);
    const [collapsed, setCollapsed] = useState({});
    const [stuckGroups, setStuckGroups] = useState({});
    const firstNameRef = useRef(null);

    useEffect(()=>{
        if(!giver && firstNameRef.current){
            firstNameRef.current.focus();
        }
    },[giver]);

    const groups = {};
    rows.forEach((r, idx) => {
        const g = (r && r[0] && r[0].group) || "Ungrouped";
        if(!groups[g]) groups[g] = [];
        groups[g].push({row: r, idx});
    });

    const headerRefs = useRef({});
    const groupNames = Object.keys(groups);

    useEffect(()=>{
        const observer = new IntersectionObserver((entries)=>{
            entries.forEach(entry=>{
                const key = entry.target.dataset.group;
                if(!key) return;
                if(!entry.isIntersecting && entry.boundingClientRect.top < 110){
                    setStuckGroups(prev => ({...prev, [key]: true}));
                } else {
                    setStuckGroups(prev => ({...prev, [key]: false}));
                }
            });
        }, { rootMargin: "-1px 0px 0px 0px", threshold: 0 });

        const refs = headerRefs.current;
        Object.values(refs).forEach(el => el && observer.observe(el));

        return ()=>observer.disconnect();
    }, [groupNames.join(',')]);

    const gridStyle = { gridTemplateColumns: `200px repeat(${prompts.length}, 1fr)` };

    return (
        <>
            <div className="CardEntrySection card">
                <div>Card Entry</div>
                {!giver && <div className="GiverEntry">

                    {/*TODO Submit attempt on loose focus? */}
                    <input ref={firstNameRef} type="text" id="giverFirstName" placeholder="Your First Name" autoComplete="off" value={giverFirstName} onChange={(e)=>{
                        setGiverFirstName(capitalizeFirstLetter(e.target.value));
                    }}/>
                    <input type="text" id="giverLastName" placeholder="Your Last Name" autoComplete="off" value={giverLastName} onChange={(e)=>{
                        setGiverLastName(capitalizeFirstLetter(e.target.value));
                    }}/>
                    <input type="text" id="managerName" placeholder="Manager Full Name" value={manager} onChange={(e)=>{
                        setManagerName(capitalizeFirstLetter(e.target.value));
                    }}/>
                    <div className="submit" onClick={()=>{
                        if(giverFirstName==="" || giverLastName === ""){
                            addToast("You must provide your name.", 'error');
                            return;
                        }
                        if(manager === ""){
                            addToast("You must provide a manager name.", 'error');
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

                {Object.keys(groups).map((groupName)=>{
                    const items = groups[groupName];
                    const isCollapsed = collapsed[groupName];
                    return (
                        <div className={`group-block ${isCollapsed? "collapsed" : ""}`} key={`group-${groupName}`}>
                            <div ref={el => headerRefs.current[groupName] = el} data-group={groupName} className={`group-header ${stuckGroups[groupName]? "stuck" : ""}`} style={gridStyle}>
                                <div className="group-header-left">
                                    <button className="collapse-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        setCollapsed(prev => ({...prev, [groupName]: !prev[groupName]}));
                                    }}>{isCollapsed ? '▶' : '▼'}</button>
                                    <span className="group-name" onClick={() => {
                                        changeRows((x,y,r) => {
                                            if(rows[x] && rows[x][0] && rows[x][0].group === groupName){
                                                return r?false:true;
                                            }
                                            return r;
                                        })
                                    }}>{groupName}</span>
                                </div>
                                {prompts.map((_, pi) => {
                                    const pi1 = pi + 1;
                                    let hasTrue = false, hasFalse = false;
                                    for (const {row} of items) {
                                        if (row[pi1]) hasTrue = true;
                                        else hasFalse = true;
                                        if (hasTrue && hasFalse) break;
                                    }
                                    const status = hasTrue && hasFalse ? 'mixed' : hasTrue ? 'all-true' : 'all-false';
                                    return (
                                        <div key={`gs-${pi1}`} className={`group-status ${status}`} onClick={() => {
                                            changeRows((x,y,r) => {
                                                if(rows[x] && rows[x][0] && rows[x][0].group === groupName && y === pi1){
                                                    return hasTrue && !hasFalse ? false : true;
                                                }
                                                return r;
                                            })
                                        }}>
                                            {status === 'all-true' ? <CheckIcon /> : status === 'mixed' ? <DashIcon /> : <CrossIcon />}
                                        </div>
                                    )
                                })}
                            </div>

                            {!isCollapsed && items.map(({row, idx}) => (
                                operatorRow(row, idx, changeRows, prompts.length)
                            ))}
                        </div>
                    )
                })}

                {submitted? "":<div className="submit submit-sticky" onClick={() =>{ submit()? setSubmitted(true):null;}}>Submit</div>}
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
                    }}>{r ? <CheckIcon /> : <CrossIcon />}</div>
                )
            })}
        </div>
    )
}

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgb(var(--accent-color, 57, 255, 20))' }}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function DashIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'rgb(255, 200, 0)' }}>
            <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
    );
}

function CrossIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255, 60, 60, 0.7)' }}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}
