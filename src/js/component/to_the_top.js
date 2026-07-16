class ToTheTop extends HTMLElement {
  connectedCallback() {
    const button = document.createElement('button');
    button.innerHTML = `<i class="fa-solid fa-arrow-up fa-canvas-roomy"></i>`;
    this.appendChild(button);

    // 버튼 이벤트 리스너
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

customElements.define('to-the-top', ToTheTop);
