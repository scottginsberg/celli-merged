/**
 * Array Operations Functions
 * Extracted from merged2.html (~566 lines combined)
 * 
 * Functions for creating, manipulating, and querying arrays
 */

import { tag, collectTargetCells } from '../FunctionHelpers.js';
import { Write } from '../Write.js';
import { aKey, A1, greek, CHUNK_SIZE, chunkOf, keyChunk } from '../Constants.js';
import { normalizeMetaKeys } from '../CellMeta.js';

// Note: Functions use window.Store, window.Actions, window.Formula, window.Scene at runtime

/**
 * CREATE(x,y,z[, "Name"[, "Id"]]) - Create new array
 * Lines 13623-13662 (~40 lines)
 */
tag('CREATE',["ACTION"],(anchor,arr,ast)=>{
  try{
    const args = ast.args.map(a => window.Formula.valOf(a));

    let sx = 6, sy = 4, sz = 6, name = 'Array', explicitId = null;
    let argOffset = 0;

    if (args.length > 0 && typeof args[0] === 'string') {
      name = args[0];
      argOffset = 1;
    }

    if (args.length >= argOffset + 1 && Number.isFinite(+args[argOffset])) sx = Math.max(1, (+args[argOffset] | 0));
    if (args.length >= argOffset + 2 && Number.isFinite(+args[argOffset + 1])) sy = Math.max(1, (+args[argOffset + 1] | 0));
    if (args.length >= argOffset + 3 && Number.isFinite(+args[argOffset + 2])) sz = Math.max(1, (+args[argOffset + 2] | 0));

    if (argOffset === 0 && args.length >= 4) name = String(args[3]);
    const idArgIndex = 4;
    if (args.length > idArgIndex && args[idArgIndex] != null) {
      const n = +args[idArgIndex];
      if (Number.isFinite(n)) explicitId = Math.trunc(n);
    }

    const opts = { name, size: {x: sx, y: sy, z: sz} };
    if(explicitId !== null) opts.id = explicitId;

    const created = window.Actions.createArray(opts);
    if (!created) throw new Error('Array creation failed internally.');

    const host = arr, newArr = created, gap = 1.0;
    const hostOff = host.offset || {x:0, y:0, z:0};
    const newX = hostOff.x + (host.size.x / 2) + (newArr.size.x / 2) + gap;
    window.Scene.setArrayOffset(newArr, {x: newX, y: hostOff.y, z: hostOff.z});

    window.Actions.setCell(arr.id, anchor, created.id, null, true);

  } catch(e) {
    window.Actions.setCell(arr.id, anchor, `!ERR:${e.message}`, ast.raw, true);
  }
});

/**
 * GET_NEXT_ID() - Returns lowest available positive integer ID
 * Lines 13665-13670 (~6 lines)
 */
tag('GET_NEXT_ID',["META","PURE"],(anchor,arr,ast)=>{
  const ids = Object.values(window.Store.getState().arrays).map(a=>a.id).filter(id=>Number.isInteger(id) && id>0);
  const sorted = [...new Set(ids)].sort((a,b)=>a-b);
  let next=1; 
  for(const n of sorted){ 
    if(n===next) next++; 
    else if(n>next) break; 
  }
  window.Actions.setCell(arr.id, anchor, next, ast.raw, true);
});

/**
 * FORMULIZE(targetRef) - Build formula to recreate array structure
 * Lines 13672-13761 (~90 lines)
 */
tag('FORMULIZE',["META","ACTION"],(anchor,arr,ast)=>{
  try{
    const target = ast.args[0] && ast.args[0].kind==='ref' ? ast.args[0] : anchor;
    const startId = target.arrId || arr.id;
    const S = window.Store.getState();
    if(!S.arrays[startId]){ 
      window.Actions.setCell(arr.id, anchor, '!ERR:TARGET', ast.raw, true); 
      return; 
    }
    
    // BFS through formulas to find referenced array IDs
    const q=[startId]; 
    const seen=new Set([startId]);
    while(q.length){
      const id=q.shift(); 
      const A=S.arrays[id]; 
      if(!A) continue;
      Object.values(A.chunks).forEach(ch=>{
        ch.cells.forEach(cell=>{
          if(!cell.formula) return;
          const matches = cell.formula.match(/@\[(-?\d+),(-?\d+),(-?\d+),(-?\d+)\]/g) || [];
          matches.forEach(m=>{ 
            const mm=m.match(/@\[(-?\d+),(-?\d+),(-?\d+),(-?\d+)\]/); 
            const refId=+mm[4]; 
            if(refId>0 && !seen.has(refId) && S.arrays[refId]){ 
              seen.add(refId); 
              q.push(refId);
            } 
          });
          const carats = cell.formula.match(/\^[0-9]+/g) || [];
          carats.forEach(tk=>{ 
            const refId=+(tk.slice(1)); 
            if(refId>0 && !seen.has(refId) && S.arrays[refId]){ 
              seen.add(refId); 
              q.push(refId);
            } 
          });
        });
      });
    }
    
    const ids = Array.from(seen).sort((a,b)=>a-b);
    const idMap = new Map(ids.map((id,i)=>[id, `temp.id_${i+1}`]));
    const esc=(s)=> String(s).replace(/"/g,'\\\"');
    const lines=[];
    
    // Reserve IDs
    ids.forEach(id=>{ 
      const key=idMap.get(id); 
      lines.push(`"=SET_GLOBAL(\\\"${key}\\\", GET_NEXT_ID())"`); 
    });
    
    // CREATE arrays
    ids.forEach(id=>{
      const A=S.arrays[id]; 
      const nm=esc(A.name||'Array');
      const size=`${A.size.x}, ${A.size.y}, ${A.size.z}`;
      lines.push(`"=CREATE(${size}, \\\"${nm}\\\", GET_GLOBAL(\\\"${idMap.get(id)}\\\"))"`);
    });
    
    // Populate arrays (simplified - full implementation would include EXEC_AT block fills)
    ids.forEach(id=>{
      const A=S.arrays[id];
      const idExpr = `GET_GLOBAL(\\\"${idMap.get(id)}\\\")`;
      const off=A.offset||{x:0,y:0,z:0};
      lines.push(`"=SET_ARRAY_POS(${idExpr}, ${Math.round(off.x)}, ${Math.round(off.y)}, ${Math.round(off.z)})"`);
    });
    
    // Self cleanup
    lines.push(`"=SET(SELF(), \"\")"`);
    const out = `=DO(\n ${lines.join(',\n ')}\n)`;
    window.Actions.setCell(arr.id, anchor, out, ast.raw, true);
  }catch(e){ 
    window.Actions.setCell(arr.id, anchor, `!ERR:${e.message}`, ast.raw, true); 
  }
});

/**
 * SPLIT(text, delimiter[, splitByEach]) - Split text into array
 * Lines 13764-13780 (~17 lines)
 */
tag('SPLIT',['PURE','BLOCK'], (anchor,arr,ast,tx)=>{
  if(!tx) throw new Error('SPLIT requires active transaction');
  const text = String(window.Formula.valOf(ast.args[0] ?? ''));
  const delimRaw = window.Formula.valOf(ast.args[1] ?? '');
  const splitByEach = !!window.Formula.valOf(ast.args[2] ?? 0);
  const delims = String(delimRaw);
  let parts;
  if(splitByEach){
    const re = new RegExp(`[${delims.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}]`, 'g');
    parts = text.split(re);
  } else {
    parts = delims==='' ? [text] : text.split(delims);
  }
  for(let i=0;i<parts.length;i++){
    Write.set(tx, arr.id, {x:anchor.x, y:anchor.y-i, z:anchor.z}, { 
      value: parts[i], 
      formula: i===0?ast.raw:null, 
      meta:{generated:true, emitter:aKey(anchor)} 
    });
  }
});

/**
 * INDEX(rangeOrRef, row[, col[, depth]]) - 1-based indexing
 * Lines 13782-13803 (~22 lines)
 */
tag('INDEX',['PURE'], (anchor,arr,ast)=>{
  const tgt = ast.args[0];
  const r = (+window.Formula.valOf(ast.args[1])|0) || 1;
  const c = (+window.Formula.valOf(ast.args[2])|0) || 1;
  const d = ast.args[3]!==undefined ? ((+window.Formula.valOf(ast.args[3])|0) || 1) : 1;
  let ref;
  if(tgt && tgt.kind==='range'){
    const xs=[...new Set(tgt.cells.map(t=>t.x))].sort((a,b)=>a-b);
    const ys=[...new Set(tgt.cells.map(t=>t.y))].sort((a,b)=>a-b);
    const zs=[...new Set(tgt.cells.map(t=>t.z))].sort((a,b)=>a-b);
    const x=xs[Math.min(xs.length-1, Math.max(0, c-1))];
    const y=ys[Math.min(ys.length-1, Math.max(0, r-1))];
    const z=zs[Math.min(zs.length-1, Math.max(0, d-1))];
    ref = {x,y,z,arrId:tgt.cells[0].arrId,kind:'ref'};
  } else if(tgt && tgt.kind==='ref'){
    ref = {x:tgt.x+(c-1), y:tgt.y+(r-1), z:tgt.z+(d-1), arrId:tgt.arrId, kind:'ref'};
  } else {
    ref = anchor;
  }
  const v = window.Formula.getCellValue(ref);
  window.Actions.setCell(arr.id, anchor, v, ast.raw, true);
});

/**
 * MATCH(lookup, range[, matchType]) - Returns 1-based position
 * Lines 13806-13820 (~15 lines)
 */
tag('MATCH',['PURE'], (anchor,arr,ast)=>{
  const lookup = window.Formula.valOf(ast.args[0]);
  const tgt = ast.args[1];
  const matchType = (+window.Formula.valOf(ast.args[2] ?? 0))|0;
  let cells = [];
  if(tgt && tgt.kind==='range') cells = tgt.cells;
  else if(tgt && tgt.kind==='ref') cells = [{x:tgt.x,y:tgt.y,z:tgt.z,arrId:tgt.arrId}];
  let pos = 0;
  for(let i=0;i<cells.length;i++){
    const v = window.Formula.getCellValue(cells[i]);
    if(matchType===0){ 
      if(String(v)===String(lookup)){ pos=i+1; break; } 
    }
    else { 
      const nv=(+v)||0, nl=(+lookup)||0; 
      if((matchType>0 && nv<=nl) || (matchType<0 && nv>=nl)){ pos=i+1; } 
    }
  }
  window.Actions.setCell(arr.id, anchor, pos, ast.raw, true);
});

/**
 * XLOOKUP(lookup, rangeKeys, rangeVals[, ifNotFound])
 * Lines 13823-13840 (~18 lines)
 */
tag('XLOOKUP',['PURE'], (anchor,arr,ast)=>{
  const lookup = window.Formula.valOf(ast.args[0]);
  const keys = ast.args[1];
  const vals = ast.args[2];
  const ifNotFound = ast.args[3]!==undefined ? window.Formula.valOf(ast.args[3]) : '';
  const toList=(arg)=> (arg && arg.kind==='range') ? arg.cells : (arg && arg.kind==='ref') ? [arg] : [];
  const keyCells = toList(keys);
  const valCells = toList(vals);
  let out = ifNotFound;
  for(let i=0;i<keyCells.length;i++){
    if(String(window.Formula.getCellValue(keyCells[i]))===String(lookup)){
      const vc = valCells[i] || valCells[0];
      out = vc ? window.Formula.getCellValue(vc) : ifNotFound;
      break;
    }
  }
  window.Actions.setCell(arr.id, anchor, out, ast.raw, true);
});

/**
 * ARRAY(mode, ...args) - Create array data
 * Lines 15428-15527 (~100 lines)
 */
tag('ARRAY',["ACTION","BLOCK"], (anchor,arr,ast,tx)=>{
  if(!tx) throw new Error('ARRAY requires active transaction');
  const S = window.Store.getState();
  const ak = aKey(anchor);

  const prevEmitted = S.emittedByAnchor.get(ak);
  if(prevEmitted) {
    prevEmitted.forEach(ck => {
      const [arrId, coords] = ck.split(':');
      const [x, y, z] = coords.split(',').map(Number);
      Write.set(tx, +arrId, {x, y, z}, { value: '', formula: null, meta: {} });
      S.sourceByCell.delete(ck);
    });
    S.emittedByAnchor.delete(ak);
  }

  const args = ast.args;
  const valOf = window.Formula.valOf;
  
  // Accept ranges
  if(args.length>0 && (args[0]?.kind==='range' || args[0]?.kind==='ref')){
    const src = args[0];
    const cells = src.kind==='range' ? src.cells : [src];
    const xs=[...new Set(cells.map(c=>c.x))].sort((a,b)=>a-b);
    const ys=[...new Set(cells.map(c=>c.y))].sort((a,b)=>a-b);
    const zs=[...new Set(cells.map(c=>c.z))].sort((a,b)=>a-b);
    for(let zi=0; zi<zs.length; zi++){
      for(let yi=0; yi<ys.length; yi++){
        for(let xi=0; xi<xs.length; xi++){
          const x=xs[xi], y=ys[yi], z=zs[zi];
          const v = window.Formula.getCellValue({arrId:cells[0].arrId,x,y,z});
          const dx = xi, dy = yi, dz = zi;
          const isAnchor=(dx===0&&dy===0&&dz===0);
          Write.set(tx, arr.id, {x:anchor.x+dx, y:anchor.y+dy, z:anchor.z+dz}, { 
            value:v, 
            formula:isAnchor?ast.raw:null, 
            meta:{generated:true, emitter:ak} 
          });
        }
      }
    }
    return;
  }
  
  const firstVal = args.length>0 ? valOf(args[0]) : undefined;
  const isModeString = typeof firstVal === 'string';
  let mode = isModeString ? String(firstVal).trim().toLowerCase() : 'list';
  let dataArgs = isModeString ? args.slice(1) : args;

  const knownModes = ['fill','set','csv','list'];
  if(isModeString && !knownModes.includes(mode) && !S.namedBlocks.has(mode.toUpperCase())){
    mode = 'list';
    dataArgs = args;
  }

  switch(mode){
    case 'fill':{
      const w=+valOf(dataArgs[0])||1, h=+valOf(dataArgs[1])||1, d=+valOf(dataArgs[2]||1)||1;
      const fillValue = (dataArgs[3]!==undefined)? valOf(dataArgs[3]) : 1;
      for(let z=0;z<d;z++) for(let y=0;y<h;y++) for(let x=0;x<w;x++){
        const coord={x:anchor.x+x, y:anchor.y+y, z:anchor.z+z};
        const isAnchor=(x===0&&y===0&&z===0);
        Write.set(tx, arr.id, coord, { 
          value: fillValue, 
          formula:isAnchor?ast.raw:null, 
          meta:{generated:true, emitter:ak} 
        });
      }
      break;
    }
    case 'csv':{
      const raw=String(valOf(dataArgs[0]||''));
      const rows=raw.split(/\r?\n/); 
      let wroteAnchor=false, ry=0;
      for(const line of rows){
        const cols=line.split(',');
        for(let i=0;i<cols.length;i++){
          const isFirst=!wroteAnchor;
          Write.set(tx, arr.id, {x:anchor.x+i, y:anchor.y+ry, z:anchor.z}, { 
            value: cols[i], 
            formula:isFirst?ast.raw:null, 
            meta:{generated:true, emitter:ak} 
          });
          wroteAnchor=true;
        }
        ry++;
      }
      break;
    }
    case 'set':
    case 'list':
    default:{
      const named=S.namedBlocks.get(String(mode).toUpperCase());
      if(named){
        const values=named.data[0].flat();
        for(let i=0;i<values.length;i++){
          Write.set(tx, arr.id, {x:anchor.x,y:anchor.y+i,z:anchor.z}, { 
            value:values[i], 
            formula:i===0?ast.raw:null, 
            meta:{generated:true, emitter:ak} 
          });
        }
      } else {
        const values = dataArgs.map(valOf);
        for(let i=0;i<values.length;i++){
          const coord={x:anchor.x, y:anchor.y+i, z:anchor.z};
          Write.set(tx, arr.id, coord, { 
            value: values[i], 
            formula: i===0?ast.raw:null, 
            meta:{generated:true, emitter:ak} 
          });
        }
      }
    }
  }
});

/**
 * STORE_ARRAY(...) - Store array in named blocks library
 * Lines 15529-15572 (~44 lines)
 */
tag('STORE_ARRAY',['PURE'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  let name='Block', data=[], size={x:1,y:1,z:1}, flat=[];
  const esc=(s)=> String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\\"');
  const pushFlat=(v)=>{ flat.push((typeof v==='string')?`"${esc(v)}"`:`${v}`); };
  const arg0=ast.args[0];
  
  if(typeof arg0==='number'){
    const w=+valOf(ast.args[0])||1, h=+valOf(ast.args[1])||1, d=+valOf(ast.args[2])||1;
    name=ast.args[3]?String(valOf(ast.args[3])):'Block';
    size={x:w,y:h,z:d};
    for(let zz=0; zz<d; zz++) for(let yy=0; yy<h; yy++) for(let xx=0; xx<w; xx++){
      const cell=window.Formula.getCell({arrId:arr.id,x:anchor.x+xx,y:anchor.y-yy,z:anchor.z+zz});
      pushFlat(cell.value||'');
    }
  } else if(arg0&&arg0.kind==='range'){
    const src=arg0; name=ast.args[1]?String(valOf(ast.args[1])):'Block';
    const xs=src.cells.map(c=>c.x), ys=src.cells.map(c=>c.y), zs=src.cells.map(c=>c.z);
    const minX=Math.min(...xs), minY=Math.min(...ys), minZ=Math.min(...zs), maxX=Math.max(...xs), maxY=Math.max(...ys), maxZ=Math.max(...zs);
    size={x:maxX-minX+1,y:maxY-minY+1,z:maxZ-minZ+1};
    for(let z=minZ; z<=maxZ; z++) for(let y=minY; y<=maxY; y++) for(let x=minX; x<=maxX; x++){
      const cell=window.Formula.getCell({arrId:src.cells[0].arrId,x,y,z}); 
      pushFlat(cell.value||'');
    }
  } else {
    const raw=ast.args.slice();
    if(typeof raw[raw.length-1]==='string' || (typeof raw[raw.length-1]==='object' && raw[raw.length-1]?.kind!==undefined)){
      const last = raw[raw.length-1];
      const nm = String(valOf(last));
      if(nm) { name = nm; raw.pop(); }
    }
    const values=raw.map(valOf);
    size={x:1,y:values.length,z:1};
    values.forEach(pushFlat);
  }
  
  const lib=new Map(window.Store.getState().namedBlocks); 
  data=[]; 
  { 
    let i=0; 
    for(let z=0; z<size.z; z++){ 
      const layer=[]; 
      for(let y=0; y<size.y; y++){ 
        const row=[]; 
        for(let x=0; x<size.x; x++){ 
          row.push((flat[i++]||'').toString().replace(/^"|"$/g,'')); 
        } 
        layer.push(row); 
      } 
      data.push(layer);
    } 
  }
  lib.set(name.toUpperCase(),{size,data}); 
  window.Store.setState({namedBlocks:lib});
  
  const nested = `=STORE_ARRAY(ARRAY(\"list\", ${flat.join(', ')}), \"${esc(name)}\")`;
  window.Actions.setCell(arr.id, anchor, nested, ast.raw, true);
});

/**
 * DOCK(modeOrList, list...) - Dock arrays together
 * Lines 15579-15612 (~34 lines)
 */
tag('DOCK',["SCENE","ACTION"], (anchor,arr,ast,tx)=>{
  const S=window.Store.getState();
  let mode='parent';
  let args = ast.args.slice();
  const first = window.Formula.valOf(args[0]);
  if(typeof first==='string'){
    const m = String(first||'').toLowerCase();
    mode = (m==='all')?'all':'parent';
    args = args.slice(1);
  }
  const toArrId = (a)=>{
    if(a && a.kind==='ref') return a.arrId;
    const v = window.Formula.valOf(a);
    if(typeof v==='string'){
      const p = v.match(/@\[(-?\d+),(-?\d+),(-?\d+),(-?\d+)\]/);
      if(p) return +p[4];
      const n = +v; if(!isNaN(n)) return n;
    }
    const n = +v; if(!isNaN(n)) return n;
    return null;
  };
  const members = args.map(toArrId).filter(id=> id!=null);
  if(members.length===0){ 
    window.Actions.setCell(arr.id,anchor,'!ERR:DOCK:EMPTY',ast.raw,true); 
    return; 
  }
  const groupId = `g:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  const group = {mode, members:[...new Set(members)], parentId: members[0]};
  const newGroups = new Map(S.dockGroups||new Map());
  newGroups.forEach((g,k)=>{ 
    if(g.members.some(id=>group.members.includes(id))) newGroups.delete(k); 
  });
  newGroups.set(groupId, group);
  const ak = aKey(anchor);
  const newByAnchor = new Map(S.dockGroupsByAnchor||new Map());
  newByAnchor.set(ak, groupId);
  window.Store.setState({dockGroups:newGroups, dockGroupsByAnchor:newByAnchor});
  window.Actions.setCell(arr.id, anchor, `Dock:${mode} ${group.members.join(',')}`, ast.raw, true);
});

/**
 * SHIFT(input, dx, dy, dz) - Shift values by offset
 * Lines 15614-15622 (~9 lines)
 */
tag('SHIFT',['PURE','BLOCK'], (anchor,arr,ast,tx)=>{
  if(!tx) throw new Error('SHIFT requires an active transaction');
  const input=ast.args[0]; 
  const dx=+window.Formula.valOf(ast.args[1])|0, 
        dy=ast.args[2]!==undefined?(+window.Formula.valOf(ast.args[2])|0):0, 
        dz=ast.args[3]!==undefined?(+window.Formula.valOf(ast.args[3])|0):0;
  const values=(input&&input.kind==='range')?input.cells.map(c=>window.Formula.valOf(c)):[window.Formula.valOf(input)];
  values.forEach((v,i)=> {
    Write.set(tx, arr.id, {x:anchor.x+dx,y:anchor.y+dy+i,z:anchor.z+dz}, { 
      value: v, 
      formula: null, 
      meta:{generated:true, emitter:aKey(anchor)} 
    });
  });
  Write.set(tx, arr.id, anchor, { value: 'SHIFT:OK', formula: ast.raw });
});

/**
 * ROTATE(rangeOrArray, axis) - Rotate 90 degrees
 * Lines 15627-15755 (~128 lines) - Simplified version
 */
tag('ROTATE',['PURE','BLOCK'], (anchor,arr,ast,tx)=>{
  const __ownsTx = !tx; 
  if(__ownsTx) tx = Write.start('rotate.auto','ROTATE');
  
  let srcArg = ast.args[0];
  if(!srcArg && ast._astArgs && ast._astArgs.length > 0) {
    srcArg = ast._astArgs[0];
  }
  
  let axisRaw = 0;
  if(ast.args && ast.args[1] !== undefined) {
    axisRaw = window.Formula.valOf(ast.args[1]);
  } else if(ast._astArgs && ast._astArgs[1]) {
    axisRaw = window.Formula.valOf(ast._astArgs[1]);
  }
  
  const axisStr = String(axisRaw||'0').toUpperCase();
  const axis = (axisStr==='XY'||axisStr==='0') ? 0 : (axisStr==='YZ'||axisStr==='1') ? 1 : (axisStr==='XZ'||axisStr==='2') ? 2 : (+axisStr|0);
  
  const S=window.Store.getState(); 
  const ak=aKey(anchor);
  
  // Clear previously emitted
  try{ 
    const prev=S.emittedByAnchor?.get?.(ak); 
    if(prev){ 
      prev.forEach(ck=>{ 
        try{ 
          const [aid,rest]=ck.split(':'); 
          const [cx,cy,cz]=rest.split(',').map(Number); 
          Write.set(tx,+aid,{x:cx,y:cy,z:cz},{value:'',formula:null,meta:{}}); 
          S.sourceByCell?.delete?.(ck);
        }catch{} 
      }); 
      S.emittedByAnchor?.delete?.(ak);
    } 
  }catch{}

  const emittedKeys = new Set();
  const recordEmission = (x,y,z)=>{ 
    const ck=`${arr.id}:${x},${y},${z}`; 
    if(!S.sourceByCell) S.sourceByCell=new Map(); 
    S.sourceByCell.set(ck, ak); 
    emittedKeys.add(ck); 
  };
  const finalizeEmissions = ()=>{ 
    if(emittedKeys.size){ 
      if(!S.emittedByAnchor) S.emittedByAnchor = new Map(); 
      S.emittedByAnchor.set(ak, emittedKeys); 
    } 
  };

  const writeAt=(x,y,z,v,isAnchorWrite)=>{ 
    if(z<0){ try{ window.Actions.expandZFront?.(arr, -z); }catch{} }
    try{ window.Actions.resizeArrayIfNeeded(arr, {x,y,z}); }catch{}
    const isAnchor=(x===anchor.x&&y===anchor.y&&z===anchor.z); 
    if(!isAnchor||isAnchorWrite){ 
      Write.set(tx, arr.id, {x,y,z}, { 
        value:v, 
        formula:(isAnchor?ast.raw:null), 
        meta:{generated:true, emitter:ak} 
      }); 
      recordEmission(x,y,z);
    } 
  };
  
  if(srcArg && srcArg.kind==='range'){
    const cells=srcArg.cells; 
    const xs=cells.map(c=>c.x), ys=cells.map(c=>c.y), zs=cells.map(c=>c.z);
    const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys), minZ=Math.min(...zs), maxZ=Math.max(...zs);
    let first=null;
    for(let z=minZ; z<=maxZ; z++){
      for(let y=minY; y<=maxY; y++){
        for(let x=minX; x<=maxX; x++){
          const v=window.Formula.getCellValue({arrId:cells[0].arrId,x,y,z}); 
          if(first===null) first=v;
          let nx=anchor.x, ny=anchor.y, nz=anchor.z;
          if(axis===0){ 
            const dx=x-minX, dy=y-minY;
            nx = anchor.x + dy;
            ny = anchor.y + (maxX-minX - dx);
            nz = anchor.z + (z-minZ);
          } else if(axis===1){ 
            const dy=y-minY, dz=z-minZ;
            nx = anchor.x + (x-minX);
            ny = anchor.y + dz;
            nz = anchor.z + (maxY-minY - dy);
          } else { 
            const dx=x-minX, dz=z-minZ;
            nx = anchor.x + dz;
            ny = anchor.y + (y-minY);
            nz = anchor.z + (maxX-minX - dx);
          }
          writeAt(nx,ny,nz,v,false);
        }
      }
    }
    writeAt(anchor.x,anchor.y,anchor.z,(first??''),true);
    finalizeEmissions();
    if(__ownsTx) Write.commit(tx);
    return;
  }
  
  // Fallback for list data
  let values = [];
  if(srcArg && (srcArg.type === 'FunctionCall' || srcArg.fn) && String(srcArg.name || srcArg.fn || '').toUpperCase()==='ARRAY'){
    const argList = srcArg.arguments || srcArg.args || [];
    values = argList.map(a=> {
      if(a && typeof a === 'object' && 'value' in a) return a.value;
      if(a && typeof a === 'object' && a.type === 'Literal') return a.value;
      return window.Formula.valOf(a);
    });
  } else {
    const raw=window.Formula.valOf(srcArg); 
    values = Array.isArray(raw)?raw.flat():[raw];
  }
  
  for(let i=0;i<values.length;i++){
    let nx=anchor.x, ny=anchor.y, nz=anchor.z;
    if(axis===0){ ny = anchor.y + i; }
    else if(axis===1){ nz = anchor.z + i; }
    else { nx = anchor.x + i; }
    writeAt(nx,ny,nz,values[i], i===0);
  }
  
  finalizeEmissions();
  if(__ownsTx) Write.commit(tx);
});

/**
 * OFFSET(base, dx, dy, dz) - Excel-style OFFSET
 * Lines 15757-15776 (~20 lines)
 */
tag('OFFSET',['PURE'], (anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const baseRef=ast.args[0];
  const dx=+valOf(ast.args[1])|0, dy=+valOf(ast.args[2])|0, dz=+valOf(ast.args[3])|0;
  
  let startPos = {x:anchor.x, y:anchor.y, z:anchor.z, arrId:anchor.arrId};
  if(baseRef && baseRef.kind==='ref'){
    startPos = {x:baseRef.x, y:baseRef.y, z:baseRef.z, arrId:baseRef.arrId};
  } else {
    const maybe = typeof baseRef==='string' ? window.parseAlt?.(String(baseRef)) : null;
    if(maybe){ startPos = {x:maybe.x,y:maybe.y,z:maybe.z,arrId:maybe.arrId}; }
  }
  
  const targetCoord = { x:startPos.x+dx, y:startPos.y+dy, z:startPos.z+dz, arrId:startPos.arrId };
  const value = window.Formula.getCellValue(targetCoord);
  return value;
});

/**
 * GET(ref) - Get value from reference
 * Lines 15777-15781 (~5 lines)
 */
tag('GET',['PURE'], (anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const ref=ast.args[0]; 
  if(ref&&ref.kind==='ref'){ 
    const v=valOf(ref); 
    window.Actions.setCell(arr.id,anchor, v, ast.raw, true); 
    return; 
  }
  throw new Error('GET needs a ref');
});

/**
 * ADDRESS(ref) - Return A1 address
 * Lines 15782-15785 (~4 lines)
 */
tag('ADDRESS',['PURE'],(anchor,arr,ast)=>{
  const t=(ast.args[0]&&ast.args[0].kind==='ref')?ast.args[0]:anchor;
  window.Actions.setCell(arr.id,anchor, `${A1(t.x)}${t.y+1}${greek(t.z)}`, ast.raw,true);
});

/**
 * SELF() - Return absolute reference to self
 * Lines 15787-15790 (~4 lines)
 */
tag('SELF',['PURE'],(anchor,arr,ast)=>{
  return `@[${anchor.x},${anchor.y},${anchor.z},${anchor.arrId}]`;
});

/**
 * IS_SELECTED([ref]) - Check if cell is selected
 * Lines 15792-15797 (~6 lines)
 */
tag('IS_SELECTED',['PURE'],(anchor,arr,ast)=>{
  const s=window.Store.getState().selection; 
  if(!s?.arrayId||!s.focus){ 
    window.Actions.setCell(arr.id,anchor,0,ast.raw,true); 
    return; 
  }
  const t=(ast.args[0]&&ast.args[0].kind==='ref')?ast.args[0]:anchor;
  const v=(s.arrayId===t.arrId && s.focus.x===t.x && s.focus.y===t.y && s.focus.z===t.z)?1:0;
  window.Actions.setCell(arr.id,anchor, v, ast.raw, true);
});

/**
 * ALT_ADDRESS(ref) - Return @[x,y,z,id] address
 * Lines 15798-15801 (~4 lines)
 */
tag('ALT_ADDRESS',['PURE'],(anchor,arr,ast)=>{
  const t=(ast.args[0]&&ast.args[0].kind==='ref')?ast.args[0]:anchor;
  window.Actions.setCell(arr.id,anchor, `@[${t.x},${t.y},${t.z},${t.arrId}]`, ast.raw,true);
});

