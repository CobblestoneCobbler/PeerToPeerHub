import { useState } from "react";
import "./css/DBEntry.css";
import "./css/DBViewer.css";

export function DBViewer({operators, prompts, removeOperator}){
    return (
        <>
        <div className="DBViewer-Container viewer">
            <div>Database Viewer</div>
            <div className="wrapper">
                <div className="operators">
                    {operators.map((op,n)=>{
                        return <OperatorCard op ={op} removeOperator={removeOperator} key={n} />;
                    })}
                </div>
                <div className="prompts">
                    {prompts.map((p)=>{
                        return promptCard(p);
                    })}
                </div>
            </div>
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
    const [disabled, setDisabled] = useState(false);

    const handleConfirm = () => {
        if(disabled) return;
        setDisabled(true);
        setPrimed(false);
        // delay actual removal until end of debounce to avoid accidental double taps
        setTimeout(() => {
            removeOperator(op.firstName, op.lastName);
            setDisabled(false);
        }, 1000);
    };

    const armPrimed = () => {
        setPrimed(true);
        // auto-reset primed after 3s so it doesn't stay waiting indefinitely
        setTimeout(() => setPrimed(false), 3000);
    };

    return (
        <div key={`${op.firstName}-${op.lastName}`} className="opCard">
            <div>{`${op.firstName} ${op.lastName}`}</div>
            <div>{op.group}</div>
            {primed ? (
                <button className="Warning" disabled={disabled} onClick={handleConfirm}>Are You Sure?</button>
            ) : (
                <button onClick={armPrimed}>Delete Operator</button>
            )}
        </div>
    )
}


//TODO add delete functionality for both prompts and operators. For prompts, also add the ability to edit the prompt details.