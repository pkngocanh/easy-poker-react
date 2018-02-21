import React, {Component} from 'react';
import FirstProblem from './FirstProblem';
import SecondProblem from './SecondProblem';

class App extends Component {

    constructor(props) {
        super(props);
        this.switchMode = this.switchMode.bind(this);
        this.state = {
            isPokerTypeMode:true,
            mode1:"Poker type",
            mode2:"Poker ranking"
        }
    }

    componentDidMount(){
        //$( this.refs.toggleInput).bootstrapToggle('on');
    }

    switchMode(){
        let isPokerRankingMode = false;
        let classes = this.problemMode.childNodes[0].className.split(" ");
        for (let i in classes) {
            if(classes[i]==='off') {
                isPokerRankingMode = true;
                break;
            }
        }
        if(isPokerRankingMode) {
            this.setState({
                isPokerTypeMode:false,
                mode1:"Poker ranking",
                mode2:"Poker type"          
            });

        }else {
            this.setState({
                isPokerTypeMode:true,
                mode1:"Poker type",
                mode2:"Poker ranking"
            });
        }
    }

    render() {
        return (
            <div >
                <div className="main-menu">
                    <label>Problem : </label>
                    <div ref = {(el) => this.problemMode = el} onClick={this.switchMode} style={{display:"inline-block"}}>
                         <input 
                            type="checkbox" 
                            defaultChecked 
                            data-toggle="toggle" 
                            data-on="Poker type" 
                            data-off="Poker ranking" 
                            data-onstyle="info" 
                            data-offstyle="primary"                                           
                        />
                    </div>
                    <p className="help-block">
                        <strong>Tips: </strong>
                        Click {this.state.mode1} button to switch into {this.state.mode2} problem
                    </p>
                </div>  
                <hr/>

               {this.state.isPokerTypeMode === true ? (
                    <FirstProblem />
                ):(
                    <SecondProblem />
                )}
                            
            </div>
            
        );
    }
}

export default App;