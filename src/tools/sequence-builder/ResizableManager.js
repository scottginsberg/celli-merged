/**
 * Resizable Manager
 * Handles resizable panel functionality
 */

export class ResizableManager {
  constructor(container) {
    this.container = container;
    this.handles = document.querySelectorAll('.resize-handle');
    this.isResizing = false;
    this.currentHandle = null;
    this.startX = 0;
    this.startY = 0;
    this.startWidths = [];
  }

  init() {
    this.handles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => this.startResize(e, handle));
    });

    document.addEventListener('mousemove', (e) => this.resize(e));
    document.addEventListener('mouseup', () => this.stopResize());
  }

  startResize(e, handle) {
    this.isResizing = true;
    this.currentHandle = handle;
    this.startX = e.clientX;
    this.startY = e.clientY;
    
    const style = window.getComputedStyle(this.container);
    const columns = style.gridTemplateColumns.split(' ');
    this.startWidths = columns.map(c => parseFloat(c));
    
    handle.classList.add('active');
    e.preventDefault();
  }

  resize(e) {
    if (!this.isResizing) return;

    const handleNum = this.currentHandle.dataset.handle;
    
    if (handleNum === 'bottom') {
      // Vertical resize
      const deltaY = e.clientY - this.startY;
      const bottomHeight = this.startWidths[2] || 180;
      const newHeight = Math.max(100, Math.min(400, bottomHeight - deltaY));
      
      this.container.style.gridTemplateRows = `60px 1fr ${newHeight}px`;
      
      // Update bottom handle position
      const bottomHandle = document.querySelector('.resize-handle-bottom');
      if (bottomHandle) {
        bottomHandle.style.bottom = `${newHeight}px`;
      }
    } else {
      // Horizontal resize
      const deltaX = e.clientX - this.startX;
      const handleIndex = parseInt(handleNum) - 1;
      
      const newWidths = [...this.startWidths];
      newWidths[handleIndex] = Math.max(200, newWidths[handleIndex] + deltaX);
      
      this.container.style.gridTemplateColumns = newWidths.map(w => `${w}px`).join(' ');
      
      // Update handle positions dynamically
      if (handleNum === '1') {
        this.currentHandle.style.left = `${newWidths[0]}px`;
      } else if (handleNum === '2') {
        const rightPos = newWidths[2] + newWidths[3];
        this.currentHandle.style.right = `${rightPos}px`;
      } else if (handleNum === '3') {
        this.currentHandle.style.right = `${newWidths[3]}px`;
      }
    }
  }

  stopResize() {
    if (!this.isResizing) return;
    
    this.isResizing = false;
    if (this.currentHandle) {
      this.currentHandle.classList.remove('active');
    }
    this.currentHandle = null;
    
    // Notify viewport to resize
    if (window.viewportManager) {
      setTimeout(() => window.viewportManager.handleResize(), 100);
    }
  }
}

