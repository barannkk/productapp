const productList = document.getElementById("product-list");

const colors = {
    yellow: { name: "Yellow Gold", hex: "#E6CA97" },
    white: { name: "White Gold", hex: "#D9D9D9" },
    rose: { name: "Rose Gold", hex: "#E1A4A9" }
};

let productsData = [];

async function fetchProducts() {
    const res = await fetch("/products");
    productsData = await res.json();
    renderProducts(productsData);
}

function renderProducts(products) {
    productList.innerHTML = "";
    if (products.length === 0) {
        productList.innerHTML = "<p>No products found.</p>";
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        let selectedColor = "yellow";

        const img = document.createElement("img");
        img.src = product.images[selectedColor];
        card.appendChild(img);

        const name = document.createElement("h3");
        name.textContent = product.name;
        card.appendChild(name);

        const price = document.createElement("p");
        price.className = "price";
        price.textContent = `$${product.price}`;
        card.appendChild(price);

        const colorPicker = document.createElement("div");
        colorPicker.className = "color-picker";

        const selectedColorName = document.createElement("span");
        selectedColorName.className = "selected-color-name";
        selectedColorName.textContent = colors[selectedColor].name;

        const colorButtons = [];
        Object.keys(product.images).forEach(color => {
            const btn = document.createElement("button");
            btn.style.backgroundColor = colors[color].hex;
            btn.setAttribute("data-color", color);
            if (color === selectedColor) btn.classList.add("selected");

            btn.addEventListener("click", () => {
                colorButtons.forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                selectedColor = color;
                img.src = product.images[selectedColor];
                selectedColorName.textContent = colors[selectedColor].name;
            });

            colorPicker.appendChild(btn);
            colorButtons.push(btn);
        });

        card.appendChild(colorPicker);
        card.appendChild(selectedColorName);

        const ratingValue = parseFloat(product.popularity);
        const starsWrapper = document.createElement("div");
        starsWrapper.className = "stars-wrapper";

        const starsEmpty = document.createElement("span");
        starsEmpty.className = "stars empty";
        starsEmpty.textContent = '★★★★★';

        const starsFull = document.createElement("span");
        starsFull.className = "stars full";
        starsFull.textContent = '★★★★★';
        starsFull.style.width = `${(ratingValue / 5) * 100}%`;

        starsWrapper.appendChild(starsEmpty);
        starsWrapper.appendChild(starsFull);

        const ratingText = document.createElement("span");
        ratingText.className = "rating-text";
        ratingText.textContent = `${ratingValue}/5`;

        const ratingContainer = document.createElement("div");
        ratingContainer.className = "rating";
        ratingContainer.appendChild(starsWrapper);
        ratingContainer.appendChild(ratingText);

        card.appendChild(ratingContainer);
        productList.appendChild(card);
    });
}

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-control");
if (productList && prevBtn && nextBtn) {
    const scrollAmount = 270;
    nextBtn.addEventListener('click', () => productList.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
    prevBtn.addEventListener('click', () => productList.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));

    const checkScroll = () => {
        const scrollLeft = productList.scrollLeft;
        const scrollWidth = productList.scrollWidth;
        const clientWidth = productList.clientWidth;

        prevBtn.style.opacity = scrollLeft < 5 ? '0' : '1';
        prevBtn.style.pointerEvents = scrollLeft < 5 ? 'none' : 'auto';
        nextBtn.style.opacity = (scrollWidth - scrollLeft - clientWidth) < 5 ? '0' : '1';
        nextBtn.style.pointerEvents = (scrollWidth - scrollLeft - clientWidth) < 5 ? 'none' : 'auto';
    };
    productList.addEventListener('scroll', checkScroll);
    setTimeout(checkScroll, 500);
}

let isDragging = false;
let startX;
let scrollStart;


productList.addEventListener('pointerdown', (e) => {

    if (e.target.closest('button')) {
        return; 
    }
    
    e.preventDefault(); 
    isDragging = true;
    startX = e.pageX;
    scrollStart = productList.scrollLeft;
    productList.setPointerCapture(e.pointerId);
});

productList.addEventListener('pointermove', (e) => {
    if(!isDragging) return;
    const delta = e.pageX - startX;
    productList.scrollLeft = scrollStart - delta;
});

productList.addEventListener('pointerup', (e) => {
    isDragging = false;
    productList.releasePointerCapture(e.pointerId);
});

document.getElementById("sortSelect").addEventListener("change", (e) => {
    let sorted = [...productsData];
    switch(e.target.value) {
        case "priceAsc":
            sorted.sort((a,b) => a.price - b.price);
            break;
        case "priceDesc":
            sorted.sort((a,b) => b.price - a.price);
            break;
        case "popularityAsc":
            sorted.sort((a,b) => a.popularity - b.popularity);
            break;
        case "popularityDesc":
            sorted.sort((a,b) => b.popularity - a.popularity);
            break;
    }
    renderProducts(sorted);
});

fetchProducts();
