import { useState } from "react";


    const link = "https://forms.office.com/Pages/ResponsePage.aspx?id=v3exzjsBq0mKnEq84yr8HniBrGBaLHJLi-Yab-L9FZhUMzZVWUdTTVpSTU1TTzZXQjNHSjlPV1ExVCQlQCN0PWcu";

export function PeerToPeerEmbed({prompts, rows, recordPrompts}){
    //TODO window.open
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    return(
        <>
            <div className="SubmissionCenter">
                <form onSubmit={()=>{
                    if(firstName === "" || lastName === ""){
                        alert("Without a name you don't get credit");
                        return;
                    }
                    alert("Generating form pages");
                    submitAll(rows, prompts, firstName, lastName, recordPrompts);
                    setFirstName("")
                    setLastName("");
                }}>
                    <input type="text" placeholder="Your First Name" value={firstName} onChange={(e)=>{
                        setFirstName(e.target.value);
                    }}/>
                    <input type="text" placeholder="Your Last Name" value={lastName} onChange={(e)=>{
                        setLastName(e.target.value);
                    }}/>
                    <input type="submit" />
                </form>
            </div>
        </>
    );
}
function submitAll(rows, prompts, firstName,lastName,recordPrompts){
    let counts = [];
    for(let prompt of prompts){
        counts.push(0);
    }
    for(let row of rows){
        let i = 1
        for(let prompt of prompts){
            if(row[i]){
                setSessionStorage(row[0], prompt, firstName, lastName);
                window.open(link, "_blank");
                counts[i-1]++;
            }
            i++;
        }
    }

    //recordPrompts(prompts, counts);
}

function setSessionStorage(operator, prompt, firstName,lastName){
    const key = "officeforms.answermap.v3exzjsBq0mKnEq84yr8HniBrGBaLHJLi-Yab-L9FZhUMzZVWUdTTVpSTU1TTzZXQjNHSjlPV1ExVCQlQCN0PWcu.";
    let object = [
    {
        "Answer": "5000 Womack",
        "QuestionId": "rd31b7d4f2f4845198460bfd217032f54"
    },
    {
        "Answer": `${firstName}`,
        "QuestionId": "re50c6ea3630f48ddaebb7e84fb606165"
    },
    {
        "Answer": `${lastName}`,
        "QuestionId": "r024a7384b8014ee19135aa41809ee171"
    },
    {
        "Answer": "Jason Willis",
        "QuestionId": "rd8b841d8b79e44a98f7cae514eb659a5"
    },
    {
        
        "Answer": convertToFancy(prompt.level),
        "QuestionId": "r7dac432ab1484e3a9189eb84e54def48"
    },
    {
        "Answer": convertToFancy(prompt.rating),
        "QuestionId": "r06f6e64eb2fb424db60faedf4f89f3ca"
    },
    {
        "Answer": convertToFancy(prompt.category),
        "QuestionId": "r477bef74cffd49c1947b9d919a0a63c9"
    },
    {
        "Answer": "Peer to Peer (You are recognizing another employee for taking action to promote safety in the workplace)",
        "QuestionId": "re9a2174f126f43958598c66557696287"
    },
    {
        "Answer": `${operator.firstName}`,
        "QuestionId": "r19811aa4b4474216867d1f708b6e5e19"
    },
    {
        "Answer": `${operator.lastName}`,
        "QuestionId": "r937dd5b463454ecca83b0440b81fd5ef"
    },
    {
        "Answer": `${prompt.description}`,
        "QuestionId": "r0fd26d10161643fbb518740f447f7b29"
    },
    {
        "Answer": "I certify that I have notified this employee that I am recognizing them.",
        "QuestionId": "rc60a3e7b80d64c5f84e242574d1a2099"
    },
    {
        "Answer": null,
        "QuestionId": "r9659e759fda0428085e54913c9f88ed0"
    },
    {
        "Answer": null,
        "QuestionId": "r09c86a409fb241d1a5d627613100525e"
    }
]


}

function convertToFancy(answer){
    switch(answer){
        case "Low":
            return "Low (examples include small cuts, bruises, or minor burns)";
        case "Medium":
            return "Medium (examples include a sprained ankle after a slip and fall, a strained back from lifting an object improperly, or a deep cut from a machine that requires stitches)";
        case "High":
            alert("A prompt has included a HIGH risk level, Section manager must be notified");
            return "High - IMMEDIATE ACTION REQUIRED: Only select this option if a condition, incident, or near miss could result in fatal or life-altering injury or illness. YOU ARE REQUIRED TO NOTIFY YOUR SECTION MANAGER IMMEDIATELY!";
        case "Condition":
            return "Condition (examples include a large puddle of fluid, damaged tool or fixture, missing PPE, etc.)";
        case "Safety":
            return "Safety (slips, tools, pinch point, etc.)";
        case "Ergonomic":
            return "Ergonomic (strains on body)";
        case "Biological":
            return "Biological (medical)";
        case "Physical":
            return "Physical (noise/air pollution)";
        case "Chemical":
            return "Chemical / Hazardous Liquids";
        default:
            alert(`Converting to Fancy doesn't know what to do with ${answer}`);
    }
}

