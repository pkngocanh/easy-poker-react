import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { cardRanking } from '../redux/actions';
import * as Const from '../defines/const';

class SecondProblem extends Component {

    constructor(props) {
        super(props);
        
        this.createTableElement = this.createTableElement.bind(this);
        this.resolveData = this.resolveData.bind(this);
    }

    getResult(event){
        var cardString = this.refs.inputData.value;
        cardString.replace(/\n/g," ");
        if(cardString != "" || cardString.trim() !="") {
            const { dispatch } = this.props;
            dispatch(cardRanking(cardString.trim()));
            
            //clear input
            //this.refs.inputData.value = "";
        }
    }

    onKeyPressed(e) {
        if(e.keyCode==13 && e.shiftKey){
            
            this.getResult(e);
            e.preventDefault();
        } 
    }

    componentWillReceiveProps(nextState) {
        
        this.resolveData(nextState.result);
        
    }

    componentDidMount(){
        this.handleChange();
        
    }

    componentDidUpdate(){
        document.getElementById("id-textarea").focus();
             
    }

    handleChange(e){
        this.refs.outputarea.innerHTML = "";
        this.refs.outputarea.className = "";
        var data = this.refs.inputData.value;
        if(data.trim()=="") {
            this.refs.submitButton.className = "btn btn-primary disabled";
        }else {
            this.refs.submitButton.className = "btn btn-primary";
        }
        this.refs.inputData.className = "cls_test form-control";
    }

    resolveData(result) {
        //console.log(JSON.stringify(result));
         var element="";
         var className ="";

         switch(result.status) {
             case Const.DATA_STATUS_SUCCESS : {

                var mode = $('input[name="optradio"]:checked').val(); 
                if(mode==Const.OUTPUT_NORMAL) {
                    element = this.createTableElement(result.data);
                }
                if(mode==Const.OUTPUT_JSON) {
                    element = "<pre>"+result.json+"</pre>";
                    //element = "<p style='white-space: pre;'>"+result.json+"</p>";  
                }             
                                                       
                className = "alert alert-success fade in";
                
                //console.log(result.json);
                //this.refs.inputData.value="";
               
             }break;
             case Const.DATA_STATUS_FAILURE : {
                 element = result.message;
                 className = "alert alert-danger fade in ";
                 this.refs.inputData.className+=" warning-focus";
             }break;
             default: "";
         }
         
         this.refs.outputarea.innerHTML = element;
         this.refs.outputarea.className = className;
    }

    createTableElement(data) {
        var element="";     
        var elementStart = "<table class='table table-reponsive'>"
                    +"<tbody>";                    
        var elementInEachRow ="";       
        var elementEnd ="</tbody>"
                +"</table>";
        for(var i=0;i<data.length;i++) {
            elementInEachRow+= "<tr>"
                                +"<td>";
                for(var j=0;j<5;j++) {
                    var inner = "<div class='cardFrameMini' style=' "
                                +"background-image : url(../img/"+data[i].cardList[j]+".png)"
                                +" ' ></div>";
                    elementInEachRow+=inner;
                }                    
            elementInEachRow+="</td>"
                             +"<td class='cell-middle'> <strong>"
                             +data[i].type
                             +"</strong> </td>"
                             +"<td class='cell-middle'>";
            if(data[i].isBest==true) {
               elementInEachRow+= "Best value";
            }                 
            elementInEachRow+= "</td></tr>";
        }
       
        element = elementStart+elementInEachRow+elementEnd;

        return element;
    }

    render() {
        return (
            <div>
                <div className="">
                    <div id="main-content">                   
                        <div className="form-group">               
                            <label>Input list: </label>
                            <div className="input-data">
                                <textarea
                                    ref="inputData"
                                    type="text"
                                    id="id-textarea"
                                    placeholder="List cards..."
                                    className="cls_test form-control"
                                    onChange={this.handleChange.bind(this)}
                                    onKeyDown={this.onKeyPressed.bind(this)}
                                    rows="10"
                                    style={{resize :"none"}}
                                />                                                            
                            </div>
                            <div className="form-group">
                                <label>Output style: </label>&nbsp;&nbsp;
                                <label className="radio-inline"><input type="radio" name="optradio" value="1" defaultChecked/>Normal style</label>
                                <label className="radio-inline"><input type="radio" name="optradio" value="0"/>JSON style </label>                        
                            </div>
                            <button
                                type="submit"
                                id="test"
                                ref="submitButton"
                                className="btn btn-primary"
                                onClick={this.getResult.bind(this)}
                            >
                                Check Poker Ranking
                            </button>                                                        
                        </div>

                        <div ref="outputarea" id="outputarea"></div>                                                                      
                                                                  
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state;
}
export default connect(mapStateToProps)(SecondProblem);
