class MyFooter extends HTMLElement {
  connectedCallback() {
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <h1>H</h1>
        <div class="icon-container">
        <a href="https://www.instagram.com/bctc_koreapolytechnics/" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-instagram"></i></a>
        <a href="https://www.facebook.com/kopo.cpc/" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-facebook-f"></i></a>
        <a href="https://www.youtube.com/channel/UCpoxrusdrwHy7VDZ9koi30Q" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube"></i></a>
        </div>
        <div class="text-container">
        <div class="addr-container">
            <div>경기도 성남시 분당구 황새울로 196 H HOTEL</div>
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
