/**
 * ArrayaAvatarFactory - Worm-like Character System
 * 
 * Extracted from merged2.html lines 27670-28200
 * 
 * Creates the Arraya avatar - a segmented worm-like character
 * with smooth curves, eyes, and smile that follows a parametric path.
 * 
 * Features:
 * - 6-segment body with smooth curves
 * - Dynamic geometry updates
 * - Eyes and smile positioned on head
 * - Outlines for cartoon effect
 * - Animation support
 */

const ARRAYA_BASE_SCALE = 0.28;

export const ArrayaAvatarFactory = (function(){
  function push(arr, ...v){ for(const x of v) arr.push(x); }

  function roundedBoxGeometry(w, h, d, seg=6, round=0.45){
    const hw=w/2, hh=h/2, hd=d/2;
    const positions=[]; const indices=[];
    function face(uSeg,vSeg, constX,constY,constZ, ux,uy,uz, vx,vy,vz, flip){
      const base = positions.length/3;
      for(let j=0;j<=vSeg;j++){
        for(let i=0;i<=uSeg;i++){
          const u=i/uSeg, v=j/vSeg;
          const x = constX + ux*(u-0.5) + vx*(v-0.5);
          const y = constY + uy*(u-0.5) + vy*(v-0.5);
          const z = constZ + uz*(u-0.5) + vz*(v-0.5);
          push(positions, x,y,z);
        }
      }
      for(let j=0;j<vSeg;j++){
        for(let i=0;i<uSeg;i++){
          const a = base + i + (uSeg+1)*j;
          const b = base + i+1 + (uSeg+1)*j;
          const c = base + i + (uSeg+1)*(j+1);
          const d = base + i+1 + (uSeg+1)*(j+1);
          if (!flip) { push(indices, a,c,b, b,c,d); } else { push(indices, a,b,c, b,d,c); }
        }
      }
    }
    const sx=seg, sy=seg, sz=seg;
    face(sx,sy, 0,0, hd, w,0,0, 0,h,0, false);
    face(sx,sy, 0,0,-hd, w,0,0, 0,h,0, true);
    face(sz,sy, hw,0,0, 0,0,d, 0,h,0, false);
    face(sz,sy,-hw,0,0, 0,0,d, 0,h,0, true);
    face(sx,sz, 0,hh,0, w,0,0, 0,0,d, true);
    face(sx,sz, 0,-hh,0, w,0,0, 0,0,d, false);

    for(let i=0;i<positions.length;i+=3){
      let x=positions[i]/hw, y=positions[i+1]/hh, z=positions[i+2]/hd;
      const x2=x*x,y2=y*y,z2=z*z;
      const sx=x*Math.sqrt(Math.max(0.0,1.0-0.5*(y2+z2)+(y2*z2)/3.0));
      const sy=y*Math.sqrt(Math.max(0.0,1.0-0.5*(z2+x2)+(z2*x2)/3.0));
      const sz=z*Math.sqrt(Math.max(0.0,1.0-0.5*(x2+y2)+(x2*y2)/3.0));
      x = x*(1.0-round) + sx*round;
      y = y*(1.0-round) + sy*round;
      z = z*(1.0-round) + sz*round;
      positions[i]=x*hw; positions[i+1]=y*hh; positions[i+2]=z*hd;
    }
    return { positions:new Float32Array(positions), indices:new Uint32Array(indices) };
  }

  function cylinderGeometry(r=0.07,h=0.06, seg=24){
    const pos=[], nor=[], idx=[]; const half=h/2;
    for(let i=0;i<=seg;i++){
      const a=i/seg*2*Math.PI; const x=Math.cos(a), y=Math.sin(a);
      push(pos, r*x, r*y, -half, r*x, r*y, half);
      push(nor, x,y,0, x,y,0);
    }
    for(let i=0;i<seg;i++){
      const a=i*2, b=a+1, c=a+2, d=a+3;
      push(idx, a,c,b, b,c,d);
    }
    const base = pos.length/3;
    for(let j=0;j<2;j++){
      const z = j? half : -half; const nz = j? 1:-1; const centerIndex = pos.length/3; push(pos,0,0,z); push(nor,0,0,nz);
      for(let i=0;i<=seg;i++){ const a=i/seg*2*Math.PI; const x=Math.cos(a), y=Math.sin(a); push(pos,r*x,r*y,z); push(nor,0,0,nz); }
      for(let i=0;i<seg;i++){ const ci=centerIndex, vi=centerIndex+1+i; if(j){ push(idx, ci, vi, vi+1);} else { push(idx, ci, vi+1, vi);} }
    }
    return { positions:new Float32Array(pos), normals:new Float32Array(nor), indices:new Uint16Array(idx) };
  }

  function torusGeometry(R=0.18, r=0.028, arc=Math.PI, segU=56, segV=16, endSmooth=0.25, endMin=0.55){
    const pos=[], nor=[], idx=[];
    const sstep = (x)=> x<=0?0 : x>=1?1 : x*x*(3-2*x);
    for(let j=0;j<=segV;j++){
      const v=j/segV*2*Math.PI; const cv=Math.cos(v), sv=Math.sin(v);
      for(let i=0;i<=segU;i++){
        const t=i/segU;
        const u=t*arc - arc;
        const cu=Math.cos(u), su=Math.sin(u);
        let w=1.0;
        if(endSmooth>0){
          const edge = Math.min(t/endSmooth, (1.0 - t)/endSmooth);
          const k = sstep(Math.max(0, Math.min(1, edge)));
          w = endMin + (1.0 - endMin) * k;
        }
        const re = r * w;
        const cx = R * cu, cy = R * su;
        const x=(R + re*cv)*cu;
        const y=(R + re*cv)*su;
        const z=re*sv;
        push(pos, x,y,z);
        let nx = x - cx, ny = y - cy, nz = z;
        const len = Math.hypot(nx,ny,nz) || 1.0;
        nx/=len; ny/=len; nz/=len;
        push(nor, nx,ny,nz);
      }
    }
    for(let j=0;j<segV;j++){
      for(let i=0;i<segU;i++){
        const a=i + (segU+1)*j;
        const b=i+1 + (segU+1)*j;
        const c=i + (segU+1)*(j+1);
        const d=i+1 + (segU+1)*(j+1);
        push(idx, a,c,b, b,c,d);
      }
    }
    return { positions:new Float32Array(pos), normals:new Float32Array(nor), indices:new Uint32Array(idx) };
  }

  function computeNormals(positions, indices, out){
    out.fill(0);
    for(let i=0;i<indices.length;i+=3){
      const ia=indices[i]*3, ib=indices[i+1]*3, ic=indices[i+2]*3;
      const ax=positions[ia], ay=positions[ia+1], az=positions[ia+2];
      const bx=positions[ib], by=positions[ib+1], bz=positions[ib+2];
      const cx=positions[ic], cy=positions[ic+1], cz=positions[ic+2];
      const abx=bx-ax, aby=by-ay, abz=bz-az;
      const acx=cx-ax, acy=cy-ay, acz=cz-az;
      let nx=aby*acz-abz*acy, ny=abz*acx-abx*acz, nz=abx*acy-aby*acx;
      const inv=1/Math.hypot(nx,ny,nz);
      nx*=inv; ny*=inv; nz*=inv;
      out[ia]+=nx; out[ia+1]+=ny; out[ia+2]+=nz;
      out[ib]+=nx; out[ib+1]+=ny; out[ib+2]+=nz;
      out[ic]+=nx; out[ic+1]+=ny; out[ic+2]+=nz;
    }
    for(let i=0;i<out.length;i+=3){
      const inv=1/Math.hypot(out[i],out[i+1],out[i+2]);
      out[i]*=inv; out[i+1]*=inv; out[i+2]*=inv;
    }
    return out;
  }

  const W=1.45, H=1.1, D=1.2;
  const cubeBase = roundedBoxGeometry(W,H,D,8,0.45);
  const eyeBase = cylinderGeometry(0.085, 0.06, 24);
  const smileBase = torusGeometry(0.18, 0.028, Math.PI, 56, 16, 0.35, 0.70);
  const greensRaw = [
    [0.75,0.94,0.42],
    [0.65,0.88,0.36],
    [0.55,0.83,0.32],
    [0.46,0.78,0.27],
    [0.36,0.71,0.23],
    [0.29,0.65,0.20]
  ];

  const JOIN_EPS = 0.05;
  const HEAD_BULGE = 0.12;
  const TAIL_BULGE = 0.08;
  const HEAD_FACE_EXPAND = 0.10;
  const GLOBAL_ROT_X = Math.PI/2;
  const GLOBAL_ROT_Z = -Math.PI/2;
  const NSEG = 6;
  const segLen = D;
  const L = NSEG * segLen;
  const thetaAmp = 0.70;
  const yAmp = 0.0;
  const ds = Math.max(0.01, L/320);

  function cross(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function normalize(v){ const l=Math.hypot(v[0],v[1],v[2]); return l? [v[0]/l,v[1]/l,v[2]/l] : [0,1,0]; }
  function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }
  function smoothstep(a,b,x){ const t = clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); }
  function rotX(v,a){ const c=Math.cos(a), s=Math.sin(a); return [ v[0], v[1]*c - v[2]*s, v[1]*s + v[2]*c ]; }
  function rotZ(v,a){ const c=Math.cos(a), s=Math.sin(a); return [ v[0]*c - v[1]*s, v[0]*s + v[1]*c, v[2] ]; }

  /**
   * Create Arraya avatar (worm-like character)
   * Extracted from merged2.html lines 27670-28170
   */
  function createArraya(THREE) {
    // Build curve samples for the worm body
    let samples=[];
    (function rebuildCurve(){
      samples=[];
      let p=[0, H/2, 0];
      let tan=[0,0,1];
      samples.push({ s:0, p:p.slice(), t:tan.slice() });
      for(let s=ds; s<=L+1e-6; s+=ds){
        const theta = thetaAmp * Math.sin(2*Math.PI * (s/L));
        const dy_ds = yAmp * (Math.PI / L) * Math.cos(Math.PI * s / L);
        tan = normalize([ Math.sin(theta), dy_ds, Math.cos(theta) ]);
        p = [ p[0] + tan[0]*ds, p[1] + tan[1]*ds, p[2] + tan[2]*ds ];
        samples.push({ s: Math.min(s,L), p:p.slice(), t:tan.slice() });
      }
    })();

    function sampleFrameAt(s){
      if (s <= 0){
        const t0 = samples[0].t; const up=[0,1,0];
        let side = cross(up, t0); let Ls=Math.hypot(side[0],side[1],side[2]);
        if (Ls<1e-6) side=[1,0,0], Ls=1; side=[side[0]/Ls, side[1]/Ls, side[2]/Ls];
        const up2 = cross(t0, side);
        return { p: samples[0].p.slice(), t: t0.slice(), side, up: up2 };
      }
      if (s >= L){
        const last = samples[samples.length-1]; const up=[0,1,0];
        let side = cross(up, last.t); let Ls=Math.hypot(side[0],side[1],side[2]);
        if (Ls<1e-6) side=[1,0,0], Ls=1; side=[side[0]/Ls, side[1]/Ls, side[2]/Ls];
        const up2 = cross(last.t, side);
        return { p: last.p.slice(), t: last.t.slice(), side, up: up2 };
      }
      const i = Math.min(samples.length-2, Math.max(0, Math.floor(s/ds)));
      const a = samples[i], b = samples[i+1];
      const tt = (s - a.s) / (b.s - a.s);
      const lerp = (x,y)=> x + (y-x)*tt;
      const p=[ lerp(a.p[0],b.p[0]), lerp(a.p[1],b.p[1]), lerp(a.p[2],b.p[2]) ];
      let tan=[ lerp(a.t[0],b.t[0]), lerp(a.t[1],b.t[1]), lerp(a.t[2],b.t[2]) ];
      tan = normalize(tan);
      const up=[0,1,0];
      let side=cross(up, tan); let Ls=Math.hypot(side[0],side[1],side[2]);
      if (Ls<1e-6) side=[1,0,0], Ls=1; side=[side[0]/Ls, side[1]/Ls, side[2]/Ls];
      const up2 = cross(tan, side);
      return { p, t:tan, side, up: up2 };
    }

    function rotateFrame(F){
      const pX = rotX(F.p, GLOBAL_ROT_X); const tX = rotX(F.t, GLOBAL_ROT_X);
      const sX = rotX(F.side, GLOBAL_ROT_X); const uX = rotX(F.up, GLOBAL_ROT_X);
      return { p: rotZ(pX, GLOBAL_ROT_Z), t: rotZ(tX, GLOBAL_ROT_Z), side: rotZ(sX, GLOBAL_ROT_Z), up: rotZ(uX, GLOBAL_ROT_Z) };
    }

    function toVector3(arr){ return new THREE.Vector3(arr[0], arr[1], arr[2]); }

    function projectUp(N){
      const U=[0,1,0];
      const dot = U[0]*N[0]+U[1]*N[1]+U[2]*N[2];
      let up=[ U[0]-dot*N[0], U[1]-dot*N[1], U[2]-dot*N[2] ];
      let L = Math.hypot(up[0],up[1],up[2]);
      if (L < 1e-4){
        const WR=[1,0,0];
        const dot2 = WR[0]*N[0]+WR[1]*N[1]+WR[2]*N[2];
        up=[ WR[0]-dot2*N[0], WR[1]-dot2*N[1], WR[2]-dot2*N[2] ];
        L = Math.hypot(up[0],up[1],up[2]);
      }
      return [up[0]/L, up[1]/L, up[2]/L];
    }

    const group = new THREE.Group();
    group.name = 'ArrayaAvatar';
    group.scale.setScalar(ARRAYA_BASE_SCALE);
    const greens = greensRaw.map(rgb=> new THREE.Color(rgb[0], rgb[1], rgb[2]));
    const segments=[];
    const darkGray = new THREE.Color(0x1f2937);
    
    for(let i=0;i<NSEG;i++){
      const geometry = new THREE.BufferGeometry();
      const posArray = new Float32Array(cubeBase.positions.length);
      const norArray = new Float32Array(cubeBase.positions.length);
      geometry.setAttribute('position', new THREE.BufferAttribute(posArray,3));
      geometry.setAttribute('normal', new THREE.BufferAttribute(norArray,3));
      const IndexType = cubeBase.indices.constructor;
      const indexCopy = new IndexType(cubeBase.indices);
      geometry.setIndex(new THREE.BufferAttribute(indexCopy, 1));
      const mat = new THREE.MeshStandardMaterial({ color: greens[i], side: THREE.DoubleSide, roughness: 0.7, metalness: 0.1 });
      mat.depthTest = true; mat.depthWrite = true; mat.toneMapped = false;
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.castShadow = false; mesh.receiveShadow = false;
      mesh.renderOrder = 50;
      
      // Add shell
      const shellGeometry = new THREE.BufferGeometry();
      const shellPosArray = new Float32Array(cubeBase.positions.length);
      const shellNorArray = new Float32Array(cubeBase.positions.length);
      shellGeometry.setAttribute('position', new THREE.BufferAttribute(shellPosArray,3));
      shellGeometry.setAttribute('normal', new THREE.BufferAttribute(shellNorArray,3));
      const shellIndexCopy = new IndexType(cubeBase.indices);
      shellGeometry.setIndex(new THREE.BufferAttribute(shellIndexCopy, 1));
      const shellMat = new THREE.MeshStandardMaterial({ color: darkGray, side: THREE.BackSide, roughness: 0.8, metalness: 0.05 });
      shellMat.depthTest = true; shellMat.depthWrite = false;
      shellMat.toneMapped = false;
      const shellMesh = new THREE.Mesh(shellGeometry, shellMat);
      shellMesh.castShadow = false; shellMesh.receiveShadow = false;
      shellMesh.renderOrder = 40;
      shellMesh.scale.setScalar(1.06);
      mesh.add(shellMesh);
      
      group.add(mesh);
      segments.push({ mesh, posArray, norArray, geometry, shellMesh, shellPosArray, shellNorArray, shellGeometry });
    }

    function buildStaticGeometry(base){
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(base.positions.slice(),3));
      if(base.normals){ geometry.setAttribute('normal', new THREE.BufferAttribute(base.normals.slice(),3)); }
      if(base.indices && base.indices.length > 0){ 
        const IndexType = base.indices.constructor;
        const indexCopy = new IndexType(base.indices);
        geometry.setIndex(new THREE.BufferAttribute(indexCopy, 1));
      }
      return geometry;
    }

    const eyeGeo = buildStaticGeometry(eyeBase);
    if(!eyeBase.normals){
      const normals = new Float32Array(eyeBase.positions.length);
      computeNormals(eyeBase.positions, eyeBase.indices, normals);
      eyeGeo.attributes.normal.array.set(normals);
    }
    const smileGeo = buildStaticGeometry(smileBase);
    if(!smileBase.normals){
      const normals = new Float32Array(smileBase.positions.length);
      computeNormals(smileBase.positions, smileBase.indices, normals);
      smileGeo.attributes.normal.array.set(normals);
    }

    const featureMat = new THREE.MeshStandardMaterial({ 
      roughness: 0.7, 
      metalness: 0.1, 
      color: new THREE.Color(0.06,0.07,0.07), 
      side: THREE.FrontSide 
    });
    featureMat.depthTest = true; 
    featureMat.depthWrite = true; 
    featureMat.toneMapped = false;
    featureMat.colorWrite = true;
    
    const eyeL = new THREE.Mesh(eyeGeo, featureMat.clone());
    const eyeR = new THREE.Mesh(eyeGeo, featureMat.clone());
    const smileMat = featureMat.clone();
    smileMat.side = THREE.DoubleSide;
    smileMat.needsUpdate = true;
    const smile = new THREE.Mesh(smileGeo, smileMat);
    eyeL.castShadow = eyeR.castShadow = smile.castShadow = false;
    eyeL.receiveShadow = eyeR.receiveShadow = smile.receiveShadow = false;
    eyeL.renderOrder = 100;
    eyeR.renderOrder = 100;
    smile.renderOrder = 100;
    eyeL.frustumCulled = false;
    eyeR.frustumCulled = false;
    smile.frustumCulled = false;
    group.add(eyeL, eyeR, smile);

    // Add outlines
    const MAT_OUTLINE = new THREE.MeshBasicMaterial({ color: 0x1f2937 });
    MAT_OUTLINE.depthTest = true;
    MAT_OUTLINE.depthWrite = false;
    MAT_OUTLINE.toneMapped = false;
    MAT_OUTLINE.transparent = false;
    const outlineScale = 1.08;
    const baseMeshes = [];
    group.traverse(n=>{ if(n.isMesh && !n.userData.isAvatarOutline) baseMeshes.push(n); });
    baseMeshes.forEach(mesh=>{
      const outline = new THREE.Mesh(mesh.geometry, MAT_OUTLINE);
      outline.name = `${mesh.name||'part'}_outline`;
      outline.userData.isAvatarOutline = true;
      outline.scale.set(outlineScale, outlineScale, outlineScale);
      outline.position.set(0,0,0);
      outline.castShadow = false;
      outline.receiveShadow = false;
      outline.renderOrder = Math.max(0, (mesh.renderOrder ?? 50) - 10);
      mesh.add(outline);
    });

    const hd = D/2;
    const pivotVec = new THREE.Vector3();
    const sFace = 0.006;

    const controller = {
      group,
      visible:false,
      needsUpdate:true,
      headOffset:new THREE.Vector3(),
      centerOffset:new THREE.Vector3(),
      
      setVisible(v){
        if(this.visible !== v){
          this.visible = v;
          group.visible = v;
          if(v) this.needsUpdate = true;
        } else {
          group.visible = v;
          if(v) this.needsUpdate = true;
        }
      },
      
      setAnchor(vec){ 
        group.position.copy(vec); 
      },
      
      update(time){
        if(!this.needsUpdate) return;
        const pivotFrame = rotateFrame(sampleFrameAt(0));
        pivotVec.set(pivotFrame.p[0], pivotFrame.p[1], pivotFrame.p[2]);

        // Update each segment
        for(let i=0;i<NSEG;i++){
          const sStart = i * segLen;
          const posTarget = segments[i].posArray;
          const basePos = cubeBase.positions;
          for(let v=0; v<basePos.length; v+=3){
            let x0 = basePos[v+0];
            let y0 = basePos[v+1];
            const z0 = basePos[v+2];
            let s = sStart + (z0 + hd);
            if (i>0 && i<NSEG) s -= JOIN_EPS;
            s = clamp(s, 0, L);
            const FR = rotateFrame(sampleFrameAt(s));
            const u = clamp((s - sStart) / segLen, 0, 1);
            if (i === 0){
              const mask = smoothstep(0.0, 0.3, 1.0 - u);
              const expand = 1.0 + HEAD_FACE_EXPAND * mask;
              x0 *= expand; y0 *= expand;
            }
            let px = FR.p[0] + x0*FR.side[0] + y0*FR.up[0];
            let py = FR.p[1] + x0*FR.side[1] + y0*FR.up[1];
            let pz = FR.p[2] + x0*FR.side[2] + y0*FR.up[2];
            const rx = Math.abs(x0)/(W*0.5), ry = Math.abs(y0)/(H*0.5);
            const radial = clamp(1.0 - 0.6*Math.max(rx, ry), 0, 1);
            let bulge = 0.0;
            if (i === 0){
              bulge = HEAD_BULGE * smoothstep(0.65, 1.0, u) * radial;
            } else if (i === NSEG-1){
              bulge = TAIL_BULGE * smoothstep(0.65, 1.0, u) * radial;
            }
            if (bulge > 0.0){
              px += FR.t[0]*bulge; py += FR.t[1]*bulge; pz += FR.t[2]*bulge;
            }
            px -= pivotVec.x; py -= pivotVec.y; pz -= pivotVec.z;
            posTarget[v+0] = px; posTarget[v+1] = py; posTarget[v+2] = pz;
          }
          computeNormals(posTarget, cubeBase.indices, segments[i].norArray);
          segments[i].mesh.geometry.attributes.position.needsUpdate = true;
          segments[i].mesh.geometry.attributes.normal.needsUpdate = true;
          segments[i].geometry.computeBoundingSphere();
          segments[i].geometry.computeBoundingBox();
          
          if(segments[i].shellMesh){
            segments[i].shellPosArray.set(posTarget);
            segments[i].shellNorArray.set(segments[i].norArray);
            segments[i].shellMesh.geometry.attributes.position.needsUpdate = true;
            segments[i].shellMesh.geometry.attributes.normal.needsUpdate = true;
            segments[i].shellGeometry.computeBoundingSphere();
            segments[i].shellGeometry.computeBoundingBox();
          }
        }

        // Position eyes and smile on head
        const FfaceR = rotateFrame(sampleFrameAt(sFace));
        const facePos = new THREE.Vector3(FfaceR.p[0], FfaceR.p[1], FfaceR.p[2]).sub(pivotVec);
        const N = normalize([-FfaceR.t[0], -FfaceR.t[1], -FfaceR.t[2]]);
        let up = projectUp(N);
        const right = normalize(cross(up, N));
        up = normalize(cross(N, right));

        const normalVec = toVector3(N);
        const upVec = toVector3(up);
        const rightVec = toVector3(right);
        const basis = new THREE.Matrix4().makeBasis(rightVec, upVec, normalVec);

        const inset = 0.010;
        const EYE_SPACING = 0.20;
        const EYE_Y = 0.15;
        const scaleH = 0.85, scaleV = 1.15, scaleN = 0.65;

        function placeEye(mesh, sign){
          mesh.position.set(
            facePos.x + sign*EYE_SPACING*rightVec.x + EYE_Y*upVec.x - inset*normalVec.x,
            facePos.y + sign*EYE_SPACING*rightVec.y + EYE_Y*upVec.y - inset*normalVec.y,
            facePos.z + sign*EYE_SPACING*rightVec.z + EYE_Y*upVec.z - inset*normalVec.z
          );
          mesh.quaternion.setFromRotationMatrix(basis);
          mesh.scale.set(scaleH, scaleV, scaleN);
        }

        placeEye(eyeL, -1);
        placeEye(eyeR, 1);

        const smileInset = 0.006;
        const offUp = -0.02;
        smile.quaternion.setFromRotationMatrix(basis);
        smile.position.set(
          facePos.x + offUp*upVec.x + smileInset*normalVec.x,
          facePos.y + offUp*upVec.y + smileInset*normalVec.y,
          facePos.z + offUp*upVec.z + smileInset*normalVec.z
        );
        smile.scale.set(1,1,0.72);

        this.headOffset.copy(facePos);
        this.needsUpdate = false;
      }
    };

    controller.update(0);
    return controller;
  }

  return { create: createArraya };
})();

export default ArrayaAvatarFactory;

