import { useState } from "react";

export function DBEntryTutorial({onClose}){
    const [currentStep, setStep] = useState(0);

    const steps = [
        "At the top of this section, you can add each operators name, and assign them to a group. This group is for personal use. Suggestions are either different sections, or different types of jobs, like normal assembly, hoist operators, material handelers or forklift drivers.",
        "At the bottom, each prompt is created. This is what you're recognising the operator for. The description is what will be actually put on the card. Since this can be lengthy, a nickname will be what you see while entering cards.",
        "For each prompt, you must set their ratings. Low is set by default, Generally this is for safe actions that are not immediate threats, such as PPE, cleanliness, or general safe actions. Medium is for more immediate threats that would result in first aid, such as potential lacerations, sprains or strains, or minor impacts. High is for actions that could result in a hospital visit or fatality, or a near miss of one (If one condition changed, it would have resulted in a hospital visit or fatality). If you use these, you should notify your section manager so higher prevention can be put in place.",
        "Category is describing what type of safety threat this falls under. The default is Safety, but common others would be Ergonomic, or chemical."
    ];
    if(currentStep >= steps.length) onClose();

    return currentStep < steps.length ? (
        <TutorialModal 
            title="DB Entry"
            text={steps[currentStep]}
            onOkay={() => setStep(prev => prev + 1)}
        />
    ) : null;
}

export function PromptGiverTutorial({onClose}){
    const [currentStep, setStep] = useState(0);

    const steps = [
        "The first Section of prompt giver is designed to give prompts to you based on least recently used. (Not implemented yet) The Target number would check how many cards are made on average per prompt and set enough to hit the target.",
        "Below the auto-prompt section, you will find the List Prompts button. This will give you all your created prompts to choose from. Click each to toggle, then Submit at the bottom to start entry."
    ];
    if(currentStep >= steps.length) onClose();

    return currentStep < steps.length ? (
        <TutorialModal 
            title="Prompt Giver"
            text={steps[currentStep]}
            onOkay={() => setStep(prev => prev + 1)}
        />
    ) : null;
}

export function CardEntryTutorial({onClose}){
    const [currentStep, setStep] = useState(0);

    const steps = [
        "At the top of the card entry, You will have a spot to put your name and section manager's name to receive credit.",
        "Below that, you will find the prompts you selected in the prompt giver.",
        "Each operator will have a toggle for each prompt. Clicking the x or check will toggle to the other. A card will be made for each check.",
        "Entering each indivial card would be time consuming, so each operator's name can be clicked to toggle their entire row. Likewise, each group can be clicked to toggle all operators' rows under that group."
    ];
    if(currentStep >= steps.length) onClose();

    return currentStep < steps.length ? (
        <TutorialModal 
            title="Card Entry"
            text={steps[currentStep]}
            onOkay={() => setStep(prev => prev + 1)}
        />
    ) : null;
}

export function DBViewerTutorial({onClose}){
    const [currentStep, setStep] = useState(0);

    const steps = [
        "Here you can find a list of all operators added, along with their group. Under each, a delete button will remove them from the system. To prevent accidental deletions, you must click a confirmation.",
        "In this section, you can view various statistics related to the operators and prompts, such as usage frequency and performance metrics. You can also read the hidden description that will be put in each card."
    ];
    if(currentStep >= steps.length) onClose();

    return currentStep < steps.length ? (
        <TutorialModal 
            title="DB Viewer"
            text={steps[currentStep]}
            onOkay={() => setStep(prev => prev + 1)}
        />
    ) : null;
}

function TutorialModal({title, text, className = null, onOkay}){

    return (
        <div className={`tutorial-modal ${className}`}>
            <h2>{title}</h2>
            <p>{text}</p>
            <div className="okay" onClick={onOkay}>Okay</div>
        </div>
    );
}