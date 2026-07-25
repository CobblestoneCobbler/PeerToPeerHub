export function buildApiData({rows, prompts, giverName, managersName}){
    const result = {
        //just bools for matrix
        matrix: [],
        names: [],
        //prompts {prompt: {level, rating, category, description}}
        prompts: [],
        giverName: {
            firstName: giverName[0],
            lastName: giverName[1]
        },
        managersName: managersName
    };
    for(let prompt of prompts){
        result.prompts.push({
            level: prompt.level,
            rating: prompt.rating,
            category: prompt.category,
            description: prompt.description
        });
    }
    for(let row of rows){
        let operator = row[0];
        let isUsed = false;
        let i = 1;
        for(let prompt of prompts){
            if(row[i]){
                isUsed = true;
                break;
            }
            i++;
        }
        if(isUsed){
            result.names.push({
                firstName: operator.firstName,
                lastName: operator.lastName
            });
            result.matrix.push(row.slice(1));
        }
    }
    console.log(result);
    return result;
}

export async function postData(data){
    try {
        const apiKey = localStorage.getItem("apiKey");
        if(!apiKey){
            alert("API key not found. Please scan the QR code to get access.");
            throw new Error("API key not found. Please scan the QR code to get access.");
        }
        const res = await fetch("https://terryhq.org/api/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey
            },
            body: JSON.stringify(data)
    });

        if (!res.ok) {
            let errorMsg = `Server error: ${res.status}`;
            try {
                const errorBody = await res.json();
                if (errorBody?.message) errorMsg = errorBody.message;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        try {
            return await res.json();
        } catch (parseErr) {
            console.error("Failed to parse JSON response:", parseErr);
            return { error: true, message: "Failed to parse server response" };
        }
    } catch (err) {
        console.error("Submit failed:", err);
        return { error: true, message: err.message };
    }
}

export async function getStatus(uuid){
    try {
        const apiKey = localStorage.getItem("apiKey");
        if(!apiKey){
            alert("API key not found. Please scan the QR code to get access.");
            throw new Error("API key not found. Please scan the QR code to get access.");
        }
        const res = await fetch(`https://terryhq.org/api/status/${uuid}`, {
            method: "GET",
            headers: {
                "x-api-key": apiKey
            }
        });

        if (res.status === 404) {
            return { error: true, message: "Batch not found", status: "not_found" };
        }

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        try {
            return await res.json();
        } catch (parseErr) {
            console.error("Failed to parse JSON response:", parseErr);
            return { error: true, message: "Failed to parse server response" };
        }
    } catch (err) {
        console.error("Get status failed:", err);
        return { error: true, message: err.message };
    }
}

export async function getStats(){
    try {
        const apiKey = localStorage.getItem("apiKey");
        if(!apiKey){
            alert("API key not found. Please scan the QR code to get access.");
            throw new Error("API key not found. Please scan the QR code to get access.");
        }
        const res = await fetch(`https://terryhq.org/api/stats`, {
            method: "GET",
            headers: {
                "x-api-key": apiKey
            }
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        try {
            return await res.json();
        } catch (parseErr) {
            console.error("Failed to parse JSON response:", parseErr);
            return { error: true, message: "Failed to parse server response" };
        }
    } catch (err) {
        console.error("Get stats failed:", err);
        return { error: true, message: err.message };
    }
}
