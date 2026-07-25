import { useEffect, useState, useRef, useCallback, createContext, useContext } from 'react';
import { DBEntry } from './widgets/DBEntry';
import { DBViewer } from './widgets/DBViewer';
import { PromptGiver } from './widgets/PromptGiver';
import { CardEntry } from './widgets/CardEntry';
import { buildApiData, postData, getStatus } from './apiCalls';
import { DBEntryTutorial, PromptGiverTutorial, CardEntryTutorial, DBViewerTutorial } from './widgets/Tutorial';

const ToastContext = createContext();
export function useToast() { return useContext(ToastContext); }

let toastId = 0;

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, duration);
  }, []);
  return (
    <ToastContext.Provider value={addToast}>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}${t.leaving ? ' leaving' : ''}`}>{t.message}</div>
        ))}
      </div>
      <AppInner />
    </ToastContext.Provider>
  );
}

function AppInner() {
  const addToast = useToast();
  const [rows,setRows] = useState([[]]);
  const [isReserved, setIsReserved] = useState(false);
  const [giverName, setGiverName] = useState(["",""]);
  const [managersName, setManagersName] = useState("");
  const [uuid, setUuid] = useState(localStorage.getItem("uuid"));
  const [waitTime, setWaitTime] = useState(0);
  const [tutorialsSeen, setTutorialsSeen] = useState(JSON.parse(localStorage.getItem("tutorialsSeen")) || [0,0,0,0]);
  
  // Add tab state and tab definitions for top navigation
  const [activeTab, setActiveTab] = useState(('promptsTab'));
  const tabs = [
    { id: 'viewer', label: 'DB Viewer' },
    { id: 'entry', label: 'DB Entry' },
    { id: 'promptsTab', label: 'Prompt Giver' },
    { id: 'card', label: 'Card Entry' }
    ];
  
  const urlParams = new URLSearchParams(window.location.search);
  const apiKey = urlParams.get("k") || localStorage.getItem("apiKey");
  apiKey ? localStorage.setItem("apiKey", apiKey) : null;

  function closeTutorial(index){
    const updated = [...tutorialsSeen];
    updated[index] = 1;
    localStorage.setItem("tutorialsSeen", JSON.stringify(updated));
    setTutorialsSeen(updated);
  }

  function resetTutorial(index){
    const updated = [...tutorialsSeen];
    updated[index] = 0;
    localStorage.setItem("tutorialsSeen", JSON.stringify(updated));
    setTutorialsSeen(updated);
  }


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

  useEffect(() => {
    if(reservedPrompts && reservedPrompts.length > 0){
      promptReserve(reservedPrompts);
    }
    if((activeTab === 'promptsTab' || activeTab === "card" ) && (!prompts.length > 0 || !operators.length > 0)){
      setActiveTab("entry");
    }
  }, []);


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
      addToast(`${firstName} ${lastName} is already an operator.`, 'error');
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
      addToast("Nickname already in use.", 'error');
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
  }

  function setGiver(firstName, lastName){
    setGiverName([firstName,lastName]);
  }
  function setManager(name){
    setManagersName(name);
  }
  function onSubmit(){

    if(waitTime && Date.now() < waitTime){
      const secs = Math.ceil((waitTime - Date.now()) / 1000);
      addToast(`Please wait ${secs} second${secs !== 1 ? 's' : ''} before submitting again.`, 'error');
      return false;
    }

    if(!reservedPrompts || reservedPrompts.length === 0){
      addToast("Please select prompts before submitting.", 'error');
      return false;
    }
    if(managersName.length === 0 || giverName.length === 0 || giverName[0].length === 0 || giverName[1].length === 0){
      addToast("Please enter your name and manager's name before submitting.", 'error');
      return false;
    }
    if(!rows.find(row => row.find(r => r === true))){
      addToast("Please fill out at least one prompt before submitting.", 'error');
      return false;
    }
    addToast("Please be sure to inform your peers so that they are recognized.", 'info');
    recordPrompts();
    submitData();
    return true;
  }
  async function submitData(){
    if(waitTime && Date.now() < waitTime){
      console.log('Submission blocked by cooldown.');
      return;
    }

    setWaitTime(Date.now() + 2 * 6000);


    let response = await postData(buildApiData({ managersName: managersName, giverName: giverName, rows: rows, prompts: reservedPrompts }));
    if(response && response.batchId){
      addToast("Data submitted successfully! Reference ID: " + response.batchId, 'success', 8000);
      localStorage.setItem("uuid", response.batchId);
      setUuid(response.batchId);
      localStorage.removeItem("rows");
      setRows([[]]);
      reservedPrompts = [];
      localStorage.setItem("reserved", JSON.stringify(reservedPrompts));
      setIsReserved(false);
    } else if (response?.error) {
      addToast(response.message || "Data submission failed. Please try again.", 'error');
    } else {
      addToast("Data submission failed. Please try again.", 'error');
    }
  }
  const tutorialComponents = {
    'viewer': DBViewerTutorial,
    'entry': DBEntryTutorial,
    'promptsTab': PromptGiverTutorial,
    'card': CardEntryTutorial
  };

  function renderTutorial(){
    const tabIndex = tabIndexMap[activeTab];
    const TutorialComponent = tutorialComponents[activeTab];
    
    if(TutorialComponent && !tutorialsSeen[tabIndex]){
      return <TutorialComponent onClose={() => closeTutorial(tabIndex)}/>;
    }
    return null;
  }


  function renderActiveSection(){
    switch(activeTab){
      case 'viewer':
        return <DBViewer operators={operators} prompts={prompts} removeOperator={removeOperator}/>;
      case 'entry':
        return <DBEntry makeOperator={makeOperator} makePrompt={makePrompt}/>;
      case 'promptsTab':
        if(!prompts || prompts.length === 0){
          return (
            <div className={"no-prompts"}>
              <div className={"note"}>No prompts available. Please add prompts first.</div>
              <button className={"go-to-entry"} onClick={()=>setActiveTab('entry')}>Go to DB Entry</button>
            </div>
          );
        }
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


  const tabIndexMap = { 'viewer': 0, 'entry': 1, 'promptsTab': 2, 'card': 3 };

  return (
    <>
      <div className={`app-shell ${activeTab}`}>
        <NavBar tutorialReset={() => resetTutorial(tabIndexMap[activeTab])}/>
        {uuid && <StatusBar uuid={uuid} />}
        {renderTutorial()}
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
      </div>
    </>
  )
}



export default ToastContainer

function StatusBar({uuid}){
  const [status, setStatus] = useState(null);
  const [totalCards, setTotalCards] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [failedCards, setFailedCards] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    async function updateStatus() {
      let response = await getStatus(uuid);

      if (response?.error) {
        setStatus(response.status || "error");
        return;
      }

      let current = response?.status || response;
      setStatus(current);
      setTotalCards(response?.totalCards || 0);
      setTotalJobs(response?.totalJobs || 0);
      setFailedCards(response?.failedCards || 0);

      while(isMountedRef.current && !(current === "completed" || current === 'completed with failures' )){
        await new Promise(res => setTimeout(res, 30000));
        response = await getStatus(uuid);

        if (response?.error) {
          setStatus(response.status || "error");
          break;
        }

        current = response?.status || response;
        setStatus(current);
        setTotalCards(response?.totalCards || 0);
        setFailedCards(response?.failedCards || 0);
      }
    }

    updateStatus();

    return () => { isMountedRef.current = false; };
  }, [uuid]);

  const statusLabel = status === "not_found" ? "Submission not found" : status === "error" ? "Error checking submission status" : status;

  return (
    <div className={`statusBar ${status}`}>
      <div className="innerStatusBar">
        <div>Submission Status</div>
        <div className="status">{status === null ? "Checking..." : statusLabel}</div>
        <div className="stats">
          <div>Total Cards: {totalCards}</div>
          {failedCards !== 0 && <div className="failed-cards">Failed Cards: {failedCards}</div>}
        </div>
      </div>
    </div>
  )
}

function NavBar({tutorialReset}){
  return(
    <div className="navBar">
      <div className="home" onClick={() => window.location.href = "/"}>HOME</div>
      <div className="contact-me" onClick={() =>{
        window.location.href = `mailto:johnathan.p.terry@outlook.com?subject=Contact%20about%20Terry%20HQ&body=I'm reaching out to you about`;
      }}>CONTACT</div>
      <div className="tutorial" onClick={() => tutorialReset()}>HELP</div>
    </div>
  )
}