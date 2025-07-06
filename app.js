const contractAddress = "0x8943c7bac1914c9a7aba750bf2b6b09fd21037e0";
const apiKey = "GSnHsILY8XmlcvmWx0USh"; // Replace with your Alchemy API Key

let selectedTraits = [];
let selectedImage = null;
let nftImage = new Image();
const canvas = document.getElementById('badgeCanvas');
const ctx = canvas.getContext('2d');
const flipSound = new Audio("https://cdn.jsdelivr.net/gh/ATOMNFT/Unofficial-LL-Badge-Generator/Sounds/Lion-Roar.wav");

const dailySayings = {
  0: "Roar into Sunday with pride!",
  1: "Mane Monday – lead the pride!",
  2: "Terrific Tuesday traits inbound!",
  3: "Wild Wisdom Wednesday!",
  4: "Thrive on Thursday!",
  5: "Fearless Friday ferocity!",
  6: "Savage Saturday style!"
};

const today = new Date().getDay();
const todaySaying = dailySayings[today];

async function fetchLions() {
  const wallet = document.getElementById("walletInput").value.trim();
  const output = document.getElementById("output");
  output.innerHTML = "Loading...";
  selectedImage = null;

  const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTs?owner=${wallet}&contractAddresses[]=${contractAddress}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.ownedNfts || data.ownedNfts.length === 0) {
      output.innerHTML = "No Lazy Lions found.";
      return;
    }

    output.innerHTML = "";
    data.ownedNfts.forEach(nft => {
      let imgUrl = nft.metadata?.image || "";
      if (imgUrl.startsWith("ipfs://")) {
        imgUrl = imgUrl.replace("ipfs://", "https://nftstorage.link/ipfs/");
      }
      const img = document.createElement("img");
      img.src = imgUrl;
      img.addEventListener('click', () => {
        document.querySelectorAll('.grid img').forEach(el => el.classList.remove('selected'));
        img.classList.add('selected');
        selectedImage = img.src;
        selectedTraits = nft.metadata?.attributes || [];
        nftImage.crossOrigin = "anonymous";
        nftImage.src = selectedImage;
      });
      output.appendChild(img);
    });
  } catch (e) {
    console.error(e);
    output.innerHTML = "Error fetching data.";
  }
}

async function generateBadge() {
  if (!selectedImage) return alert("Please select an NFT");

  document.getElementById("downloadBtn").disabled = true;
  const { x, y, width, height } = document.getElementById("generateBtn").getBoundingClientRect();
  particleBurst(x + width / 2, y + height / 2);

  flipSound.currentTime = 0;
  flipSound.play();

  canvas.classList.add('flipping');
  setTimeout(() => {
    canvas.classList.remove('flipping');
  }, 600);

  const badgeSrc = document.querySelector('input[name="badge"]:checked').value;
  const badgeImage = new Image();
  badgeImage.crossOrigin = "anonymous";
  badgeImage.src = badgeSrc;

  const badgeNumber = badgeSrc.match(/\d+/)?.[0] || "1";
  const logoSrc = `logo${badgeNumber}.png`;

  badgeImage.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(badgeImage, 0, 0, 300, 300);

    nftImage.onload = () => {
      ctx.drawImage(nftImage, 15, 75, 150, 150);

      // Traits on preview
      ctx.font = "7px 'Merriweather', serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      selectedTraits.slice(0, 6).forEach((trait, index) => {
        const text = `${trait.trait_type}: ${trait.value}`;
        ctx.fillText(text, 15, 34 + index * 7);
      });

      // Saying on preview
      ctx.font = "10px 'Merriweather', serif";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.textAlign = "center";
      ctx.strokeText(todaySaying, canvas.width / 2, 12);
      ctx.fillText(todaySaying, canvas.width / 2, 12);

	// Overlay logo on preview
	const badgeMatch = badgeSrc.match(/LZB(\d)\.png/);
	const logoNum = badgeMatch ? badgeMatch[1] : "1"; // fallback to logo1.png
	const logoSrc = `logo${logoNum}.png`;

	const overlayImg = new Image();
	overlayImg.crossOrigin = "anonymous";
	overlayImg.src = logoSrc;
	overlayImg.onload = () => {
	  ctx.drawImage(overlayImg, 15, 265, 55, 24);
	};

      document.getElementById("downloadBtn").disabled = false;
    };

    if (nftImage.complete) nftImage.onload();
  };

  if (badgeImage.complete) badgeImage.onload();
}

async function downloadImage() {
  const badgeSrc = document.querySelector('input[name="badge"]:checked').value;
  const badgeImage = new Image();
  badgeImage.crossOrigin = "anonymous";
  badgeImage.src = badgeSrc;

  const badgeNumber = badgeSrc.match(/\d+/)?.[0] || "1";
  const logoSrc = `logo${badgeNumber}.png`;

  badgeImage.onload = async () => {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = 800;
    offCanvas.height = 800;
    const offCtx = offCanvas.getContext("2d");

    offCtx.drawImage(badgeImage, 0, 0, 800, 800);

    await document.fonts.ready;
    offCtx.font = "20px 'Merriweather', serif";
    offCtx.fillStyle = "#ffffff";
    offCtx.textAlign = "left";
    selectedTraits.slice(0, 6).forEach((trait, index) => {
      const text = `${trait.trait_type}: ${trait.value}`;
      offCtx.fillText(text, 30, 90 + index * 20);
    });

    // Saying on badge
    offCtx.font = "26px 'Merriweather', serif";
    offCtx.fillStyle = "#ffffff";
    offCtx.strokeStyle = "#000000";
    offCtx.lineWidth = 4;
    offCtx.textAlign = "center";
    offCtx.strokeText(todaySaying, offCanvas.width / 2, 30);
    offCtx.fillText(todaySaying, offCanvas.width / 2, 30);

    const tempNFT = new Image();
    tempNFT.crossOrigin = "anonymous";
    tempNFT.src = selectedImage;

    tempNFT.onload = () => {
      offCtx.drawImage(tempNFT, 30, 200, 400, 400);

      // Overlay logo on badge
      const overlayImg = new Image();
      overlayImg.crossOrigin = "anonymous";
      overlayImg.src = logoSrc;
      overlayImg.onload = () => {
        offCtx.drawImage(overlayImg, 28, 710, 128, 65);

        const dataURL = offCanvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = "lazy-lion-badge.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
    };
  };
}

document.getElementById("generateBtn").addEventListener("click", generateBadge);
document.getElementById("downloadBtn").addEventListener("click", downloadImage);

function particleBurst(x, y) {
  for (let i = 0; i < 24; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    document.body.appendChild(particle);

    const angle = Math.random() * 2 * Math.PI;
    const radius = 100 + Math.random() * 50;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--x', `${Math.cos(angle) * radius}px`);
    particle.style.setProperty('--y', `${Math.sin(angle) * radius}px`);

    setTimeout(() => particle.remove(), 800);
  }
}
