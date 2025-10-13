/**
 * Core Store Creation (Zustand-style)
 * Extracted from merged2.html lines 11123-11130
 */

/**
 * Create a reactive store with subscribe pattern
 * @param {Function} init - Initialization function (set, get) => initialState
 * @returns {Object} Store with getState, setState, subscribe methods
 */
export const createStore = (init)=>{
  let state; 
  const listeners=new Set();
  
  const setState = (partial)=>{ 
    const next=typeof partial==='function'?partial(state):partial; 
    const prev=state; 
    state={...state,...next}; 
    listeners.forEach(l=>l(state,prev)); 
  };
  
  const getState = ()=>state;
  
  const subscribe = (fn)=> (listeners.add(fn), ()=>listeners.delete(fn));
  
  state = init(setState,getState);
  
  return {getState,setState,subscribe};
};

