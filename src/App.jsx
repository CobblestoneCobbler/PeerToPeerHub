import { useState } from 'react';
import './App.css';
import { DBEntry } from './widgets/DBEntry';
import { DBViewer } from './widgets/DBViewer';
import { PromptGiver } from './widgets/PromptGiver';
import { CardEntry } from './widgets/CardEntry';
import { DataPresentWrapper } from './widgets/DataPresentWrapper';




function App() {
  const [totalCount, setTotalCount] = useState(0);
  const [rows,setRows] = useState([[]]);
  const [isReserved, setIsReserved] = useState(false);
  const [giverName, setGiverName] = useState(["",""]);
  const [managersName, setManagersName] = useState("");


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
      console.log(prompts);
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




  /*Starting prompt:
  *   Receive P2P prompts
  *   Enter P2P
  *   DB management
  * 
  * DB:
  *   People
  *   Prompts:
  *     Prompt
  *     Count of times used
  *     Running count Cards Entered
  *       (Average Cards/use)
  *     Last Date used
  *
  * Receive P2P prompts:
  *    Count of prompts{?}
  *    Desired Card Total{?}
  *       filter  :{
  *             Last used date > 1mo ago ? Good : Warn (these should not be prioritized unless needed to satisfy count)
  *
  *         }
  *       Grab biggest Yields until desired card total is met, then grab others at "random", from the lower half of prompts based on average cards/use
  *   VVV
  *   Present prompts and locally save (fault tolerant) for quick entry (Clear by Day Difference)
  *   
  * Enter P2P:
  *   Select prompt (or quick button to jump to adding in db management)
  *   Select from a list of people:
  *     select all, select none
  */
  return (
    <>
      <div>
        <div className='tmTarget'>TM Data{totalCount > 0? ` Total Cards to be Submitted: ${totalCount}`:""}</div>
        <DBViewer operators={operators} prompts={prompts} removeOperator={removeOperator}/>
        <DBEntry makeOperator={makeOperator} makePrompt={makePrompt}/>
        <PromptGiver prompts={prompts} promptReserve={promptReserve}/>
        {isReserved? <CardEntry setManager={setManager} setGiver={setGiver} rows={rows} prompts={reservedPrompts} setRows={updateRows} setEntireRow={updateEntireRow} changeRows={changeRows} recordPrompts={recordPrompts} /> : ""}
        {isReserved? <DataPresentWrapper managerName={managersName} giverName={giverName} rows={rows} prompts={reservedPrompts} /> : ""}
      </div>
    </>
  )
}

export default App
