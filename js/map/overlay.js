export function createMapOverlay({
  getPlayer,
  getYaw,
  getActiveChunks,
  getCityChunks,
  getBuildings,
  getVisitedBuildings,
  getMapScale,
  getMapChunkSize
}) {
  let mapVisible = false;
  let mapCanvas = null;
  let mapCtx = null;
  let hoveredBuilding = null;
  let initialized = false;

  function worldToMapScreen(worldX, worldZ) {
    if (!mapCanvas) return { x: 0, y: 0 };
    const centerX = mapCanvas.width / 2;
    const centerY = mapCanvas.height / 2;
    const player = getPlayer();
    const playerPos = player ? player.position : { x: 0, z: 0 };
    const scale = getMapScale();

    const relX = worldX - playerPos.x;
    const relZ = worldZ - playerPos.z;

    return {
      x: centerX + relX * scale,
      y: centerY + relZ * scale
    };
  }

  function renderMap() {
    if (!mapCtx || !mapCanvas) return;

    const ctx = mapCtx;
    const w = mapCanvas.width;
    const h = mapCanvas.height;
    const mapScale = getMapScale();
    const mapChunkSize = getMapChunkSize();
    const activeChunks = getActiveChunks();
    const cityChunks = getCityChunks();
    const buildings = getBuildings();
    const visitedBuildings = getVisitedBuildings();

    ctx.fillStyle = '#0a0d12';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(74, 124, 255, 0.2)';
    ctx.lineWidth = 1;
    activeChunks.forEach((chunkKey) => {
      const [cx, cz] = chunkKey.split(',').map(Number);
      const chunkWorldX = cx * mapChunkSize;
      const chunkWorldZ = cz * mapChunkSize;

      const corners = [
        worldToMapScreen(chunkWorldX, chunkWorldZ),
        worldToMapScreen(chunkWorldX + mapChunkSize, chunkWorldZ),
        worldToMapScreen(chunkWorldX + mapChunkSize, chunkWorldZ + mapChunkSize),
        worldToMapScreen(chunkWorldX, chunkWorldZ + mapChunkSize)
      ];

      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) {
        ctx.lineTo(corners[i].x, corners[i].y);
      }
      ctx.closePath();
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(120, 120, 120, 0.5)';
    ctx.lineWidth = 2;
    activeChunks.forEach((chunkKey) => {
      const chunk = cityChunks.get(chunkKey);
      if (chunk && chunk.roads) {
        chunk.roads.forEach((road) => {
          const start = worldToMapScreen(road.x1, road.z1);
          const end = worldToMapScreen(road.x2, road.z2);
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        });
      }
    });

    for (const buildingData of buildings) {
      if (!buildingData || !buildingData.mesh) continue;

      const building = buildingData.mesh;
      const buildingId = buildingData.id || building.userData.id || 'unknown';
      const isVisited = visitedBuildings.has(buildingId);
      const isHovered = hoveredBuilding === building;
      const isSpecial = building.userData.isSpecialBuilding || buildingData.isSpecialBuilding;

      const pos = worldToMapScreen(building.position.x, building.position.z);
      const w = (buildingData.width || building.userData.width || 20) * mapScale;
      const h = (buildingData.depth || building.userData.depth || 20) * mapScale;

      if (isHovered) {
        ctx.fillStyle = 'rgba(255, 200, 80, 0.8)';
        ctx.strokeStyle = 'rgba(255, 220, 100, 1.0)';
        ctx.lineWidth = 3;
      } else if (isSpecial) {
        ctx.fillStyle = isVisited ? 'rgba(255, 100, 150, 0.6)' : 'rgba(120, 60, 80, 0.4)';
        ctx.strokeStyle = 'rgba(255, 100, 150, 0.8)';
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = isVisited ? 'rgba(100, 140, 255, 0.6)' : 'rgba(60, 80, 120, 0.4)';
        ctx.strokeStyle = isVisited ? 'rgba(120, 160, 255, 0.8)' : 'rgba(74, 124, 255, 0.5)';
        ctx.lineWidth = isVisited ? 2 : 1;
      }

      ctx.fillRect(pos.x - w / 2, pos.y - h / 2, w, h);
      ctx.strokeRect(pos.x - w / 2, pos.y - h / 2, w, h);

      if (!isVisited && !isHovered) {
        ctx.fillStyle = 'rgba(180, 180, 180, 0.8)';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('???', pos.x, pos.y);
      }
    }

    ctx.fillStyle = 'rgba(100, 255, 100, 0.8)';
    ctx.strokeStyle = 'rgba(150, 255, 150, 1.0)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const yaw = getYaw();
    const dirX = Math.sin(yaw);
    const dirZ = Math.cos(yaw);
    ctx.strokeStyle = 'rgba(150, 255, 150, 1.0)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2);
    ctx.lineTo(w / 2 + dirX * 15, h / 2 + dirZ * 15);
    ctx.stroke();

    const discoveredCount = visitedBuildings.size;
    const totalCount = buildings.length;
    const chunksEl = document.getElementById('map-chunks-loaded');
    const buildingsEl = document.getElementById('map-buildings-discovered');
    if (chunksEl) chunksEl.textContent = `Chunks: ${activeChunks.size}`;
    if (buildingsEl) buildingsEl.textContent = `Buildings: ${discoveredCount}/${totalCount}`;
  }

  function updateVisitedBuildings() {
    const player = getPlayer();
    if (!player) return;

    const visitedBuildings = getVisitedBuildings();
    const buildings = getBuildings();
    const visitRadiusSq = 30 * 30;

    for (const buildingData of buildings) {
      if (!buildingData || !buildingData.mesh) continue;

      const building = buildingData.mesh;
      const buildingId = buildingData.id || building.userData.id || 'unknown';
      if (visitedBuildings.has(buildingId)) continue;

      const dx = building.position.x - player.position.x;
      const dz = building.position.z - player.position.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < visitRadiusSq) {
        visitedBuildings.add(buildingId);
      }
    }
  }

  function initOverlay() {
    if (initialized) return;
    mapCanvas = document.getElementById('map-canvas');
    if (!mapCanvas) return;

    mapCtx = mapCanvas.getContext('2d');
    mapCanvas.width = mapCanvas.clientWidth;
    mapCanvas.height = mapCanvas.clientHeight;

    const closeBtn = document.getElementById('map-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        mapVisible = false;
        document.getElementById('map-overlay').style.display = 'none';
      });
    }

    document.getElementById('map-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'map-overlay') {
        mapVisible = false;
        document.getElementById('map-overlay').style.display = 'none';
      }
    });

    mapCanvas.addEventListener('mousemove', (e) => {
      if (!mapVisible) return;

      const rect = mapCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      hoveredBuilding = null;
      for (const buildingData of getBuildings()) {
        if (!buildingData || !buildingData.mesh) continue;

        const building = buildingData.mesh;
        const buildingScreenPos = worldToMapScreen(building.position.x, building.position.z);
        const buildingSize = {
          w: (buildingData.width || building.userData.width || 20) * getMapScale(),
          h: (buildingData.depth || building.userData.depth || 20) * getMapScale()
        };

        if (
          mouseX >= buildingScreenPos.x - buildingSize.w / 2 &&
          mouseX <= buildingScreenPos.x + buildingSize.w / 2 &&
          mouseY >= buildingScreenPos.y - buildingSize.h / 2 &&
          mouseY <= buildingScreenPos.y + buildingSize.h / 2
        ) {
          hoveredBuilding = building;
          break;
        }
      }

      const hoverInfo = document.getElementById('map-hover-info');
      if (hoverInfo) {
        if (hoveredBuilding) {
          const hoveredData = getBuildings().find((b) => b.mesh === hoveredBuilding);
          const buildingId = (hoveredData && hoveredData.id) || hoveredBuilding.userData.id || 'Unknown';
          const isVisited = getVisitedBuildings().has(buildingId);
          const buildingType = (hoveredData && hoveredData.isSpecialBuilding) || hoveredBuilding.userData.isSpecialBuilding
            ? (hoveredBuilding.userData.specialType || 'Special')
            : 'Building';

          hoverInfo.textContent = isVisited
            ? `${buildingType} #${buildingId}`
            : `${buildingType} ??? (not visited)`;
        } else {
          hoverInfo.textContent = '';
        }
      }

      renderMap();
    });

    window.addEventListener('resize', () => {
      if (mapCanvas) {
        mapCanvas.width = mapCanvas.clientWidth;
        mapCanvas.height = mapCanvas.clientHeight;
        if (mapVisible) renderMap();
      }
    });

    initialized = true;
  }

  function toggle() {
    initOverlay();
    mapVisible = !mapVisible;
    const overlay = document.getElementById('map-overlay');
    if (overlay) {
      overlay.style.display = mapVisible ? 'flex' : 'none';
    }
    if (mapVisible) {
      renderMap();
    }
  }

  function renderIfVisible() {
    if (mapVisible) {
      renderMap();
    }
  }

  return {
    toggle,
    renderIfVisible,
    updateVisitedBuildings
  };
}
