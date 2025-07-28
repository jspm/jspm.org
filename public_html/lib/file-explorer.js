import { LitElement, html } from 'lit-element';
import fileExplorerStyles from './file-explorer.css' with { type: 'css' };

export class JspmFileExplorer extends LitElement {
  static styles = fileExplorerStyles;
  static get properties () {
    return {
      files: { type: Object },
      selectedFile: { type: String },
      expandedFolders: { type: Set },
      renamingPath: { type: String }
    };
  }

  constructor () {
    super();
    this.files = {};
    this.selectedFile = 'index.html';
    this.expandedFolders = new Set();
    this.renamingPath = null;
    this.restoreExpandedFolders();
  }

  render () {
    return html`
      <div class="file-explorer">
        <div class="file-explorer-header">
          <span>Files</span>
          <div class="file-actions">
            <button class="icon-btn" @click=${this.createNewFile} title="New File">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M9.5 1.1l3.4 3.5.1.4v2h-1V6H8V2H3v11h4v1H2.5l-.5-.5v-12l.5-.5h6.7l.3.1zM9 2v3h2.9L9 2zm4 7v3h-3v1h3v3h1v-3h3v-1h-3V9h-1z"/>
              </svg>
            </button>
            <button class="icon-btn" @click=${this.createNewFolder} title="New Folder">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.51 8.49V13h-12V7h4.49l.35-.15.86-.86H14v5.5z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="file-tree">
          ${this.renderFileTree()}
        </div>
      </div>
    `;
  }

  renderFileTree () {
    const fileSystem = this.buildFileSystem();
    return this.renderFolder(fileSystem, '');
  }

  buildFileSystem () {
    const root = {
      'importmap.js': { type: 'file', path: 'importmap.js' }
    };

    Object.keys(this.files).forEach(path => {
      const parts = path.split('/');
      let current = root;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // It's a file
          current[part] = { type: 'file', path };
        } else {
          // It's a folder
          if (!current[part]) {
            current[part] = { type: 'folder', children: {} };
          }
          current = current[part].children;
        }
      });
    });
    
    return root;
  }

  renderFolder (folder, parentPath) {
    // Sort entries: folders first, then files, both alphabetically (case-insensitive)
    const sortedEntries = Object.entries(folder).sort(([nameA, itemA], [nameB, itemB]) => {
      // If one is folder and other is file, folder comes first
      if (itemA.type === 'folder' && itemB.type === 'file') return -1;
      if (itemA.type === 'file' && itemB.type === 'folder') return 1;
      
      // Otherwise sort alphabetically
      return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
    });
    
    return sortedEntries.map(([name, item]) => {
      const fullPath = parentPath ? `${parentPath}/${name}` : name;
      
      if (item.type === 'file') {
        const specialFiles = ['index.html', 'package.json'];
        const canDelete = !specialFiles.includes(item.path);
        const canRename = !specialFiles.includes(item.path);
        return html`
          <div 
            class="file-item ${this.selectedFile === item.path ? 'selected' : ''}"
            @click=${(e) => {
              // Always select file unless we're starting a rename
              if (!e.target.classList.contains('rename-input')) {
                this.selectFile(item.path);
              }
            }}
          >
            <span class="file-indent"></span>
            <span class="icon-wrapper">
              ${this.getFileIcon(item.path)}
            </span>
            ${this.renamingPath === item.path ? html`
              <input 
                class="rename-input"
                type="text"
                .value=${name}
                @blur=${(e) => this.finishRename(e, item.path, 'file')}
                @keydown=${(e) => this.handleRenameKeydown(e, item.path, 'file')}
                @click=${(e) => e.stopPropagation()}
              />
            ` : html`
              <span class="file-name" ${!canRename ? 'data-non-renamable' : ''} @click=${(e) => {
                if (this.selectedFile === item.path && canRename) {
                  this.handleRename(e, item.path, 'file');
                }
              }}>${name}</span>
            `}
            ${canDelete ? html`
              <button 
                class="delete-btn" 
                @click=${(e) => this.deleteFile(e, item.path)}
                title="Delete file"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"/>
                </svg>
              </button>
            ` : ''}
          </div>
        `;
      } else {
        const isExpanded = this.expandedFolders.has(fullPath);
        const hasChildren = Object.keys(item.children).length > 0;
        const isFolderSelected = this.selectedFile && this.selectedFile.startsWith(fullPath + '/');
        return html`
          <div class="folder-item">
            <div 
              class="folder-header"
              @click=${() => this.toggleFolder(fullPath)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="chevron">
                ${isExpanded 
                  ? html`<path d="M11 10H5.344L11 4.414V10z"/>`
                  : html`<path d="M6 4v8l4-4-4-4z"/>`
                }
              </svg>
              <span class="icon-wrapper">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.51 8.49V13h-12V7h4.49l.35-.15.86-.86H14v5.5z"/>
                </svg>
              </span>
              ${this.renamingPath === fullPath ? html`
                <input 
                  class="rename-input"
                  type="text"
                  .value=${name}
                  @blur=${(e) => this.finishRename(e, fullPath, 'folder')}
                  @keydown=${(e) => this.handleRenameKeydown(e, fullPath, 'folder')}
                  @click=${(e) => e.stopPropagation()}
                />
              ` : html`
                <span class="file-name" ${isFolderSelected ? 'data-renamable' : 'data-non-renamable'} @click=${(e) => {
                  if (isFolderSelected) {
                    this.handleRename(e, fullPath, 'folder');
                  }
                }}>${name}</span>
              `}
              ${!hasChildren ? html`
                <button 
                  class="delete-btn" 
                  @click=${(e) => this.deleteFolder(e, fullPath)}
                  title="Delete folder"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"/>
                  </svg>
                </button>
              ` : ''}
            </div>
            ${isExpanded ? html`
              <div class="folder-contents">
                ${this.renderFolder(item.children, fullPath)}
              </div>
            ` : ''}
          </div>
        `;
      }
    });
  }

  selectFile (path) {
    this.selectedFile = path;
    this.dispatchEvent(new CustomEvent('file-selected', { 
      detail: { path, content: this.files[path] } 
    }));
  }

  toggleFolder (path) {
    if (this.expandedFolders.has(path)) {
      this.expandedFolders.delete(path);
    } else {
      this.expandedFolders.add(path);
    }
    this.saveExpandedFolders();
    this.requestUpdate();
  }

  deleteFile(e, path) {
    e.stopPropagation();
    if (confirm(`Delete file "${path}"?`)) {
      this.dispatchEvent(new CustomEvent('delete-file', {
        detail: { path }
      }));
    }
  }

  deleteFolder(e, path) {
    e.stopPropagation();
    if (confirm(`Delete empty folder "${path}"?`)) {
      this.dispatchEvent(new CustomEvent('delete-folder', {
        detail: { path }
      }));
    }
  }

  createNewFile () {
    // Get the directory of the currently selected file
    let currentDir = '';
    if (this.selectedFile && this.selectedFile.includes('/')) {
      const parts = this.selectedFile.split('/');
      parts.pop(); // Remove the file name
      currentDir = parts.join('/') + '/';
    }
    
    const fileName = prompt(`Enter file name${currentDir ? ' (in ' + currentDir + ')' : ''}:`);
    if (fileName && fileName.trim()) {
      // If the fileName doesn't start with '/', prepend the current directory
      const path = fileName.includes('/') ? fileName.trim() : currentDir + fileName.trim();
      this.dispatchEvent(new CustomEvent('create-file', { 
        detail: { path } 
      }));
    }
  }

  createNewFolder () {
    // Get the directory of the currently selected file
    let currentDir = '';
    if (this.selectedFile && this.selectedFile.includes('/')) {
      const parts = this.selectedFile.split('/');
      parts.pop(); // Remove the file name
      currentDir = parts.join('/') + '/';
    }
    
    const folderName = prompt(`Enter folder name${currentDir ? ' (in ' + currentDir + ')' : ''}:`);
    if (folderName && folderName.trim()) {
      // If the folderName doesn't include '/', prepend the current directory
      const path = folderName.includes('/') ? folderName.trim() : currentDir + folderName.trim();
      this.dispatchEvent(new CustomEvent('create-folder', { 
        detail: { path } 
      }));
    }
  }

  handleRename(e, path, type) {
    e.stopPropagation();
    this.renamingPath = path;
    this.updateComplete.then(() => {
      const input = this.shadowRoot.querySelector('.rename-input');
      if (input) {
        input.select();
        input.focus();
      }
    });
  }

  handleRenameKeydown(e, path, type) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur(); // This will trigger blur event which calls finishRename
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.renamingPath = null;
    }
  }

  finishRename(e, oldPath, type) {
    const newName = e.target.value.trim();
    const oldName = oldPath.split('/').pop();
    
    if (newName && newName !== oldName) {
      // Validate the new name
      if (newName.includes('/')) {
        alert('File/folder names cannot contain slashes');
        this.renamingPath = null;
        return;
      }
      
      // Build new path
      const pathParts = oldPath.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');
      
      // Check if new path conflicts with existing files (excluding the file being renamed)
      if (type === 'file') {
        const existingFiles = Object.keys(this.files);
        const hasConflict = existingFiles.includes(newPath) && newPath !== oldPath;
        
        if (hasConflict) {
          alert('A file with this name already exists');
          return; // Don't reset renamingPath, keep the input visible
        }
      } else if (type === 'folder') {
        // For folders, check if any existing file starts with the new path
        const hasConflict = Object.keys(this.files).some(filePath => 
          (filePath.startsWith(newPath + '/') || filePath === newPath) && 
          !filePath.startsWith(oldPath + '/')
        );
        
        if (hasConflict) {
          alert('A folder with this name already exists or would conflict with existing files');
          return; // Don't reset renamingPath, keep the input visible
        }
      }
      
      // Only dispatch rename event if validation passes
      this.dispatchEvent(new CustomEvent('rename-item', {
        detail: { oldPath, newPath, type }
      }));
      this.renamingPath = null;
    } else {
      // Just exit rename mode if name didn't change
      this.renamingPath = null;
    }
  }

  saveExpandedFolders() {
    const expanded = Array.from(this.expandedFolders);
    localStorage.setItem('jspm-sandbox-expanded-folders', JSON.stringify(expanded));
  }

  restoreExpandedFolders() {
    const saved = localStorage.getItem('jspm-sandbox-expanded-folders');
    if (saved) {
      try {
        const expanded = JSON.parse(saved);
        this.expandedFolders = new Set(expanded);
      } catch (e) {
        console.warn('Failed to restore expanded folders:', e);
      }
    }
  }

  getFileIcon(path) {
    if (path === 'index.html') {
      // HTML icon with <>
      return html`
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <text x="8" y="12" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold">&lt;&gt;</text>
        </svg>
      `;
    } else if (path === 'importmap.js' || path === 'package.json') {
      // JSON/config icon with {}
      return html`
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <text x="8" y="12" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold">{}</text>
        </svg>
      `;
    } else {
      // Default file icon
      return html`
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v4h4v8zm-3-9V2l3 3h-3z"/>
        </svg>
      `;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    // If selectedFile changed and we have a selected file, ensure its parent folders are expanded
    if (changedProperties.has('selectedFile') && this.selectedFile) {
      const parts = this.selectedFile.split('/');
      let currentPath = '';
      
      // Expand all parent folders of the selected file
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath += (i > 0 ? '/' : '') + parts[i];
        if (!this.expandedFolders.has(currentPath)) {
          this.expandedFolders.add(currentPath);
        }
      }
      
      // Save the updated expanded state
      this.saveExpandedFolders();
    }
  }

}

customElements.define('jspm-file-explorer', JspmFileExplorer);