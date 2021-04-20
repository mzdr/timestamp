const { contextBridge } = require('electron');

const { api: app } = require('../../ipc');
const { api: preferences } = require('./ipc');

contextBridge.exposeInMainWorld('app', app);
contextBridge.exposeInMainWorld('preferences', preferences);
