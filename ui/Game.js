import { html, render } from 'https://unpkg.com/lit-html?module';
import '../game/Board.js';
import './Stats.js';
class Game extends HTMLBodyElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this._battle = false;
        this._turn;
    }
    connectedCallback() {
        this.drawUI();
        /* Create and append button that toggles page background */
        // Create button
        this.$button = $('<button id="bg-toggler">Toggle background</button>');
        // Style button
        this.$button.css('position', 'fixed');
        this.$button.css('top', '20px');
        this.$button.css('left', '20px');
        this.$button.css('background', 'grey');
        this.$button.css('color', 'white');
        // Append button to <body>
        $(this.root).append(this.$button);
        // Listen for click event on $button
        $(this.$button).click(()=>{
            this.$body = $(this.root.host); // <body>
            this.$currentBackground = this.$body.css('background-color'); // <body>'s background color
            // if <body>'s background is white, make it black;
            // othwise, make it black;
            if (this.$currentBackground === 'rgba(255, 255, 255, 1)' || this.$currentBackground === 'rgb(255, 255, 255)') {
                this.$body.css('background-color', 'black')
            } else {
                this.$body.css('background-color', 'white')
            }
        });


        $(this.root).find('game-board').on('battle', e => this.battle = e.detail);
        $(this.root).find('game-board').on('turn', e => this.turn = e.detail);
        const board = $(this.root).find('game-board')[0];
        board.assignTurnToRandomPlayer();
    }
    get battle() {
        return this._battle;
    }
    set battle(bool) {
        this._battle = bool;
        this.drawUI();
        if (bool === true) this.getPlayerResponse();
    }
    get turn() {
        return this._turn;
    }
    set turn(p) {
        this._turn = p;
        $(this.root).find('game-stats')[0].player = p;
        this.drawUI();
    }
    getPlayerResponse() {
        let board = $(this.root).find('game-board')[0];
        const btnAttack = $(this.root).find('button[name="attack"]')[0];
        const btnDefend = $(this.root).find('button[name="defend"]')[0];
        $(btnAttack).on('click', () => board.battleAction = 'attack');
        $(btnDefend).on('click', () => board.battleAction = 'defend');
    }
    createAppearanceButton() {
        $()
    }
    drawUI() {
        render(this.template(), this.root);
    }
    template() {
        return html`
            <style>
                :host {
                    box-sizing: border-box;
                    margin: 0; padding: 20px;
                    width: 100vw;
                    height: 100vh;
                    background: white;
                }
                game-board, game-stats, div {
                    margin-left: 50%;
                    transform: translateX(-50%);
                }
                button {
                    box-sizing: border-box;
                    outline: none;
                    font: 600 16px "Raleway", sans-serif;
                    border-width: 4px;
                    border-style: solid;
                    padding: 10px 14px;
                    margin-left: 6px;
                    border-radius: 6px;
                    border-color: rgba(255,255,255,.4);
                    cursor: pointer;
                }
                button[name="attack"] {
                    background: ${this.turn ? `rgb(${this.turn.color})` : 'transparent'};
                    color: white;
                }
                div {
                    text-align: right;
                    width: 100%;
                    max-width: 600px;
                    margin-top: 30px;
                }
            </style>
            <game-stats></game-stats>
            <game-board></game-board>
            ${this.battle ? html`
                <div>
                    <button name="defend">Defend</button>
                    <button name="attack">Attack back</button>
                </div>
            ` : ''}
        `;
    }
}
customElements.define('game-container', Game, { extends: 'body' });