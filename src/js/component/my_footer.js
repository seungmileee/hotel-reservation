class MyFooter extends HTMLElement {
  connectedCallback() {
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <h1>H</h1>
        <div class="icon-container">
        <i class="fa-brands fa-instagram"></i>
        <i class="fa-brands fa-facebook-f"></i>
        <i class="fa-brands fa-youtube"></i>
        </div>
        <div class="text-container">
        <div class="addr-container">
            <div>경기 성남시 황새울로329번길 5 한국폴리텍대학 융합기술교육원</div>
            <div class="footer-number">
            <div>사업자등록번호 000-00-0000</div>
            <div>전화 012-345-6789</div>
            <div>팩스 01-234-5678</div>
            </div>
        </div>
        <div class="terms-container">
            <div>이용약관</div>
            <div>개인정보처리방침</div>
        </div>
        <div class="copyright-container">
            <div>Copyright ⓒ 2025예약연습 All rights reserved.</div>
        </div>
        </div>
    `;
    this.appendChild(footer);
  }
}

customElements.define('my-footer', MyFooter);
