import { useState } from "react";
import "./css/DBEntry.css";
import "./css/DBViewer.css";

export function DBViewer({operators, prompts, removeOperator}){
    const [active, setActive] = useState(false);
    


    return (
        <>
        <div className="DBViewer-Container" onClick={(e)=>{
            if(e.target.classList.contains("DBViewer-Container")) setActive(active?false:true);
        }}>
            <div>Database Viewer</div>
            {active &&
            <div className="wrapper">
                <div className="operators">
                    {operators.map((op)=>{
                        return <OperatorCard op ={op} removeOperator={removeOperator} />;
                    })}
                </div>
                <div className="prompts">
                    {prompts.map((p)=>{
                        return promptCard(p);
                    })}
                </div>
            </div>
            }
        </div>
        </>
    );
}

function promptCard(p) {


    return (
        <div key={p.nick} className ="promptCard">
            <div>{p.nick}</div>
            <div className="data-container">
                <div className="basicPromptInfo">
                    <div>{p.level}</div>
                    <div>{p.rating}</div>
                    <div>{p.category}</div>
                </div>
                <div className="stats">
                    <div>{`Times used: ${p.timesUsed}`}</div>
                    <div>{`Total cards: ${p.totalCards}`}</div>
                    <div>{`Average cards: ${Math.floor(p.totalCards / p.timesUsed)}`}</div>
                </div>
            </div>
            <div className="desc">{p.description}</div>
        </div>
    )
}

function OperatorCard({op,removeOperator}) {
    const [primed, setPrimed] = useState(false);

    return (
        
        <div key={`${op.firstName}-${op.lastName}`} className="opCard">
            <div>{`${op.firstName} ${op.lastName}`}</div>
            <div>{op.group}</div>
            {primed? <button className="Warning" onClick={()=> removeOperator(op.firstName, op.lastName)}>Are You Sure?</button> : <button onClick={() => setPrimed(true)
            }>Delete Operator</button>}
        </div>
        
    )
}



//TODO add delete functionality for both prompts and operators. For prompts, also add the ability to edit the prompt details.