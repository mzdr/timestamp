const { contextBridge } = require('electron');

const { api: app } = require('../../ipc');
const { api: preferences } = require('../preferences/ipc');
const { api: calendar } = require('./ipc');

contextBridge.exposeInMainWorld('app', app);
contextBridge.exposeInMainWorld('calendar', calendar);
contextBridge.exposeInMainWorld('preferences', preferences);
