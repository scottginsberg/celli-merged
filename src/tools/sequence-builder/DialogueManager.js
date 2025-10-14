/**
 * Dialogue Manager
 * Manages dialogue nodes and sequences
 */

export class DialogueManager {
  constructor() {
    this.dialogues = [];
    this.selectedDialogue = null;
  }

  createDialogue(data = {}) {
    const dialogue = {
      id: Date.now(),
      speaker: data.speaker || 'Unknown',
      text: data.text || '',
      display: data.display || 'subtitle',
      timestamp: data.timestamp || 0,
      duration: data.duration || 3.0,
      ...data
    };
    this.dialogues.push(dialogue);
    return dialogue;
  }

  updateDialogue(id, updates) {
    const dialogue = this.dialogues.find(d => d.id === id);
    if (dialogue) {
      Object.assign(dialogue, updates);
    }
    return dialogue;
  }

  deleteDialogue(id) {
    const index = this.dialogues.findIndex(d => d.id === id);
    if (index > -1) {
      this.dialogues.splice(index, 1);
    }
  }

  exportDialogues() {
    return {
      dialogues: this.dialogues,
      count: this.dialogues.length
    };
  }

  importDialogues(data) {
    if (data.dialogues) {
      this.dialogues = data.dialogues;
    }
  }
}

