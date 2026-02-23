export function DBViewer(operators, prompts){



    return (
        <>
        <div class="DBViewer">
            <div className="prompts">
                {prompts.map((p)=>{
                    return promptCard(p);
                })}
            </div>
            <div className="operators">
                {operators.map((op)=>{
                    return operatorCard(op);
                })}
            </div>
        </div>
        </>
    );
}

function promptCard(p) {


    return (
        <>
        <div class="promptCard">
            <div className="basicPromptInfo">
                <div>{p.nick}</div>
                <div>{p.level}</div>
                <div>{p.rating}</div>
                <div>{p.category}</div>
            </div>
            <div className="desc">{p.description}</div>
            <div className="stats">
                <div>{`Times used: ${p.timesUsed}`}</div>
                <div>{`Total cards: ${p.totalCards}`}</div>
                <div>{`Average cards: ${Math.floor(p.totalCards / p.timesUsed)}`}</div>
            </div>
        </div>
        </>
    )
}

function operatorCard(op) {


    return (
        <>
        <div class="opCard">
            <div>{op.firstName}</div>
            <div>{op.lastName}</div>
            <div>{op.group}</div>
        </div>
        </>
    )
}

function removeOperator(firstName,lastName){
    //filter for n.firstName === firstName && n.lastName === lastName
}