// @ts-nocheck
class roomCard extends HTMLElement {
    shadow;
    article = document.createElement('article')
    style = document.createElement('style')
    a = document.createElement('a')
    img = document.createElement('img')
    p = document.createElement('p')

    constructor() {
        super()
        this.shadow = this.attachShadow({mode: 'open'})
        this.img.src = this.getAttribute('img');
        this.p.innerHTML = this.getAttribute('roomName');
        this.a.appendChild(this.img)
        this.a.appendChild(this.p)
        this.article.appendChild(this.a)
        this.shadow.appendChild(this.article)
        this.style.textContent = `
            article {
                width: 100%;
            }        
            a {
                width: 100%;
            }
            img {
                width: 100%;
                height: auto;
            }
            
            p {
                text-align: center;
            }
        `;
        this.shadow.appendChild(this.style)
    }
}


customElements.define('room-card', roomCard)
  