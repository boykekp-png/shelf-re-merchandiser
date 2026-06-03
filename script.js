// ============================================================
// Shelf Re‑merchandiser – JavaScript
// ============================================================

// ---------- State ----------
let shelves = [
  { id: 'shelf-1', name: 'Shelf 1', items: ['Apple', 'Banana', 'Cherry'] },
  { id: 'shelf-2', name: 'Shelf 2', items: ['Dates', 'Elderberry'] },
  { id: 'shelf-3', name: 'Shelf 3', items: ['Fig', 'Grape', 'Honeydew'] },
];

let clipboard = null;          // { itemText, sourceShelfId, sourceIndex }
let selectedItemId = null;     // e.g. 'item-<shelfId>-<index>'

// DOM references
const container = document.getElementById('shelfContainer');
const cutBtn = document.getElementById('cutBtn');
const pasteBtn = document.getElementById('pasteBtn');
const addShelfBtn = document.getElementById('addShelfBtn');

// ---------- Helpers ----------
function generateId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
}

function getItemId(shelfId, index) {
  return `item-${shelfId}-${index}`;
}

function parseItemId(itemId) {
  // itemId = "item-<shelfId>-<index>"
  const parts = itemId.split('-');
  const shelfId = parts.slice(1, -1).join('-'); // in case shelfId contains hyphens
  const index = parseInt(parts[parts.length - 1], 10);
  return { shelfId, index };
}

// ---------- Render ----------
function render() {
  container.innerHTML = '';

  shelves.forEach((shelf, shelfIndex) => {
    const shelfDiv = document.createElement('div');
    shelfDiv.className = 'shelf';
    shelfDiv.dataset.shelfId = shelf.id;

    // Header
    const header = document.createElement('div');
    header.className = 'shelf-header';

    const title = document.createElement('span');
    title.className = 'shelf-title';
    title.textContent = shelf.name;

    const actions = document.createElement('div');
    actions.className = 'shelf-actions';

    const renameBtn = document.createElement('button');
    renameBtn.textContent = '✏️';
    renameBtn.title = 'Rename shelf';
    renameBtn.addEventListener('click', () => {
      const newName = prompt('New shelf name:', shelf.name);
      if (newName && newName.trim()) {
        shelf.name = newName.trim();
        render();
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete shelf';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete "${shelf.name}" and all its items?`)) {
        shelves.splice(shelfIndex, 1);
        render();
      }
    });

    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);
    header.appendChild(title);
    header.appendChild(actions);
    shelfDiv.appendChild(header);

    // Items container
    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'shelf-items';
    itemsDiv.dataset.shelfId = shelf.id;

    // Drag‑and‑drop events on the container
    itemsDiv.addEventListener('dragover', (e) => {
      e.preventDefault();
      itemsDiv.classList.add('drag-over');
    });

    itemsDiv.addEventListener('dragleave', () => {
      itemsDiv.classList.remove('drag-over');
    });

    itemsDiv.addEventListener('drop', (e) => {
      e.preventDefault();
      itemsDiv.classList.remove('drag-over');

      const draggedItemId = e.dataTransfer.getData('text/plain');
      if (!draggedItemId) return;

      const { shelfId: fromShelfId, index: fromIndex } = parseItemId(draggedItemId);
      const toShelfId = itemsDiv.dataset.shelfId;

      // Determine drop index based on mouse position relative to items
      const afterElement = getDragAfterElement(itemsDiv, e.clientX);
      let toIndex;
      if (afterElement === undefined) {
        // drop at end
        const toShelf = shelves.find(s => s.id === toShelfId);
        toIndex = toShelf ? toShelf.items.length : 0;
      } else {
        const { shelfId: afterShelfId, index: afterIndex } = parseItemId(afterElement.dataset.itemId);
        toIndex = afterIndex;
      }

      moveItem(fromShelfId, fromIndex, toShelfId, toIndex);
    });

    // Build items
    shelf.items.forEach((itemText, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';
      itemDiv.draggable = true;
      itemDiv.dataset.itemId = getItemId(shelf.id, index);
      itemDiv.textContent = itemText;

      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shelf.items.splice(index, 1);
        render();
      });
      itemDiv.appendChild(removeBtn);

      // Drag start
      itemDiv.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', itemDiv.dataset.itemId);
        e.dataTransfer.effectAllowed = 'move';
        itemDiv.classList.add('dragging');
      });

      itemDiv.addEventListener('dragend', () => {
        itemDiv.classList.remove('dragging');
        document.querySelectorAll('.shelf-items').forEach(el => el.classList.remove('drag-over'));
      });

      // Click to select (for cut/paste)
      itemDiv.addEventListener('click', (e) => {
        // Ignore if clicking the remove button
        if (e.target.classList.contains('remove-btn')) return;
        selectItem(itemDiv.dataset.itemId);
      });

      itemsDiv.appendChild(itemDiv);
    });

    shelfDiv.appendChild(itemsDiv);
    container.appendChild(shelfDiv);
  });

  updateClipboardUI();
}

// Helper to determine drop index based on mouse X position
function getDragAfterElement(container, x) {
  const draggableElements = [...container.querySelectorAll('.item:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = x - box.left - box.width / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ---------- Move item (drag & drop) ----------
function moveItem(fromShelfId, fromIndex, toShelfId, toIndex) {
  const fromShelf = shelves.find(s => s.id === fromShelfId);
  const toShelf = shelves.find(s => s.id === toShelfId);
  if (!fromShelf || !toShelf) return;

  const [item] = fromShelf.items.splice(fromIndex, 1);
  if (!item) return;

  // If moving within same shelf, adjust toIndex if needed
  if (fromShelfId === toShelfId && fromIndex < toIndex) {
    toIndex = Math.max(0, toIndex - 1);
  }

  toShelf.items.splice(toIndex, 0, item);
  render();
}

// ---------- Selection ----------
function selectItem(itemId) {
  // Deselect previous
  if (selectedItemId) {
    const prev = document.querySelector(`[data-item-id="${selectedItemId}"]`);
    if (prev) prev.classList.remove('selected');
  }

  selectedItemId = itemId;
  const el = document.querySelector(`[data-item-id="${itemId}"]`);
  if (el) el.classList.add('selected');

  cutBtn.disabled = false;
  // Enable cut only if something selected
}

function deselectAll() {
  if (selectedItemId) {
    const prev = document.querySelector(`[data-item-id="${selectedItemId}"]`);
    if (prev) prev.classList.remove('selected');
  }
  selectedItemId = null;
  cutBtn.disabled = true;
}

// ---------- Cut / Paste ----------
function cutItem() {
  if (!selectedItemId) return;

  const { shelfId, index } = parseItemId(selectedItemId);
  const shelf = shelves.find(s => s.id === shelfId);
  if (!shelf) return;

  const itemText = shelf.items[index];
  if (itemText === undefined) return;

  // Store in clipboard
  clipboard = { itemText, sourceShelfId: shelfId, sourceIndex: index };

  // Remove from shelf
  shelf.items.splice(index, 1);

  deselectAll();
  render();
  pasteBtn.disabled = false;
}

function pasteItem() {
  if (!clipboard) return;

  // Find the shelf where the selected item is (or the first shelf if nothing selected)
  let targetShelfId;
  let targetIndex;

  if (selectedItemId) {
    const { shelfId, index } = parseItemId(selectedItemId);
    targetShelfId = shelfId;
    targetIndex = index; // paste before the selected item
  } else {
    // Default: paste into the first shelf at the end
    if (shelves.length === 0) return;
    targetShelfId = shelves[0].id;
    targetIndex = shelves[0].items.length;
  }

  const targetShelf = shelves.find(s => s.id === targetShelfId);
  if (!targetShelf) return;

  // Insert clipboard item
  targetShelf.items.splice(targetIndex, 0, clipboard.itemText);

  // Clear clipboard after paste (optional – you may want multiple pastes)
  clipboard = null;

  deselectAll();
  render();
  pasteBtn.disabled = true;
}

function updateClipboardUI() {
  pasteBtn.disabled = !clipboard;
}

// ---------- Keyboard shortcuts ----------
document.addEventListener('keydown', (e) => {
  // Ctrl+X or Cmd+X
  if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
    e.preventDefault();
    cutItem();
  }
  // Ctrl+V or Cmd+V
  if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
    e.preventDefault();
    pasteItem();
  }
  // Escape to deselect
  if (e.key === 'Escape') {
    deselectAll();
  }
});

// ---------- Add shelf ----------
addShelfBtn.addEventListener('click', () => {
  const name = prompt('Shelf name:', `Shelf ${shelves.length + 1}`);
  if (!name || !name.trim()) return;
  shelves.push({
    id: generateId(),
    name: name.trim(),
    items: [],
  });
  render();
});

// ---------- Toolbar buttons ----------
cutBtn.addEventListener('click', cutItem);
pasteBtn.addEventListener('click', pasteItem);

// ---------- Initial render ----------
render();
