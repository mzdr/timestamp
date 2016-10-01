class About
{
    constructor()
    {
        const template = this.constructor.document.querySelector('#view');
        const clone = document.importNode(template.content, true);
        const target = document.querySelector('#about-view');

        // Append about markup
        target.appendChild(clone);
    }
}

About.document = document.currentScript.ownerDocument;
