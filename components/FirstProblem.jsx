import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { classifyCards } from '../redux/actions';
import * as Const from '../defines/const';

class FirstProblem extends Component {

    constructor(props) {
        super(props);
        this.resolveData = this.resolveData.bind(this);
        
    }

    handleSubmit(e) {

        var cardString = this.refs.inputData.value;
        if(cardString != "" || cardString.trim() !="") {
            const { dispatch } = this.props;
            dispatch(classifyCards(cardString.trim()));
            //clear input
            //this.refs.inputData.value = "";
        }
       
    }

    handleChange(e) {
        //   console.log("handle text change");
        this.refs.resultarea.innerHTML = "";
        this.refs.resultarea.className = "";
        var data = this.refs.inputData.value;
        if(data.trim()=="") {
            this.refs.submitButton.className = "btn btn-info disabled";
        }else {
            this.refs.submitButton.className = "btn btn-info";
        }
        this.refs.inputData.className = "cls_test form-control";

    }
    
    componentWillReceiveProps(nextState) {  
        this.resolveData(nextState);
    }

    componentDidMount(){
        this.handleChange();
    }
    
    componentWillMount(){
        
    }

    componentDidUpdate(){
        document.getElementById("id-inputform").focus();

    }

    onKeyPressed(e){

        if(e.keyCode==13){
            this.handleSubmit();
        } 
    }

    resolveData(resultData) {
        var element="";
        var className ="";

        switch(resultData.header.status) {
            case Const.DATA_STATUS_SUCCESS : {
                var type = resultData.data.content.type;
                var cards = resultData.data.content.cardList;
                
                for(var i=0;i<cards.length;i++) {      
                    var inner = "<div class='cardFrame' style=' "
                                +"background-image : url(../img/"+cards[i]+".png)"
                                +" ' ></div>";
                    element+=inner;
                }
            
                element += "<div id='resultText'><strong> "+type+" </strong></div>";
                                            
                className = "alert alert-success fade in";

                //this.refs.inputData.value = "";
               
            }break;
            case Const.DATA_STATUS_FAILURE : {
                element = resultData.data.message;
                className = "alert alert-danger fade in ";           
                this.refs.inputData.className+=" warning-focus";
            }break;
            default: "";
        }

        this.refs.resultarea.innerHTML = element;
        this.refs.resultarea.className = className;
        
    }
    


    render() {
        return (
            <div>
                <div className="">
                    <div id="main-content">                   
                        <div className="form-group">               
                            <label>Cards on hand: </label>
                            <div className="form-inline input-area">
                                <input
                                    ref="inputData"
                                    type="text"
                                    id="id-inputform"
                                    placeholder="List cards..."
                                    className="cls_test form-control"
                                    onChange={this.handleChange.bind(this)}
                                    onKeyDown={this.onKeyPressed.bind(this)}
                                    
                                />
                                <button
                                    type="submit"
                                    id="test"
                                    ref="submitButton"
                                    className="btn btn-info "
                                    onClick={this.handleSubmit.bind(this)}
                                >
                                    Check Poker type
                                </button>     
                            </div>
                                                                                     
                        </div>
                                             
                        <div ref="resultarea" id="resultarea"></div>                                           
                    </div>
                </div>
                
            </div>
        );
    }
}

function mapStateToProps(state) {
    return state;
}

export default connect(mapStateToProps)(FirstProblem);
