// @ts-nocheck
class roomer extends HTMLElement {
    shadow;
    style = document.createElement('style')
    a = document.createElement('a');
    div = document.createElement('div');
    img = document.createElement('img');
    p = document.createElement('p');

    constructor() {
        super()
        this.shadow = this.attachShadow({mode: 'open'})
        this.style.textContent = `
            .userwrap {
                display: flex;
                align-items: center;
            }
            .useravatar-wrap {
                width: 3rem;
                height: 3rem;
                border-radius: 50%;
                overflow: hidden;
                background-color: transparent;
            }
            .userwrap .useravatar {
                vertical-align: middle;
                width: 100%;
                height: auto;
            }
            .username {
                margin-left: 1rem;
                font-size: 2rem;
            }
        `;
    }

    set user(value) {
        this.img.src = './assets/avatar.png'
        this.img.classList.add('useravatar');
        this.p.innerHTML = value.username
        this.p.classList.add('username');
        this.div.classList.add('useravatar-wrap')
        this.div.appendChild(this.img)
        this.a.classList.add('userwrap');
        this.a.appendChild(this.div)
        this.a.appendChild(this.p)
        this.shadow.appendChild(this.a)
        this.shadow.appendChild(this.style)
    }
}

customElements.define('room-item', roomer)