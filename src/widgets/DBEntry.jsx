import "./css/DBEntry.css"
import { useState } from "react";

//TODO Maybe make this as an idea but let app do this, then call the appropriate. also change make operator to more localized (assuming local storage setting can be done outside of the parent app since the app itself doesnt need it till input)
export function DBEntry({makeOperator, makePrompt}){
    const [active, setActive] = useState(false);
    return (
    <>
        <div className="DBEntry-Container" onClick={(e)=>{
            if(e.target.classList.contains("DBEntry-Container"))setActive(active?false:true)
        }}>
            <div>Database Entry</div>
            {active && <OperatorEntry makeOperator={makeOperator}/>}
            {active && <PromptEntry makePrompt={makePrompt}/>}
        </div>
    </>
    );
}


//TODO OnSubmit
function OperatorEntry({makeOperator}){
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [group, setGroup] = useState("");
    return (
        <>
            <div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if(firstName === "" || lastName === ""){
                        alert("Both names must be filled out.");
                        return;
                    }
                    makeOperator(firstName,lastName, group);
                    setFirstName("");
                    setLastName("");
                }}>
                    <div>Enter an Operator</div>
                    <div className="input-set">
                        <input type="text" id="firstName" placeholder="First Name" value={firstName} onChange={(e)=>{
                            setFirstName(e.target.value);
                        }} />
                        <input type="text" id="lastName" placeholder="Last Name" value={lastName} onChange={(e)=>{
                                setLastName(e.target.value);
                            }}/>
                        <input type="text" id="group" placeholder="Group" value={group} onChange={(e)=>{
                                setGroup(e.target.value);
                            }}/>
                    </div>
                    <input type="submit" />
                </form>
            </div>
        </>
    );
}

//TODO OnSubmit
function PromptEntry({makePrompt}){
    const [nickname,setNickname] = useState("");
    const [description,setDescription] = useState("");
    const [riskLevel,setRiskLevel] = useState("Low");
    const [riskLevelActive, setRiskLevelActive] = useState(false);
    const [riskRating, setRiskRating] = useState("Condition");
    const [riskRatingActive, setRiskRatingActive] = useState(false);
    const [category,setCategory] = useState("Safety");
    const [categoryActive, setCategoryActive] = useState(false);

    function changeRiskLevel(level){
        setRiskLevel(level);
        setRiskLevelActive(false)
    }
    function changeRiskRating(level){
        setRiskRating(level);
        setRiskRatingActive(false);
    }
    function changeCategory(level){
        setCategory(level);
        setCategoryActive(false);
    }
    return (
        <>
            <div>
                <form onSubmit={(e)=>{
                    e.preventDefault();
                    if(description === "" || nickname === ""){
                        alert("More fields required");
                        return;
                    } 
                    makePrompt(description,riskLevel,riskRating,category,nickname);
                    setNickname("");
                    setDescription("");
                    setRiskLevel("Low");
                    setRiskRating("Condition");
                    setCategory("Safety");
                }}>
                    <div className="selector" id="riskLevel" onClick={()=>{
                        setRiskLevelActive(riskLevelActive? false:true);
                    }}>{riskLevel}</div>
                    {riskLevelActive && riskLevelList(changeRiskLevel)}
                    <div className="selector" id="riskRating" onClick={()=>{
                        setRiskRatingActive(riskLevelActive?false:true);
                    }}>{riskRating}</div>
                    {riskRatingActive && riskRatingList(changeRiskRating)}
                    <div className="selector" id="category" onClick={()=>{
                        setCategoryActive(categoryActive?false:true);
                    }}>{category}</div>
                    {categoryActive && categoryList(changeCategory)}
                    <input type="text" placeholder="Nickname" id="nickname" value={nickname} onChange={(e)=>{
                        setNickname(e.target.value);
                    }}/>
                    <input type="text" placeholder="Description" id="description" value={description} onChange={(e)=>{
                        setDescription(e.target.value);
                    }}/>
                    <input type="submit" />
                </form>
            </div>
        </>
    );
}

//TODO Pass in the raw state
function riskLevelList(setRiskLevel){
    const levels = ["Low","Medium", "High"];
    return(
        <>
            <div className="riskLevelSelector selector">
                {levels.map((n)=>{
                    return(
                        <>
                        <div className={riskLevel===n? "active":""} onClick={()=>{
                            setRiskLevel(n);
                        }}>{n}</div>
                        </>
                    );
                })}
            </div>
        </>
    )
}

function riskRatingList(setRiskRating){
    const levels = ["Condition", "Near Miss"];
    return(
        <>
            <div className="riskRatingSelector selector">
                {levels.map((n)=>{
                    return(
                        <>
                        <div className={riskLevel===n? "active":""} onClick={()=>{
                            setRiskRating(n);
                        }}>{n}</div>
                        </>
                    );
                })}
            </div>
        </>
    )
}
function categoryList(setCategory){
    const levels = ["Ergonomic", "Safety", "Biological","Physical","Chemical"];
    return(
        <>
            <div className="categorySelector selector">
                {levels.map((n)=>{
                    return(
                        <>
                        <div className={category===n? "active":""} onClick={()=>{
                            setCategory(n);
                        }}>{n}</div>
                        </>
                    );
                })}
            </div>
        </>
    )
}