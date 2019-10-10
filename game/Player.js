import { html, render } from 'https://unpkg.com/lit-html?module';
class Player extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        // Properties
        this._id;
        this._name;
        this._location = {x: null, y: null};
        this._weapon;
        this._color;
        this._health = 100;
    }
    /* ------ Lifcycle hooks ------ */
    connectedCallback() {
        this.draw();
    }

    /* ------ Getters & setters ------ */
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get weapon() {
        return this._weapon;
    }
    get color() {
        return this._color;
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
    set weapon(weapon) {
        this._weapon = weapon;
    }
    set color(color) {
        this._color = color;
    }
    get health() {
        return this._health;
    }
    set health(h) {
        this._health = h;
        if (h < 1) this.handlePlayerDeath();
    }
    set location(location) {
        // Validate that location is an object and has at least
        // one property of the following: x / y.
        if (!location || typeof(location) !== 'object') {
            throw new TypeError(`Parameter location of setter location expects an object. Received ${typeof(location)}.`);
        }
        if (!location.x && !location.y) {
            throw new TypeError(`Parameter location of setter location expects an object that has at least one property of the following: x, y. Received null.`);
        }

        // Update x and y conditionally
        if (location.x) this._location.x = location.x;
        if (location.y) this._location.y = location.y;
    }

    /* ------ Methods ------ */
    
    /*
        Attack
        When the player decides to attack back the opponent
        (in the battle mode), he/she gets hit at full strength
        of the opponent's weapon.
    */
    handleAttack(weaponDamage) {
        this.health = this.health - weaponDamage;
    }
    /*
        Defend
        When the player decides to defend (run away),
        he/she gets hit at half strength of the opponent's weapon.
    */
    handleDefence(weaponDamage) {
        // When player chooses to defend themselfves,
        // they get hit at half strength of opponnent's weapon
        this.health = this.health - (weaponDamage / 2);
    }
    /* Handle player's death */
    handlePlayerDeath() {
        const event = new CustomEvent('death', { blob: true, detail: this.id, composed: true});
        this.dispatchEvent(event);
    }
    /*
        Move
        Updates player location
    */
    move(location) {
        this.location = location;
    }
    /*
        Draw
        Renders player's icon
    */
    draw() {
        render(this.template(), this.root);
    }

    /* ------ HTML & CSS ------ */
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
            <svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g id="Game" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-opacity="0.46">
                    <g id="First-player:-Widescreen" transform="translate(-1071.000000, -105.000000)" fill="rgb(${this.color})" stroke="#FFFFFF" stroke-width="5">
                        <g id="Group-3" transform="translate(676.000000, 84.000000)">
                            <g id="Group-2" transform="translate(395.000000, 21.000000)">
                                <circle id="Oval" cx="16" cy="16" r="14.5"></circle>
                            </g>
                        </g>
                    </g>
                </g>
            </svg>`;
    }
}
customElements.define('game-player', Player);