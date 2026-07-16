// db.json의 rooms, price, season에서 데이터 가져오기
// 1. 요소와 URL 가져오기
const tbody = document.querySelector('tbody');
const roomsURL = `rooms`;
const priceURL = `price`;

// 데이터 get 해오는 함수 만들기
async function getPriceTable() {
  const roomsRes = await fetch(roomsURL, { method: 'GET' });
  const priceRes = await fetch(priceURL, { method: 'GET' });

  const getRooms = await roomsRes.json();
  const getPrice = await priceRes.json();

  console.log(getRooms);
  console.log(getPrice);

  // forEach로 행 쌓기
  let html = '';
  getRooms.forEach(room => {
    // 성수기
    const low = getPrice.find(p => p.room_id === room.id && p.season_id === 1);
    const high = getPrice.find(p => p.room_id === room.id && p.season_id === 2);

    html += `
        <tr>
            <td>${room.name}</td>
            <td>${room.area}㎡</td>
            <td>${room.min}/${room.capacity}</td>
            <td>${low.weekday_price.toLocaleString()}</td>
            <td>${low.weekend_price.toLocaleString()}</td>
            <td>${low.holiday_price.toLocaleString()}</td>
            <td>${high.weekday_price.toLocaleString()}</td>
            <td>${high.weekend_price.toLocaleString()}</td>
            <td>${high.holiday_price.toLocaleString()}</td>
        </tr>
    `;

    tbody.innerHTML = html;
  });
}

getPriceTable();

// 모바일 버전에서는 표를 옆으로 드래그 했을때 드래그 되도록
// 표를 마우스로 잡고 옆으로 밀 수 있게 하기
const tableWrap = document.querySelector('.table-wrap');

let isDown = false;
let startX;
let startScroll;

tableWrap.addEventListener('mousedown', e => {
  isDown = true;
  startX = e.pageX;
  startScroll = tableWrap.scrollLeft;
});

tableWrap.addEventListener('mousemove', e => {
  if (!isDown) return;

  const distance = e.pageX - startX;
  tableWrap.scrollLeft = startScroll - distance;
});

tableWrap.addEventListener('mouseup', () => {
  isDown = false;
});

tableWrap.addEventListener('mouseleave', () => {
  isDown = false;
});
