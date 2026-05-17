import { useEffect, useState, useRef } from 'react';
import './App.css';
import { DBEntry } from './widgets/DBEntry';
import { DBViewer } from './widgets/DBViewer';
import { PromptGiver } from './widgets/PromptGiver';
import { CardEntry } from './widgets/CardEntry';
import { DataPresentWrapper } from './widgets/DataPresentWrapper';
import { buildApiData, postData, getStatus, getStats } from './apiCalls';



function App() {
  const [totalCount, setTotalCount] = useState(0);
  const [rows,setRows] = useState([[]]);
  const [isReserved, setIsReserved] = useState(false);
  const [giverName, setGiverName] = useState(["",""]);
  const [managersName, setManagersName] = useState("");
  const [uuid, setUuid] = useState(localStorage.getItem("uuid"));

  // Add tab state and tab definitions for top navigation
  const [activeTab, setActiveTab] = useState('promptsTab');
  const tabs = [
    { id: 'viewer', label: 'DB Viewer' },
    { id: 'entry', label: 'DB Entry' },
    { id: 'promptsTab', label: 'Prompt Giver' },
    { id: 'card', label: 'Card Entry' }
    ];
  
  const urlParams = new URLSearchParams(window.location.search);
  const apiKey = urlParams.get("k") || localStorage.getItem("apiKey");
  apiKey ? localStorage.setItem("apiKey", apiKey) : null;

  let reservedPrompts = JSON.parse(localStorage.getItem("reserved"));
  if(reservedPrompts === null){
    reservedPrompts = [];
    localStorage.setItem("reserved", JSON.stringify(reservedPrompts));
  }

  let operators = JSON.parse(localStorage.getItem("operators"));
  if(operators === null){
    operators = [];
    localStorage.setItem("operators", JSON.stringify(operators));
  }

  let prompts = JSON.parse(localStorage.getItem("prompts"));
  if(prompts === null){
    prompts = [];
    localStorage.setItem("prompts", JSON.stringify(prompts));
  }


  const getPromptsSignature = (ps) => (ps || []).map(p=>p.nick).join('|');
  const loadSavedRows = () => {
    try{
      return JSON.parse(localStorage.getItem('rows'));
    }catch(e){ return null; }
  }
  const saveRowsToStorage = (rowsToSave) => {
    const signature = getPromptsSignature(reservedPrompts);
    const payload = { signature, rows: rowsToSave };
    localStorage.setItem('rows', JSON.stringify(payload));
  }

  function makeOperator(firstName,lastName, group = null){
    if(operators.find(n => {
      if(n.firstName === firstName && n.lastName === lastName){
        return true;
      }
      return false;
    }) != null){
      alert(`${firstName} ${lastName}, is already an operator.`);
      return;
    }

    operators.push({firstName:firstName,lastName:lastName, group:group});
    localStorage.setItem("operators", JSON.stringify(operators))
    buildRows();
  }

  function removeOperator(firstName,lastName){
    
        operators = operators.filter(n => n.firstName !== firstName && n.lastName !== lastName);
        localStorage.setItem("operators", JSON.stringify(operators));
        buildRows()
    }

  function makePrompt(description,level,rating,category,nick){
    if(prompts.find(n => n.nick === nick)){
      alert("Nick already in use.");
      return;
    }
    prompts.push({nick:nick,level:level,rating:rating,category:category,description:description,timesUsed:0,totalCards:0,lastUsed:{year:0,month:0,day:0}});
    localStorage.setItem("prompts",JSON.stringify(prompts));
  }

  function promptReserve(prompts){
    reservedPrompts = prompts;
    localStorage.setItem("reserved", JSON.stringify(reservedPrompts));
    const saved = loadSavedRows();
    const newSig = getPromptsSignature(reservedPrompts);
    if(!saved || saved.signature !== newSig){
      localStorage.removeItem('rows');
    }
    buildRows();
    setIsReserved(true);
  }

  function buildRows(){
    const signature = getPromptsSignature(reservedPrompts);
    const saved = loadSavedRows();
    const savedRows = (saved && saved.signature === signature) ? (saved.rows || []) : [];
    const result = [];
    for(const operator of operators){
      const match = savedRows.find(r => r[0] && r[0].firstName === operator.firstName && r[0].lastName === operator.lastName);
      if(match && Array.isArray(match) && match.length === (reservedPrompts.length + 1)){
        const row = [operator, ...match.slice(1)];
        result.push(row);
      } else {
        const row = [operator, ...reservedPrompts.map(()=>false)];
        result.push(row);
      }
    }
    setRows(result);
    saveRowsToStorage(result);
  }
  
  function changeRows(filterFunction){
    const result = rows.map((n,x) => n.map((r,y) => (y===0? r : filterFunction(x,y,r))));
    setRows(result);
    saveRowsToStorage(result);
  }

  function updateRows(index, i, value){
    const result = rows.map((n,x)=> n.map((r,y)=> (x===index && y===i) ? value : r ));
    setRows(result);
    saveRowsToStorage(result);
  }
  
  function updateEntireRow(index){
    const result = rows.map((n,x)=>{
        if(x === index){
          return n.map((r, i) => (i===0? r : (r?false:true)));
        }
        return n;
    });
    setRows(result);
    saveRowsToStorage(result);
    }

  function recordPrompts(){
    let counts = [];
    let date = new Date();
    for(let prompt in reservedPrompts){
      counts.push(0);
    }
    for(let row of rows){
      for(let i in row){
        if(i===0) continue;
        if(row[i]) counts[i-1] = counts[i-1] + 1 ;
      }
    }
    let i = 0;
    for(let prompt of reservedPrompts){
      let target = prompts.find((p)=>{
        return p.nick === prompt.nick;
      });
      target.lastUsed.year = date.getFullYear();
      target.lastUsed.month = date.getMonth();
      target.lastUsed.day = date.getDay();
      target.timesUsed += 1;
      target.totalCards += counts[i];
      i++;
    }
    localStorage.setItem("prompts", JSON.stringify(prompts));
    setTotalCount(counts.reduce((n, acc) => acc + n));
  }

  function setGiver(firstName, lastName){
    setGiverName([firstName,lastName]);
  }
  function setManager(name){
    setManagersName(name);
  }
  function onSubmit(){
    if(!reservedPrompts || reservedPrompts.length === 0){
      alert("Please select prompts before submitting.");
      return false;
    }
    if(managersName.length === 0 || giverName.length === 0 || giverName[0].length === 0 || giverName[1].length === 0){
      alert("Please enter your name, and manager's name before submitting.");
      return false;
    }
    if(!rows.find(row => row.find(r => r === true))){
      alert("Please fill out at least one prompt before submitting.");
      return false;
    }
    alert("Please be sure to inform your peers, so that they are recognized");
    recordPrompts();
    submitData();
    return true;
  }
  async function submitData(){
    let response = await postData(buildApiData({ managersName: managersName, giverName: giverName, rows: rows, prompts: reservedPrompts }));
    console.log("Full response:", response);
    console.log("response.batchId:", response?.batchId);
    console.log("response.error:", response?.error);
    if(response && response.batchId){
      alert("Data submitted successfully! Reference ID: " + response.batchId);
      localStorage.setItem("uuid", response.batchId);
      setUuid(response.batchId);
      //localStorage.removeItem("rows");
      //setRows([[]]);
    } else {
      alert("Data submission failed. Please try again.");
    }
  }

  function renderActiveSection(){
    switch(activeTab){
      case 'viewer':
        return <DBViewer operators={operators} prompts={prompts} removeOperator={removeOperator}/>;
      case 'entry':
        return <DBEntry makeOperator={makeOperator} makePrompt={makePrompt}/>;
      case 'promptsTab':
        return <PromptGiver prompts={prompts} promptReserve={promptReserve} setActiveTab={setActiveTab}/>;
      case 'card':
        if(!isReserved){
          return (
            <div className={"no-reserve"}>
              <div className={"note"}>No prompts reserved. Please reserve prompts first.</div>
              <button className={"go-to-prompts"} onClick={()=>setActiveTab('promptsTab')}>Go to Prompt Giver</button>
            </div>
          );
        }
        return <CardEntry submit={onSubmit} setManager={setManager} setGiver={setGiver} rows={rows} prompts={reservedPrompts} setRows={updateRows} setEntireRow={updateEntireRow} changeRows={changeRows} recordPrompts={recordPrompts} />;
      default:
        return null;
    }
  }


  return (
    <>
      <div className={`app-shell ${activeTab}`}>
        {uuid && <StatusBar uuid={uuid} />}
        <div className='tmTarget'>TM Data{totalCount > 0? ` Total Cards to be Submitted: ${totalCount}`:""}</div>
        <div className="api-target" onClick={() => postData(buildApiData({ managersName: managersName, giverName: giverName, rows: rows, prompts: reservedPrompts }))}>API Data Test Button</div>
        {/* Top tab bar */}
        <nav className="tab-bar">
          {tabs.map(t=> (
            <button
              key={t.id}
              className={`tab ${t.id} ${activeTab===t.id? 'active':''}`}
              onClick={()=>setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main className={`content-area ${activeTab}`}>
          {renderActiveSection()}
        </main>

        <div className={"data-present-wrapper"}>
          <DataPresentWrapper managerName={managersName} giverName={giverName} rows={rows} prompts={reservedPrompts} />
        </div>
      </div>
    </>
  )
}



export default App

function StatusBar({uuid}){
  const [status, setStatus] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    async function updateStatus() {
      let response = await getStatus(uuid);
      let current = response?.status || response;
      setStatus(current);

      while(isMountedRef.current && !(current === "completed" || current === 'completed with failures' )){
        await new Promise(res => setTimeout(res, 3000));
        response = await getStatus(uuid);
        current = response?.status || response;
        setStatus(current);
      }
    }

    updateStatus();

    return () => { isMountedRef.current = false; };
  }, [uuid]);

  return (
    <div className={`statusBar ${status}`}>
      <div className="innerStatusBar">
        <div>Submission Status</div>
        <div className="status">{status}</div>
      </div>
    </div>
  )
}