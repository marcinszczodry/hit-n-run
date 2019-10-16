import { html, render } from 'https://unpkg.com/lit-html?module';
class Stats extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this._player;
    }
    get player() {
        return this._player;
    }
    set player(player) {
        this._player = player;
        this.drawUI();
    }
    drawUI() {
        render(this.template(), this.root);
    }
    template() {
        // Capitalise first letter of the weapon name
        this.player.weapon.name = this.player.weapon.name.substr(0,1).toUpperCase()+this.player.weapon.name.substr(1);
        return html`
            <style>
                :host {
                    font: 600 16px "Raleway", sans-serif;
                    color: white;
                    display: flex;
                    width: 100%;
                    max-width: 600px;
                    margin-bottom: 20px;
                    justify-content: space-between;
                }
                li {
                    display: flex;
                    border-width: 4px;
                    border-style: solid;
                    padding: 10px 14px;
                    margin-left: 6px;
                    border-radius: 6px;
                    border-color: rgba(255,255,255,.4);
                }
                .stats__player {
                    background: ${this.player.winner ? `rgb(${this.player.winner.color})` : `rgb(${this.player.color})`};
                }
                .stats__weapon {
                    background: #BEBEBE;
                }
                .stats__health {
                    background: #85C97A;
                }
                .right {
                    display: flex;
                }
            </style>

            ${!this.player.winner ? html`
                <li class="stats__player">Team ${this.player.name}'s turn</li>
                <div class="right">
                    <li class="stats__weapon">${this.player.weapon.name} | ${this.player.weapon.damage}</li>
                    <li class="stats__health">${this.player.health}</li>
                </div>
            ` : html`
                <li class="stats__player">The winner is Team ${this.player.winner.name} who survived with ${this.player.winner.health} health points!</li>
            `}
        `;
    }
}
customElements.define('game-stats', Stats);