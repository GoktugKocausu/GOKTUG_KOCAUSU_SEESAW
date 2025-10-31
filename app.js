const plank = document.getElementById('board-plank'); //  DOM elemenlarını seçiyoruz tahta
const area = document.getElementById('board-area'); // Tahtanın bulunduğu tıklama yapmamız gereken alan
const leftText = document.getElementById('left-weight'); // sol ağırlık 
const rightText = document.getElementById('right-weight'); // sağ ağırlık
const angleText = document.getElementById('angle'); // tahtanın eğim açısı - + ile sağ sol belli oluyor
const nextText = document.getElementById('next-weight'); // randomla oluşmuş bir sonraki ağırlık
const resetBtn = document.getElementById('reset'); // resetleme tuşu
const logContainer = document.getElementById('log-container'); // logları gösteren alan



let objects = []; // seesaw üzerindeki ağırlıkları tutacak dizi

function calculateTilt(){   // dökümandaki formulle angle ve tork hesaplanacak asıl işlemler burada olacak
  console. log("mantık");

console. log("mantık", objects); // seesaw ın duruşu ve menu kısmındaki cardlarda yazması için burada angle yazacak
}


function createObjectPlank(x, weight) { // düşecek ağırlıkların oluşturulması random işlemleri olacak
 
}