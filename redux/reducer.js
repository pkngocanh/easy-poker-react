import * as Const from '../defines/const';

export default function reducer(state, action) {
    switch (action.type) {

        case Const.CLASSIFY_CARDS:
            return Object.assign({}, state, {
                data: {
                    message: action.message,
                    content: action.content  
                }, 
                header: {
                    status: action.status
                }
                    
            });
        case Const.RANKING_CARDS: 
            return  Object.assign({}, state, {
                result: {
                    message: action.message,
                    data: action.content,
                    status: action.status,
                    json : action.jsonResult  
                }                                         
            });   
        default:
            return state;
    }
}