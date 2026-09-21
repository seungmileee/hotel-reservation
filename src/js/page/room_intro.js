// 객실 소개 페이지
// html/room_intro.html?room=standard 처럼 URL 파라미터 하나로 4종 객실을 한 장에서 처리한다

// URL 파라미터 읽어오기
const params = new URLSearchParams(location.search);
const roomParam = params.get('room');

// 파라미터가 없거나 비어 있으면 기본 객실을 보여준다 (메뉴를 거치지 않고 직접 들어온 경우)
// 값이 들어있는데 목록에 없는 경우만 아래에서 안내 문구로 처리한다
const DEFAULT_ROOM = 'standard';
const roomType = roomParam ? roomParam : DEFAULT_ROOM;

// db.json에서 읽어올 데이터
const roomsURL = `rooms`;
const priceURL = `price`;

// 화면 요소
const roomTitle = document.querySelector('#room-title');
const roomContent = document.querySelector('#room-content');
const roomGallery = document.querySelector('#room-gallery');
const specArea = document.querySelector('#spec-area');
const specMin = document.querySelector('#spec-min');
const specCapacity = document.querySelector('#spec-capacity');
const specPrice = document.querySelector('#spec-price');
const roomDesc = document.querySelector('#desc');
const roomDescEng = document.querySelector('#desc-eng');
const reserveLink = document.querySelector('#reserve-link');
const noticeContainer = document.querySelector('#notice-container');
const noticeText = document.querySelector('#notice-text');
const noticeLinks = document.querySelector('#notice-links');

// 객실 데이터를 화면에 채우기
function renderRoom(roomData, priceList) {
  roomTitle.textContent = roomData.name_eng.toUpperCase();

  // 이미지는 db의 images 배열을 그대로 깔아준다
  let galleryHtml = '';
  roomData.images.forEach(img => {
    galleryHtml += `<img src="${img}" />`;
  });
  roomGallery.innerHTML = galleryHtml;

  // 면적 / 인원
  specArea.textContent = `${roomData.area}㎡`;
  specMin.textContent = `${roomData.min}명`;
  specCapacity.textContent = `${roomData.capacity}명`;

  // 요금은 시즌과 요일에 따라 달라지므로 가장 낮은 금액만 "~부터"로 안내한다
  const roomPrices = priceList.filter(price => price.room_id === roomData.id);
  if (roomPrices.length > 0) {
    const lowest = Math.min(...roomPrices.map(price => price.weekday_price));
    specPrice.textContent = `${lowest.toLocaleString()}원부터`;
  } else {
    specPrice.textContent = '예약안내 참고';
  }

  // 설명
  roomDesc.textContent = roomData.desc;
  roomDescEng.textContent = roomData.desc_eng;

  // 예약 상세(달력) 페이지로 넘기기
  reserveLink.href = `html/room_detail.html?room=${roomData.name_eng}`;
}

// 잘못된 파라미터거나 데이터를 못 불러왔을 때 안내 문구를 띄우기
function showNotice(message, roomList) {
  roomTitle.textContent = '객실 안내';
  roomContent.classList.add('hidden');
  noticeContainer.classList.remove('hidden');
  noticeText.textContent = message;

  // 이동할 수 있는 객실 목록을 db에서 받은 대로 만들어준다
  let linksHtml = '';
  roomList.forEach(room => {
    linksHtml += `<a href="html/room_intro.html?room=${room.name_eng}">${room.name_eng.toUpperCase()}</a>`;
  });
  noticeLinks.innerHTML = linksHtml;
}

async function getRoomData() {
  try {
    const roomsRes = await fetch(roomsURL, { method: 'GET' });
    const getRooms = await roomsRes.json();

    // room_detail.js와 같은 기준으로 찾는다 (id가 아니라 name_eng)
    const roomData = getRooms.find(room => room.name_eng === roomType);

    // 목록에 없는 값이면 다른 객실로 조용히 보내지 않고 무엇이 잘못됐는지 알려준다
    if (!roomData) {
      showNotice(`'${roomType}' 객실을 찾을 수 없습니다. 아래에서 객실을 선택해 주세요.`, getRooms);
      return;
    }

    const priceRes = await fetch(priceURL, { method: 'GET' });
    const getPrice = await priceRes.json();

    renderRoom(roomData, getPrice);
  } catch (error) {
    // 서버가 꺼져 있거나 응답이 깨진 경우
    showNotice('객실 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', []);
  }
}

getRoomData();
