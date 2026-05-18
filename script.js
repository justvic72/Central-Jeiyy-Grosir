let modeEdit = false;
let totalBelanja = 0;

let historyBelanja = JSON.parse(localStorage.getItem("historyBelanja")) || [];

const sekarang = Date.now();

historyBelanja = historyBelanja.filter((item)=>{
  return (sekarang - item.timestamp) < (3 * 24 * 60 * 60 * 1000);
});

localStorage.setItem(
  "historyBelanja",
  JSON.stringify(historyBelanja)
);

let produk = JSON.parse(localStorage.getItem("dataProduk")) || [
  {
    nama:"Rokok Sampoerna Mild 16",
    harga:355000,
    gambar:"https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?q=80&w=800&auto=format&fit=crop"
  },
  {
    nama:"Rokok Sampoerna Mild 12",
    harga:255000,
    gambar:"https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=800&auto=format&fit=crop"
  },
  {
    nama:"Rokok G.G. Surya 16",
    harga:355000,
    gambar:"https://images.unsplash.com/photo-1507914372368-b2b085b925a1?q=80&w=800&auto=format&fit=crop"
  },
  {
    nama:"Rokok G.G. Surya 12",
    harga:255000,
    gambar:"https://images.unsplash.com/photo-1523293915678-d126868e96b2?q=80&w=800&auto=format&fit=crop"
  }
];

function rupiah(angka){
  return "Rp" + angka.toLocaleString("id-ID");
}

function formatHargaInput(input){
  let angka = input.value.replace(/[^0-9]/g,'');
  angka = parseInt(angka || 0);
  input.value = "Rp" + angka.toLocaleString("id-ID");
}

function mulaiBelanja(){
  document.getElementById("homePage").style.display = "none";
  document.getElementById("shopPage").style.display = "block";
  tampilkanProduk();
}

function toggleEdit(){
  modeEdit = !modeEdit;

  const tombol = document.getElementById("btnEdit");
  const panelTambah = document.getElementById("panelTambah");

  if(modeEdit){
    tombol.innerHTML = "Selesai";
    tombol.style.background = "#16a34a";
    panelTambah.style.display = "block";
  }else{
    tombol.innerHTML = "Edit";
    tombol.style.background = "#374151";
    panelTambah.style.display = "none";
  }

  tampilkanProduk();
}

function tampilkanProduk(){
  const container = document.getElementById("produkContainer");
  container.innerHTML = "";

  produk.forEach((item,index)=>{

    container.innerHTML += `
      <div class="card">

        <img src="${item.gambar}">

        <input
          type="file"
          accept="image/*"
          class="edit-gambar"
          style="display:${modeEdit ? 'block' : 'none'}"
          onchange="ubahGambar(event,${index})"
        >

        <button
          class="hapus-btn"
          style="display:${modeEdit ? 'block' : 'none'}"
          onclick="hapusProduk(${index})"
        >
          Hapus Barang
        </button>

        <div class="card-content">

          <textarea
            class="edit-nama"
            id="nama${index}"
            ${modeEdit ? "" : "readonly"}
            onchange="ubahNama(${index})"
          >${item.nama}</textarea>

          <input
            type="text"
            class="edit-harga"
            id="harga${index}"
            value="${rupiah(item.harga)}"
            ${modeEdit ? "" : "readonly"}
            oninput="formatHargaInput(this)"
            onchange="ubahHarga(${index})"
          >

          <input
            type="number"
            min="0"
            value="0"
            class="jumlah"
            id="jumlah${index}"
          >

        </div>

      </div>
    `;
  });
}

function hapusProduk(index){
  const konfirmasi = confirm("Yakin ingin menghapus barang ini?");

  if(konfirmasi){
    produk.splice(index,1);
    tampilkanProduk();
    simpanData();
  }
}

function ubahNama(index){
  produk[index].nama = document.getElementById(`nama${index}`).value;
}

function ubahHarga(index){
  const hargaText = document.getElementById(`harga${index}`).value;

  const hargaBaru = parseInt(
    hargaText.replace(/[^0-9]/g,'')
  );

  if(!isNaN(hargaBaru)){
    produk[index].harga = hargaBaru;
    tampilkanProduk();
  }
}

function ubahGambar(event,index){
  const file = event.target.files[0];

  if(file){
    const reader = new FileReader();

    reader.onload = function(e){
      produk[index].gambar = e.target.result;
      tampilkanProduk();
    };

    reader.readAsDataURL(file);
  }
}

function tambahProduk(){
  const nama = document.getElementById("namaBaru").value;

  const hargaText = document.getElementById("hargaBaru").value;

  const harga = parseInt(
    hargaText.replace(/[^0-9]/g,'')
  );

  const file = document.getElementById("gambarBaru").files[0];

  if(nama === "" || isNaN(harga)){
    alert("Isi nama dan harga barang!");
    return;
  }

  if(file){
    const reader = new FileReader();

    reader.onload = function(e){
      produk.push({
        nama:nama,
        harga:harga,
        gambar:e.target.result
      });

      tampilkanProduk();
      simpanData();
    };

    reader.readAsDataURL(file);

  }else{

    produk.push({
      nama:nama,
      harga:harga,
      gambar:"https://via.placeholder.com/300x200"
    });

    tampilkanProduk();
    simpanData();
  }

  document.getElementById("namaBaru").value = "";
  document.getElementById("hargaBaru").value = "";
  document.getElementById("gambarBaru").value = "";
}

function hitungTotal(){
  totalBelanja = 0;

  produk.forEach((item,index)=>{
    const jumlah = parseInt(
      document.getElementById(`jumlah${index}`).value
    ) || 0;

    totalBelanja += jumlah * item.harga;
  });

  document.getElementById("totalBelanja").innerHTML = rupiah(totalBelanja);
}

function hitungKembalian(){
  const bayarText = document.getElementById("uangBayar").value;

  const bayar = parseInt(
    bayarText.replace(/[^0-9]/g,'')
  );

  if(isNaN(bayar)){
    alert("Masukkan uang bayar!");
    return;
  }

  if(bayar < totalBelanja){
    alert("Uang bayar kurang!");
    return;
  }

  const kembali = bayar - totalBelanja;

  document.getElementById("kembalian").innerHTML = rupiah(kembali);

  const daftarBarang = [];

  produk.forEach((item,index)=>{
    const jumlah = parseInt(
      document.getElementById(`jumlah${index}`).value
    ) || 0;

    if(jumlah > 0){
      daftarBarang.push({
        nama:item.nama,
        jumlah:jumlah,
        subtotal:jumlah * item.harga
      });
    }
  });

  const tanggal = new Date().toLocaleString("id-ID");

  historyBelanja.unshift({
    tanggal:tanggal,
    barang:daftarBarang,
    total:totalBelanja,
    bayar:bayar,
    kembali:kembali,
    timestamp:Date.now()
  });

  localStorage.setItem(
    "historyBelanja",
    JSON.stringify(historyBelanja)
  );

  tampilkanHistory();
}

function resetBelanja(){
  produk.forEach((item,index)=>{
    document.getElementById(`jumlah${index}`).value = 0;
  });

  totalBelanja = 0;

  document.getElementById("totalBelanja").innerHTML = "Rp0";
  document.getElementById("kembalian").innerHTML = "Rp0";
  document.getElementById("uangBayar").value = "";
}

function simpanData(){
  localStorage.setItem(
    "dataProduk",
    JSON.stringify(produk)
  );

  alert("Daftar barang berhasil disimpan!");
}

function bukaHistory(){
  document.getElementById("shopPage").style.display = "none";
  document.getElementById("historyPage").style.display = "block";

  tampilkanHistory();
}

function kembaliKeShop(){
  document.getElementById("historyPage").style.display = "none";
  document.getElementById("shopPage").style.display = "block";
}

function tampilkanHistory(){
  const container = document.getElementById("historyContainer");

  container.innerHTML = "";

  if(historyBelanja.length === 0){
    container.innerHTML = "<p style='color:#374151;'>Belum ada history belanja.</p>";
    return;
  }

  historyBelanja.forEach((data,index)=>{

    let detailBarang = "";

    data.barang.forEach((barang)=>{
      detailBarang += `
        <li>
          ${barang.nama}
          (${barang.jumlah}x)
          -
          ${rupiah(barang.subtotal)}
        </li>
      `;
    });

    container.innerHTML += `
      <div class="history-card">

        <div
          class="history-header"
          onclick="toggleHistory(${index})"
        >

          <h3>
            Transaksi ${index + 1}
          </h3>

          <span>
            ${data.tanggal}
          </span>

        </div>

        <div
          class="history-detail"
          id="detail${index}"
        >

          <h4>Barang Dibeli:</h4>

          <ul>
            ${detailBarang}
          </ul>

          <p>
            <strong>Total:</strong>
            ${rupiah(data.total)}
          </p>

          <p>
            <strong>Bayar:</strong>
            ${rupiah(data.bayar)}
          </p>

          <p>
            <strong>Kembalian:</strong>
            ${rupiah(data.kembali)}
          </p>

        </div>

      </div>
    `;
  });
}

function toggleHistory(index){
  const detail = document.getElementById(`detail${index}`);

  if(detail.style.display === "block"){
    detail.style.display = "none";
  }else{
    detail.style.display = "block";
  }
}