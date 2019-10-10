import { html, render } from 'https://unpkg.com/lit-html?module';
import { settings } from './__settings__.js';
import { weaponsList } from '../data/weapons.js';
import './Player.js';
import './Weapon.js';
class Board extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        // Properties
        this._size = settings.GRID_SIZE;
        this._obstacles = [];
        this._weapons = [];
        this._players = [];
        this._highlights = [];
        this._turn;
        this._battle = false;
        this._battleAction = null;
        this._winner = null;
    }
    /* ------ Lifycycle hooks ------ */
    connectedCallback() {
        // Initialise game when <game-board> is added to DOM
        this.initialise();
        this.addEventListener('death', e => this.handlePlayerDeath(e.detail))
    }
    /* ------ Getters & Setters ------ */
    get winner() {
        return this._winner;
    }
    set winner(playerDetails) {
        this._winner = playerDetails;
        render(this.template(), this.root);
    }
    get highlights() {
        return this.highlights;
    }
    set highlights(cells) {
        this._highlights = cells;
        render(this.template(), this.root);
    }
    get turn() {
        return this._turn;
    }
    set turn(playerId) {
        // give turn to another player
        this._turn = playerId;
        // highlight cells where the player can move
        // excluding battle mode
        if (!this.battle) this.highlightCells();
        // dispatch event to Game.js to update statistics
        this.dispatchEventTurn(playerId);
        // render
        render(this.template(), this.root);
        // listen for click event on highlighted cells
        this.listenForPlayerMove();
    }
    get battle() {
        return this._battle;
    }
    set battle(bool) {
        if (bool) {
            console.table(this._players.map(p=> {
                return {
                    name: p.name,
                    health: p.health,
                }
            }));
        }
        this._battle = bool;
        if (bool === true) {
            this.highlights = [];
        }
        this.dispatchEventBattle(bool);
    }
    get battleAction() {
        return this._battleAction;
    }
    set battleAction(a) {
        this._battleAction = a;
        this.handleBattleResponse();
        console.table(this._players.map(p=> {
            return {
                name: p.name,
                health: p.health,
            }
        }));
    }
    /* ------ Methods ------ */

    /*
        function isValidLocation
        Checks if @location and bounding locations are used in _obstacles, _weapons and _players
        @param location - expects an object with x and y properties
        @param bound - expects a number that determines how many cells should be empty from @location
        @returns true or false
    */
    isValidLocation(location, bound = 0, options) {
        for (let b=0; b<=bound; b++) {
            const xLeft = location.x - b;
            const xRight = location.x + b;
            const yTop =  location.y - b;
            const yDown = location.y + b;
            if (!options || options === 'obstacles' || options.exclude !== 'obstacles') {
                if (!options || !options.axis || options.axis === 'x') {
                    if (this.doesLocationExist(this._obstacles, { x: xLeft, y: location.y })) return false;
                    if (this.doesLocationExist(this._obstacles, { x: xRight, y: location.y })) return false;
                }
                if (this.doesLocationExist(this._obstacles, { x: location.x, y: yTop })) return false;
                if (this.doesLocationExist(this._obstacles, { x: location.x, y: yDown })) return false;
            }
            if (!options || options === 'weapons' || options.exclude !== 'weapons') {
                const list = this._weapons.map(w=> w.location);
                if (!options || !options.axis || options.axis === 'x') {
                    if (this.doesLocationExist(list, { x: xLeft, y: location.y })) return false;
                    if (this.doesLocationExist(list, { x: xRight, y: location.y })) return false;
                }
                if (this.doesLocationExist(list, { x: location.x, y: yTop })) return false;
                if (this.doesLocationExist(list, { x: location.x, y: yDown })) return false;
            }
            if (!options || options === 'players' || options.exclude !== 'players') {
                const list = this._players.map(p=> p.location);
                if (!options || !options.axis || options.axis === 'x') {
                    if (this.doesLocationExist(list, { x: xLeft, y: location.y })) return false;
                    if (this.doesLocationExist(list, { x: xRight, y: location.y })) return false;
                }
                if (this.doesLocationExist(list, { x: location.x, y: yTop })) return false;
                if (this.doesLocationExist(list, { x: location.x, y: yDown })) return false;
            }
        }
        return true;
    }
    /*
        function getNeighbouringCells
        Returns cells' locations
        @param base - expects an Object {x, y}
        @param bound - expects a Number
        @param exclude - expects a String
        @returns Array({x, y})
    */
    getNeighbouringCells(base, bound, exclude) {
        const cells = [];

        const perform = {
            xLeft: true,
            xRight: true,
            yTop: true,
            yDown: true,
        }

        for (let b=1; b<=bound; b++) {
            
            const xLeft = base.x - b;
            const xRight = base.x + b;
            const yTop =  base.y - b;
            const yDown = base.y + b;
            
            if(perform.xLeft) {
                if (xLeft > 0 && xLeft <= this._size) {
                    const cell = {x: xLeft, y: base.y};
                    if (exclude !== 'weapons') {
                        if ( this.doesLocationExist(this._weapons.map(w=>w.location), cell)) {
                            perform.xLeft = false;
                        }
                    }
                    if (exclude !== 'obstacles') {
                        if ( this.doesLocationExist(this._obstacles, cell)) {
                            perform.xLeft = false;
                        }
                    }
                    if (exclude !== 'players') {
                        if ( this.doesLocationExist(this._players.map(p=>p.location), cell)) {
                            perform.xLeft = false;
                        }
                    }
                    cells.push(cell)
                }
            }
            if(perform.xRight) {
                if (xRight > 0 && xRight <= this._size) {
                    const cell = {x: xRight, y: base.y};
                    if (exclude !== 'weapons') {
                        if ( this.doesLocationExist(this._weapons.map(w=>w.location), cell)) {
                            perform.xRight = false;
                        }
                    }
                    if (exclude !== 'obstacles') {
                        if ( this.doesLocationExist(this._obstacles, cell)) {
                            perform.xRight = false;
                        }
                    }
                    if (exclude !== 'players') {
                        if ( this.doesLocationExist(this._players.map(p=>p.location), cell)) {
                            perform.xRight = false;
                        }
                    }
                    cells.push(cell)
                }
            }
            if(perform.yTop) {
                if (yTop > 0 && yTop <= this._size) {
                    const cell = {x: base.x, y: yTop};
                    if (exclude !== 'weapons') {
                        if ( this.doesLocationExist(this._weapons.map(w=>w.location), cell)) {
                            perform.yTop = false;
                        }
                    }
                    if (exclude !== 'obstacles') {
                        if ( this.doesLocationExist(this._obstacles, cell)) {
                            perform.yTop = false;
                        }
                    }
                    if (exclude !== 'players') {
                        if ( this.doesLocationExist(this._players.map(p=>p.location), cell)) {
                            perform.yTop = false;
                        }
                    }
                    cells.push(cell)
                }
            }

            if(perform.yDown) {
                if (yDown > 0 && yDown <= this._size) {
                    const cell = {x: base.x, y: yDown};
                    if (exclude !== 'weapons') {
                        if ( this.doesLocationExist(this._weapons.map(w=>w.location), cell)) {
                            perform.yDown = false;
                        }
                    }
                    if (exclude !== 'obstacles') {
                        if ( this.doesLocationExist(this._obstacles, cell)) {
                            perform.yDown = false;
                        }
                    }
                    if (exclude !== 'players') {
                        if ( this.doesLocationExist(this._players.map(p=>p.location), cell)) {
                            perform.yDown = false;
                        }
                    }
                    cells.push(cell)
                }
            }
        }
        return cells;
    }

    /*
        function doesLocationExist
        Checks whether @arr includes @loc, where @loc is {x, y}
        @param arr - expects an Array
        @param loc - expects an Object {x, y}
        @returns Number
    */
    doesLocationExist(arr, loc) {
        return arr.find(l=> (l.x===loc.x && l.y=== loc.y)) ? true : false;
    }

    /*
        function getRandomNumber
        Generates random number between and including @min and @max.
        @param min - expects a number
        @param max - expects a number
        @returns Number
    */
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    /*
        function getRandomLocation
        Generates random location.
        @returns {x, y}
    */
    getRandomLocation() {
        const x = this.getRandomNumber(1, this._size);
        const y = this.getRandomNumber(1, this._size);
        return {x, y};
    }
    /*
        function reverse()
        Converts location from Number to {x, y} and from {x, y} to Number.
        @param location - expects either a number or object
        @returns either a Number or {x, y}
    */
    reverse(location) {
        // {x, y} ==> number
        if (typeof(location) === 'object') {
            if (!location.x || !location.y) return;
            if (location.x > this._size || location.y > this._size) return;
            return (location.y * this._size) - (this._size - location.x) - 1;
        }
        // number ==> {x, y}
        if (typeof(location) === 'number') {
            if (location < 0 || location > Math.pow(this._size, 2) - 1) return;
            const x = (location % this._size) + 1;
            const y = Math.floor(location / this._size) + 1;
            return {x, y};
        } 
    }

    detectWeaponOnPath(start, end) {
        let weapon = null;
        const direction = start.x === end.x ? 'y' : 'x';
        const difference = Math.abs(end[direction] - start[direction]);
        for (let i=0; i<difference; i++) {
            const location = {...start};
            if (start[direction] < end[direction]) {
                location[direction] = start[direction] + (i+1)
            }
            if (start[direction] > end[direction]) {
                location[direction] = start[direction] - (i+1);
            }
            this._weapons.find(w=> {
                if(w.location.x === location.x && w.location.y === location.y) {
                    weapon = w;
                }
            });
        }
        return weapon;
    }

    areLocationsNextToEachOther(locations = []) {
        const diffX = Math.abs(locations[0].x - locations[1].x);
        const diffY = Math.abs(locations[0].y - locations[1].y);
        if ((diffX === 0 && diffY < 2) || (diffY === 0 && diffX < 2)) {
            return true;
        } else {
            return false;
        }
    }

    /* ------ Subroutines ------ */
    generateObstaclesLocations() {
        let length = 0;
        while (length < this._size - 1) {
            const location = this.getRandomLocation();
            if (!this.isValidLocation(location)) continue;
            this._obstacles.push(location);
            length += 1;
        }
    }
    generatePlayersLocations() {
        let length = 0;
        while (length !== this._players.length) {
            const location = this.getRandomLocation();
            if (!this.isValidLocation(location)) continue;
            if (!this.isValidLocation(location, 1, 'players')) continue;
            this._players[length].location = location;
            length += 1;
        }
    }
    generateWeaponsLocations() {
        let length = 0;
        while (length !== this._weapons.length - this._players.length) {
            if (this._weapons[length].name === settings.DEFAULT_WEAPON_TYPE) continue;
            const location = this.getRandomLocation();
            if (!this.isValidLocation(location)) continue;
            if (!this.isValidLocation(location, 2, 'weapons')) continue;
            this._weapons[length].location = location;
            length += 1;
        }
    }
    highlightCells() {
        const highlights = [];
        const playerLocation = this._players[this._turn].location;
        const steps = settings.MAX_STEPS;
        const neighbours = this.getNeighbouringCells(playerLocation, steps, 'weapons');
        for (let n=0; n<neighbours.length; n++) {
            if (this.isValidLocation(neighbours[n], 0, { exclude: 'weapons' })) {
                highlights.push(neighbours[n]);
            }
        }
        this._highlights = highlights;
    }
    assignTurnToRandomPlayer() {
        this.turn = this.getRandomNumber(0, this._players.length);
    }

    initialise() {
        this.definePlayersInstances();
        this.defineWeaponsInstances();
        this.generateObstaclesLocations();
        this.generatePlayersLocations();
        this.generateWeaponsLocations();
        render(this.template(), this.root);
    }

    reset() {
        this._obstacles = [];
        this._weapons = [];
        this._players = [];
        this._highlights = [];
        this.turn = null;
        this.battle = false;
        this._battleAction = null;
    }

    defineWeaponsInstances() {
        const weaponsWithoutDefaultWeapon = weaponsList.filter(w=> w.name !== settings.DEFAULT_WEAPON_TYPE);
        while (this._weapons.length !== weaponsWithoutDefaultWeapon.length) {
            const { name, icon, damage } = weaponsWithoutDefaultWeapon[this._weapons.length];
            const weapon = document.createElement('game-weapon');
            weapon.id = this._weapons.length;
            weapon.name = name;
            weapon.damage = damage;
            weapon.icon = icon;
            this._weapons.push(weapon);
        }
        const defaultWeapon = weaponsList.find(w=> w.name===settings.DEFAULT_WEAPON_TYPE);
        for (let p=0; p<2; p++) {
            const { name, icon, damage } = defaultWeapon;
            const weapon = document.createElement('game-weapon');
            weapon.id = this._weapons.length;
            weapon.name = name;
            weapon.damage = damage;
            weapon.icon = icon;
            this._weapons.push(weapon);
            this._players[p].weapon = weapon.id;
        }
    }
    definePlayersInstances() {
        while (this._players.length !== 2) {
            const player = document.createElement('game-player');
            player.id = this._players.length;
            player.name = this._players.length === 0 ? "Blue" : "Pink";
            player.color = this._players.length === 0 ? "127, 135, 255" : "255, 127, 193";
            this._players.push(player);
        }
    }

    handleBattleResponse() {
        const response = this.battleAction;
        const defender = this._players[this.turn];
        const attacker = this._players[this.turn === 0 ? 1 : 0];
        const damage = this._weapons.find(w=> w.id === attacker.weapon).damage;
        if (response === 'attack') {
            defender.handleAttack(damage);
            this.turn = attacker.id;
        };
        if (response === 'defend') {
            defender.handleDefence(damage);
            this.battle = false;
            this.turn = defender.id;
        };
    }
    handlePlayerDeath(playerId) {
        this.winner = this._players[playerId === 0 ? 1 : 0];
        this.battle = false;
    }

    /* ------ Events ------ */
    listenForPlayerMove() {
        this.root.addEventListener('click', e=> {
            const player = this._players[this.turn];
            // Ensure that the target is a div, if not find the closest one
            // * Prevents elements that are inside the div, being the target.
            let div = e.target;
            if (div.nodeName !== 'div') div = div.closest('div');
            // Get cell location
            const cell = this.reverse(parseInt(div.getAttribute('data-index')));
            // if player clicked on different than highlighted cell, return.
            if (!this.doesLocationExist(this._highlights, cell)) return;
            // remove highlighted cells
            this.highlights = [];
            // swap weapons if any occured on player's path
            const start = player.location;
            const end = cell;
            const foundWeapon = this.detectWeaponOnPath(start, end);
            if (foundWeapon) {
                // place player's weapon on board
                this._weapons.find(w=> w.id === player.weapon).location = foundWeapon.location;
                // update player's weapon
                foundWeapon.location = { x: null, y: null }
                player.weapon = foundWeapon.id;
            }
            // update player location
            player.move(cell);

            // swap turns
            this.turn = this.turn === 0 ? 1 : 0;

            // detect battle
            this.battle = this.areLocationsNextToEachOther(this._players.map(p=> p.location));
        });
    }
    dispatchEventBattle(bool) {
        const event = new CustomEvent('battle', { bubbles: true, detail: bool });
        this.dispatchEvent(event);
    }
    dispatchEventTurn(playerId) {
        const {name, color, health, weapon} = this._players[playerId];
        const wDetails = this._weapons.find(w=>w.id === weapon);
        const event = new CustomEvent('turn', {blob: true, detail: {
            name, color, health, weapon: {name: wDetails.name, damage: wDetails.damage},  winner: this.winner
        }});
        this.dispatchEvent(event);
    }
    
    /* ------ HTML & CSS------ */
    template() {
        if (!this.winner) {
            const cells = [];
            const isObstacle = (c) => this.doesLocationExist(this._obstacles, this.reverse(c));
            const isHighlight = (c) => this.doesLocationExist(this._highlights, this.reverse(c));
            const isPlayer = (c) => this.doesLocationExist(this._players.map(p=> p.location), this.reverse(c));
            const isWeapon = (c) => this.doesLocationExist(this._weapons.map(w=> w.location), this.reverse(c));
            for (let c=0; c<Math.pow(this._size, 2); c++ ) {
                const reversedLocation = this.reverse(c);
                const cellType = isObstacle(c) ? 'obstacle' : 'regular';
                const cellIsPlayer = isPlayer(c) ? this._players.find(p=>(p.location.x===reversedLocation.x && p.location.y === reversedLocation.y)) : '';
                const cellIsWeapon = isWeapon(c) ? this._weapons.find(w=>(w.location.x===reversedLocation.x && w.location.y === reversedLocation.y)) : '';
                const cell = html`
                    <div data-index="${c}" data-type="${cellType}" style="background: ${isHighlight(c) ? `rgba(${this._players[this.turn].color}, .05)` : ''}">
                        ${cellIsPlayer}
                        ${cellIsWeapon}
                    </div>
                `;
                cells.push(cell);
            }
            return html`
                <style>
                    :host {
                        display: grid;
                        width: 100%;
                        min-width: 344px;
                        max-width: 606px;
                        grid-template-columns: repeat(${this._size}, 1fr);
                        grid-template-rows: repeat(${this._size}, 1fr);
                        background: #E6E6E6;
                        border: solid #E6E6E6 2px;
                        border-radius: 15px;
                        grid-gap: 2px;
                        font-size: 0;
                    }
                    div {
                        font-size: 16px;
                        line-height: 0;
                        border-radius: 1px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #fff;
                    }
                    div:first-of-type { border-top-left-radius: 12px; }
                    div:nth-of-type(${this._size}) { border-top-right-radius: 12px;}
                    div:nth-of-type(${Math.pow(this._size, 2) - this._size + 1}) { border-bottom-left-radius: 12px; }
                    div:last-of-type { border-bottom-right-radius: 12px; }
                    div::before {
                        content: "";
                        display: inline-block;
                        width: 0;
                        height: 0;
                        padding-bottom: 100%;
                    }
                    div > *:nth-child(2) {
                        position: relative;
                        display: none;
                        z-index: 2;
                    }
                    div[data-type=obstacle] {
                        background: #505050;
                        z-index: 1;
                        box-shadow: 0 0 0pt 2px black;
                    }
                </style>
                ${cells}
            `;
        }
    }
}
customElements.define('game-board', Board);