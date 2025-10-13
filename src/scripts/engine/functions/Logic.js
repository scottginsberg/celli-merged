/**
 * Logic & Math Functions
 * Extracted from merged2.html lines 15802-15934 (~132 lines)
 * 
 * Pure functions for logic, math, and utility operations
 */

import { tag } from '../FunctionHelpers.js';

// Note: Functions use window.Formula and window.Actions at runtime

// IF(condition, then, [else])
tag('IF',['PURE'],(anchor,arr,ast)=>{
  const evalArg = (a)=> window.Formula.valOf(a);
  const isTruthy=(v)=>{
    if (v===null || v===undefined) return false;
    if (typeof v==='boolean') return v;
    if (Array.isArray(v)) return v.some(isTruthy);
    const n = Number(v);
    if(!Number.isNaN(n) && String(v).trim()!=='') return n!==0;
    const s = String(v).trim().toLowerCase();
    return !(s==='' || s==='false' || s==='0');
  };
  const cond = evalArg(ast.args[0]);
  const out = isTruthy(cond) ? evalArg(ast.args[1]) : (ast.args[2]!==undefined ? evalArg(ast.args[2]) : '');
  return out;
});

// REVERSE(array_or_string)
tag('REVERSE',['PURE'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const a=valOf(ast.args[0]); 
  const out=Array.isArray(a)?[...a].reverse():String(a).split('').reverse().join('');
  window.Actions.setCell(arr.id,anchor, Array.isArray(out)?`[${out.join(',')}]`:out, ast.raw,true);
});

// ADD(...numbers)
tag('ADD',['PURE'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const sum=(ast.args.map(valOf).flat()).reduce((a,b)=>a+(+b||0),0);
  window.Actions.setCell(arr.id,anchor,sum,ast.raw,true);
});

// MUL(...numbers)
tag('MUL',['PURE'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const prod=(ast.args.map(valOf).flat()).reduce((a,b)=>a*(+b||1),1);
  window.Actions.setCell(arr.id,anchor,prod,ast.raw,true);
});

// Logical operators
tag('AND',['PURE'],(anchor,arr,ast)=>{ 
  const valOf=window.Formula.valOf; 
  const v=ast.args.map(valOf).flat().every(x=>!!x)?1:0; 
  window.Actions.setCell(arr.id,anchor,v,ast.raw,true); 
});

tag('OR',['PURE'],(anchor,arr,ast)=>{ 
  const valOf=window.Formula.valOf; 
  const v=ast.args.map(valOf).flat().some(x=>!!x)?1:0; 
  window.Actions.setCell(arr.id,anchor,v,ast.raw,true); 
});

tag('NOT',['PURE'],(anchor,arr,ast)=>{ 
  const valOf=window.Formula.valOf; 
  const v=!valOf(ast.args[0]); 
  window.Actions.setCell(arr.id,anchor,v?1:0,ast.raw,true); 
});

// Comparison operators
tag('EQ',['PURE'],(anchor,arr,ast)=>{ 
  const valOf=window.Formula.valOf; 
  const [a,b]=ast.args.map(valOf); 
  window.Actions.setCell(arr.id,anchor,(a==b)?1:0,ast.raw,true); 
});

tag('NEQ',['PURE'],(anchor,arr,ast)=>{ 
  const valOf=window.Formula.valOf; 
  const [a,b]=ast.args.map(valOf); 
  window.Actions.setCell(arr.id,anchor,(a!=b)?1:0,ast.raw,true); 
});

tag('GT',['PURE'],(anchor,arr,ast)=>{ 
  const valOf=window.Formula.valOf; 
  const [a,b]=ast.args.map(valOf).map(Number); 
  window.Actions.setCell(arr.id,anchor,(a>b)?1:0,ast.raw,true); 
});

tag('GTE',['PURE'],(anchor,arr,ast)=>{ 
  const valOf=window.Formula.valOf; 
  const [a,b]=ast.args.map(valOf).map(Number); 
  window.Actions.setCell(arr.id,anchor,(a>=b)?1:0,ast.raw,true); 
});

tag('LT',['PURE'],(anchor,arr,ast)=>{ 
  const valOf=window.Formula.valOf; 
  const [a,b]=ast.args.map(valOf).map(Number); 
  window.Actions.setCell(arr.id,anchor,(a<b)?1:0,ast.raw,true); 
});

tag('LTE',['PURE'],(anchor,arr,ast)=>{ 
  const valOf=window.Formula.valOf; 
  const [a,b]=ast.args.map(valOf).map(Number); 
  window.Actions.setCell(arr.id,anchor,(a<=b)?1:0,ast.raw,true); 
});

// CLAMP(value, min, max)
tag('CLAMP',['PURE'],(anchor,arr,ast)=>{ 
  const valOf=window.Formula.valOf; 
  const x=+valOf(ast.args[0])||0, mn=(+valOf(ast.args[1])||0), mx=(+valOf(ast.args[2])||0); 
  window.Actions.setCell(arr.id,anchor, Math.min(mx,Math.max(mn,x)), ast.raw,true); 
});

// Direction map for ADJACENT
const __dirMap = {
  north:{dx:0,dy:-1,dz:0}, south:{dx:0,dy:1,dz:0},
  east:{dx:1,dy:0,dz:0}, west:{dx:-1,dy:0,dz:0},
  front:{dx:0,dy:0,dz:-1}, back:{dx:0,dy:0,dz:1}
};

function __parseDirectionToken(token){
  if(token===undefined||token===null) return null;
  const str=String(token).trim();
  if(!str) return null;
  const lower=str.toLowerCase();
  if(__dirMap[lower]) return __dirMap[lower];
  switch(str.toUpperCase()){
    case 'N': case '-Y': return __dirMap.north;
    case 'S': case '+Y': case 'Y': return __dirMap.south;
    case 'E': case '+X': case 'X': return __dirMap.east;
    case 'W': case '-X': return __dirMap.west;
    case 'F': case 'FRONT': case '-Z': return __dirMap.front;
    case 'B': case 'BACK': case '+Z': case 'Z': return __dirMap.back;
    default: return null;
  }
}

// ADJACENT(...directions) - Get adjacent cell values
tag('ADJACENT',['PURE'],(anchor,arr,ast)=>{
  const values=[];
  const dirs=[];
  const addTokens=(val)=>{
    if(val==null) return;
    if(Array.isArray(val)) return val.forEach(addTokens);
    String(val).split(/[\s,]+/).filter(Boolean).forEach(tok=>{
      const parsed=__parseDirectionToken(tok);
      if(parsed) dirs.push(parsed);
    });
  };
  if(ast.args.length){ 
    ast.args.forEach(arg=> addTokens(window.Formula.valOf(arg))); 
  }
  if(!dirs.length){ 
    dirs.push(__dirMap.north,__dirMap.south,__dirMap.east,__dirMap.west,__dirMap.front,__dirMap.back); 
  }
  dirs.forEach(vec=>{
    const coord={x:anchor.x+vec.dx,y:anchor.y+vec.dy,z:anchor.z+vec.dz};
    values.push(window.Formula.getCellValue({arrId:anchor.arrId||arr.id, ...coord}));
  });
  if(values.length===0) return '';
  return values.length===1 ? values[0] : values;
});

// DETECT(value, [maxRange]) - Find direction to nearest matching cell
tag('DETECT',['PURE'],(anchor,arr,ast)=>{
  const lookup=window.Formula.valOf(ast.args[0]);
  const target=String(lookup??'');
  const maxRange=ast.args[1]!==undefined ? Math.max(1, Math.abs((+window.Formula.valOf(ast.args[1])|0))) : Math.max(arr.size?.x||1, arr.size?.y||1, arr.size?.z||1);
  const dirs=[
    {axis:'X',dx:1,dy:0,dz:0},
    {axis:'X',dx:-1,dy:0,dz:0},
    {axis:'Y',dx:0,dy:1,dz:0},
    {axis:'Y',dx:0,dy:-1,dz:0},
    {axis:'Z',dx:0,dy:0,dz:1},
    {axis:'Z',dx:0,dy:0,dz:-1}
  ];
  const bounds={x:arr.size?.x??0,y:arr.size?.y??0,z:arr.size?.z??0};
  for(const dir of dirs){
    for(let step=1; step<=maxRange; step++){
      const x=anchor.x+dir.dx*step;
      const y=anchor.y+dir.dy*step;
      const z=anchor.z+dir.dz*step;
      if(x<0||y<0||z<0||x>=bounds.x||y>=bounds.y||z>=bounds.z) break;
      const val=window.Formula.getCellValue({arrId:anchor.arrId||arr.id,x,y,z});
      if(String(val)===target){
        const sign=(dir.dx+dir.dy+dir.dz)>0?step:-step;
        return `${dir.axis}:${sign}`;
      }
    }
  }
  return '';
});

// ISNUMBER(value) - Check if value is numeric
tag('ISNUMBER',['PURE'],(anchor,arr,ast)=>{
  const value = ast.args.length ? window.Formula.valOf(ast.args[0]) : '';
  let isNum=false;
  if(typeof value==='number'){ 
    isNum=Number.isFinite(value); 
  }
  else if(typeof value==='string'){ 
    const trimmed=value.trim(); 
    if(trimmed){ 
      const num=Number(trimmed); 
      isNum=Number.isFinite(num); 
    } 
  }
  else if(value!=null){ 
    const num=Number(value); 
    isNum=Number.isFinite(num); 
  }
  return isNum?1:0;
});

// SEARCH(find, within, [start]) - Find substring position (1-indexed)
tag('SEARCH',['PURE'],(anchor,arr,ast)=>{
  const find=String(window.Formula.valOf(ast.args[0]??''));
  const within=String(window.Formula.valOf(ast.args[1]??''));
  const startRaw=ast.args[2]!==undefined ? (+window.Formula.valOf(ast.args[2])|0) : 1;
  const start=Math.max(1,startRaw);
  if(start>within.length) throw new Error('SEARCH:OUT_OF_RANGE');
  const idx=within.toLowerCase().indexOf(find.toLowerCase(),start-1);
  if(idx===-1) throw new Error('SEARCH:NOT_FOUND');
  return idx+1;
});

