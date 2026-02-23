export function Popup(){

}

function buildCard(props){
    let giver = props.giver? props.giver : null;
    

    return(
    <>
    <div className="card">
        <div className="info">
            <div className="title"></div>

        </div>
        <div className="entry">
            <form onSubmit={()=>{
                
            }}>
                <input type="text" placeholder="Recognized Employee First Name" />
                <input type="text" placeholder="Recognized Employee Last Name" />
                {giver? "" : 
                    <> 
                        <input type="text" name="firstName" id="firstName" />
                        <input type="text" name="lastName" id="lastName" />
                    </>
                }
            </form>
            
        </div>
    </div>
    </>
    );
}