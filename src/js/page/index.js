// swiper 동작 코드
var swiper = new Swiper('.mySwiper', {
  loop: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  autoplay: {
    delay: 4000,
    disabledOnInteraction: false,
  },
});

// 가로 스크롤 영역을 마우스로 잡고 밀 수 있게 하는 함수
// room-list와 event-list가 똑같은 동작이라 함수로 묶어서 재사용한다
function enableDrag(el) {
  let isDown = false; // 지금 마우스를 누르고 있는지
  let startX; // 누르기 시작한 마우스의 x좌표
  let startScroll; // 누를 때의 scrollLeft 값

  el.addEventListener('mousedown', e => {
    isDown = true;
    el.isDragged = false; // 드래그 시작할 때는 아직 안움직임
    startX = e.pageX;
    startScroll = el.scrollLeft;
  });

  el.addEventListener('mousemove', e => {
    if (!isDown) return;
    el.isDragged = true; // 드래그로 움직였다고 표시
    const distance = e.pageX - startX;
    // 마우스를 오른쪽으로 밀면(distance 양수) 내용은 왼쪽으로 가야 하므로, scrollLeft가 줄어야 한다.
    el.scrollLeft = startScroll - distance;
  });

  el.addEventListener('mouseup', () => {
    isDown = false;
  });

  el.addEventListener('mouseleave', () => {
    isDown = false;
  });
}

// rooms-list와 event-list에 드래그 동작 붙이기
const roomList = document.querySelector('.room-list');
const eventList = document.querySelector('.event-list');

enableDrag(roomList);
enableDrag(eventList);

// rooms-list에서 모달 동작 코드
const modal = document.querySelector('#modal');
const modalImg = document.querySelector('#modal-img');

roomList.addEventListener('click', e => {
  if (roomList.isDragged) return; // 드래그였으면 모달 열지 않기

  if (e.target.matches('.room-img')) {
    modalImg.src = e.target.src;
    modal.style.display = 'flex';
  }
});

modal.addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    modal.style.display = 'none';
  }
});
