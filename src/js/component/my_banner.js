class MyBanner extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title');
    const content = this.getAttribute('content');
    const image = this.getAttribute('image');

    this.innerHTML = `
        <div class="banner-container">
            <img src="${image}" />
            <div class="banner-text-wrapper">
                <h2>${title}</h2>
                <p>${content}</p>
            </div>
        </div>
    `;
  }
}

customElements.define('my-banner', MyBanner);
