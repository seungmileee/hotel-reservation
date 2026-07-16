class MyHeader extends HTMLElement {
  connectedCallback() {
    const header = document.createElement('header');
    header.innerHTML = `
    <h1 class="title"><a href="html/index.html">H</a></h1>
      <nav>
        <ul class="navbar">
          <li>
            <span>ABOUT</span>
            <ul class="sub">
              <li><a href="#">호텔 소개</a></li>
              <li><a href="#">오시는길</a></li>
            </ul>
          </li>
          <li>
            <span>ROOMS</span>
            <ul class="sub">
              <li><a href="#">ROOM 1</a></li>
              <li><a href="#">ROOM 2</a></li>
              <li><a href="#">ROOM 3</a></li>
            </ul>
          </li>
          <li>
            <span>RESERVATION</span>
            <ul class="sub">
              <li><a href="html/reservation_info.html">예약안내</a></li>
              <li><a href="html/reservation_live.html">실시간예약</a></li>
            </ul>
          </li>
          <li>
            <span>COMMUNITY</span>
            <ul class="sub">
              <li><a href="#">공지사항</a></li>
              <li><a href="#">이벤트</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </li>
        </ul>
      </nav>
    `;

    this.appendChild(header);
    const navbar = header.querySelector('.navbar');
    navbar.addEventListener('click', e => {
      const span = e.target.closest('span');
      if (!span) return;

      const li = span.parentElement;
      const wasOpen = li.classList.contains('open');

      // 다른 메뉴는 다 닫기
      navbar.querySelectorAll('li').forEach(el => el.classList.remove('open'));

      // 자기가 닫혀있으면 열기
      if (!wasOpen) li.classList.add('open');
    });
  }
}

customElements.define('my-header', MyHeader);
