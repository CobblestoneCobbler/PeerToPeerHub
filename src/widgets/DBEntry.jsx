import { useState, useContext } from "react";
import { capitalizeFirstLetter } from "./helperFunctions";
import { useToast } from "../App";

//TODO Maybe make this as an idea but let app do this, then call the appropriate. also change make operator to more localized (assuming local storage setting can be done outside of the parent app since the app itself doesnt need it till input)
export function DBEntry({makeOperator, makePrompt}){
    return (
    <>
        <div className="DBEntry-Container entry">
            <div>Database Entry</div>
            <OperatorEntry makeOperator={makeOperator}/>
            <PromptEntry makePrompt={makePrompt}/>
        </div>
    </>
    );
}


//TODO OnSubmit
function OperatorEntry({makeOperator}){
    const addToast = useToast();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [group, setGroup] = useState("");
    return (
        <>
            <div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if(firstName === "" || lastName === ""){
                        addToast("Both names must be filled out.", 'error');
                        return;
                    }
                    makeOperator(firstName,lastName, group);
                    setFirstName("");
                    setLastName("");
                }}>
                    <div>Enter an Operator</div>
                    <div className="input-set">
                        <input type="text" id="firstName" placeholder="First Name" value={firstName} autoComplete="off" onChange={(e)=>{
                            setFirstName(capitalizeFirstLetter(e.target.value));
                        }} />
                        <input type="text" id="lastName" placeholder="Last Name" value={lastName} autoComplete="off" onChange={(e)=>{
                                setLastName(capitalizeFirstLetter(e.target.value));
                            }}/>
                        <input type="text" id="group" placeholder="Group" value={group} onChange={(e)=>{
                                setGroup(capitalizeFirstLetter(e.target.value));
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
    const addToast = useToast();
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
                        addToast("Nickname and description are required.", 'error');
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
                        setRiskLevelActive(prev => !prev);
                    }}>{riskLevel}</div>
                    {riskLevelActive && riskLevelList(riskLevel, changeRiskLevel)}
                    <div className="selector" id="riskRating" onClick={()=>{
                        setRiskRatingActive(prev => !prev);
                    }}>{riskRating}</div>
                    {riskRatingActive && riskRatingList(riskRating, changeRiskRating)}
                    <div className="selector" id="category" onClick={()=>{
                        setCategoryActive(prev => !prev);
                    }}>{category}</div>
                    {categoryActive && categoryList(category, changeCategory)}
                    <input type="text" placeholder="Nickname" id="nickname" value={nickname} autoComplete="off" onChange={(e)=>{
                        setNickname(capitalizeFirstLetter(e.target.value));
                    }}/>
                    <input type="text" placeholder="Description" id="description" value={description} autoComplete="off" onChange={(e)=>{
                        setDescription(e.target.value);
                    }}/>
                    <input type="submit" />
                </form>
            </div>
        </>
    );
}

//TODO Pass in the raw state
function riskLevelList(current, setRiskLevel){
    const levels = ["Low","Medium", "High"];
    return(
        <div className="riskLevelSelector selector" key="riskLevelList">
            {levels.map((n)=>(
                <div className={current===n? "active":""} onClick={()=>{ setRiskLevel(n); }} key={n}>{n}</div>
            ))}
        </div>
    )
}

function riskRatingList(current, setRiskRating){
    const levels = ["Condition", "Near Miss"];
    return(
        <div className="riskRatingSelector selector" key="riskRatingList">
            {levels.map((n)=>(
                <div className={current===n? "active":""} onClick={()=>{ setRiskRating(n); }} key={n}>{n}</div>
            ))}
        </div>
    )
}
function categoryList(current, setCategory){
    const levels = ["Ergonomic", "Safety", "Biological","Physical","Chemical"];
    return(
        <div className="categorySelector selector" key="categoryList">
            {levels.map((n)=>(
                <div className={current===n? "active":""} onClick={()=>{ setCategory(n); }} key={n}>{n}</div>
            ))}
        </div>
    )
}