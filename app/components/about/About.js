class About
{
    constructor()
    {
        const template = this.constructor.document.querySelector('template');
        const clone = document.importNode(template.content, true);
        const target = document.querySelector('#about-view');
        const nameNode = clone.querySelector('[data-name]');
        const versionNode = clone.querySelector('[data-version]');

        nameNode.textContent = Electron.remote.app.getName();
        versionNode.textContent = Electron.remote.app.getVersion();

        // Append about markup
        target.appendChild(clone);
    }
}

About.document = document.currentScript.ownerDocument;
