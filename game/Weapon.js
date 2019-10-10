import { html, render } from 'https://unpkg.com/lit-html?module';
class Weapon extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        // Properties
        this._id;
        this._name;
        this._damage;
        this._icon;
        this._location = {x: null, y: null};
    }

    /* ------ Lifcycle hooks ------ */
    connectedCallback() {
        this.draw();
    }

    /* ------ Getters & Setters ------ */
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get damage() {
        return this._damage;
    }
    get icon() {
        return this._icon;
    }
    get location() {
        return this._location;
    }
    set id(id) {
        this._id = id;
    }
    set name(name) {
        this._name = name;
    }
    set damage(damage) {
        this._damage = damage;
    }
    set icon(icon) {
        this._icon = icon;
    }
    set location(location) {
        this._location = location;
    }
    /* ------ Methods ------ */
    draw() {
        render(this.template(), this.root);
    }

    /* ------ HTML & CSS------ */
    template() {
        return html`
            <style>
                svg {
                    max-width: 30px;
                    max-height: 30px;
                    width: 100%;
                    z-index: 1;
                }
            </style>
            ${this.icon}
        `;
    }
}
customElements.define('game-weapon', Weapon);