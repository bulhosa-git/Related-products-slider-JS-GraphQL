//Page URL
var pageUrl = window.location.href;
var urlParams = new URLSearchParams(window.location.search);

//Language
var lang = "pt";
if(pageUrl.includes("/es/")) { lang = "es"; }

//psBtn eventListener
document.querySelectorAll(".psBtn").forEach(psBtn => {
    psBtn.addEventListener("click", (e) => {
        e.preventDefault();
        productSliderModal(psBtn.getAttribute("data-hash"), psBtn.getAttribute("data-products"));
    });
});

//Get URL hash
//Launch productSliderModal() on page load
var hash = window.location.hash;

if(hash && hash.includes("stl") && !hash.includes("closed")) {
    hash = hash.substring(1);
    var psBtn = document.querySelector("[data-hash=\"" + hash + "\"]");
    productSliderModal(hash, psBtn.getAttribute("data-products"));
}

//Flush cache
if(urlParams.has("cache")) { 
    localStorage.removeItem("productSliderModal");
    console.log("Removed [productSliderModal] from localStorage");
}

function productSliderModal($hash, $products) {
    if(!$hash) {
        console.log("[productSliderModal] Missing function parameters (1)");
        return false;
    }

    if(!$products) {
        console.log("[productSliderModal] Missing function parameters (2)");
        return false;
    }

    //Check $hash
    if(!$hash.includes("stl")) {
        console.log("[productSliderModal] Invalid hash");
        return false;
    }

    //Add hash to URL
    window.location.hash = $hash;

    //Remove white spaces from $products string (if any)
    $products = $products.replace(/\s/g,'');

    //Convert to array
    $products = $products.split(",");

    //Check $products
    if($products.length == 0) {
        console.log("[productSliderModal] Unable to load product list");
        return false;
    }

    //Proceed > build UI

    var productSliderModal = document.createElement('div');
    productSliderModal.setAttribute("id","product-slider-modal");

    productSliderModal.innerHTML += "<a class=\"close-overlay\"></a>";
    productSliderModal.innerHTML += "<div class=\"psm-inner\"><a href=\"#\" class=\"close\"><i></i></a><div class=\"slider-wrapper\"><div class=\"slider-trail\"></div></div></div>";
    
    //Loop items
    for (var i=0; i < $products.length; i++) {
        //Item
        var prodEl = document.createElement('a');
        prodEl.classList.add("slider-item");
        prodEl.href = "#";
        prodEl.setAttribute("id", "prodEl" + Math.floor(Math.random() * 999));
        prodEl.setAttribute("data-sku", $products[i]);
        prodEl.innerHTML += "<div class=\"image-wrapper\"><img src=\"https://www.tiffosi.com/media/wysiwyg/product_canvas.png\"><div class=\"loading-spinner\"></div></div>";
        prodEl.innerHTML += "<p class=\"product-title\"></p>";
        prodEl.innerHTML += "<p class=\"product-price\"></p>";
        productSliderModal.querySelector(".slider-trail").appendChild(prodEl);
    }

    //Center items and/or show arrows
    var computedStyle = getComputedStyle(document.querySelector(":root"));
    var nEls = computedStyle.getPropertyValue('--nels');

    if($products.length <= nEls) {
        productSliderModal.querySelector(".slider-wrapper").classList.add("center");
        var showArrows = false;
    } else {
        var showArrows = true; //Has overflow
    }

    if(showArrows) {
        var arrowsEl = document.createElement('div');
        arrowsEl.classList.add("arrows-wrapper");
        arrowsEl.innerHTML += "<a href=\"#\" class=\"slider-arrow arrow-left\" data-move=\"left\"><span></span></a>";
        arrowsEl.innerHTML += "<a href=\"#\" class=\"slider-arrow arrow-right\" data-move=\"right\"><span></span></a>";
        productSliderModal.querySelector(".psm-inner").appendChild(arrowsEl);
    }

    //Append
    document.body.appendChild(productSliderModal);
    productSliderModal.classList.add("show"); 

    //All good > fade in
    setTimeout(function() { 
        productSliderModal.querySelector("a.close-overlay").classList.add("fadeIn"); 
    }, 0);

    setTimeout(function() { 
        productSliderModal.querySelector(".psm-inner").classList.add("slideIn"); 
    }, 150);

    //addEventListener to scroll arrows
    if(showArrows) {
        var isDown = false;
        var hasMoved = false;
        var startX;
        var scrollLeft;
        var inverted = false;
        var sliderWrapper = productSliderModal.querySelector(".slider-wrapper");

        sliderWrapper.addEventListener("mousedown", (event) => {
          isDown = true;
          sliderWrapper.classList.add("active");
          startX = event.pageX - sliderWrapper.offsetLeft;
          scrollLeft = sliderWrapper.scrollLeft;
        });

        sliderWrapper.addEventListener("mouseleave", (event) => {
          isDown = false;
          sliderWrapper.classList.remove("active");
          hasMoved = false;
          event.preventDefault();
        });

        sliderWrapper.addEventListener("mouseup", (event) => {
          isDown = false;
          sliderWrapper.classList.remove("active");
          setTimeout(function() { hasMoved = false; }, 1);
        });

        sliderWrapper.addEventListener("mousemove", (event) => {
          if(!isDown) return;
          event.preventDefault();
          const x = event.pageX - sliderWrapper.offsetLeft;
          const walk = (x - startX) * 1;
          sliderWrapper.scrollLeft = scrollLeft - walk;
          hasMoved = true;
        });

        sliderWrapper.addEventListener("click", (event) => {
          if(hasMoved) { event.preventDefault(); }
        });

        productSliderModal.querySelectorAll(".slider-arrow").forEach(sliderArrow => {
            sliderArrow.addEventListener("click", saClickHandler = function(event) {
                event.preventDefault();
                var moveD = this.getAttribute("data-move");

                if(sliderWrapper.scrollLeft == 0 && !inverted) {
                    if(moveD == "right") {
                        productSliderModal.querySelector(".arrow-left").dataset.move = "right";
                        this.dataset.move = "left";
                        moveD = "left";
                    }
                    inverted = true;
                }

                if(moveD == "left") {
                    sliderWrapper.scrollTo({ left: sliderWrapper.scrollLeft + 200, behavior: "smooth" });
                } else {
                    sliderWrapper.scrollTo({ left: sliderWrapper.scrollLeft - 200, behavior: "smooth" });
                } 
            });
        });
    }

    //addEventListener to close buttons
    productSliderModal.querySelector("a.close-overlay").addEventListener("click", psmClose = function(e) {
        e.preventDefault();

        productSliderModal.querySelector(".psm-inner").classList.remove("slideIn");

        setTimeout(function() { 
            productSliderModal.querySelector("a.close-overlay").classList.remove("fadeIn"); 
        }, 150);

        setTimeout(function() { 
            productSliderModal.remove(); 
            window.location.hash = $hash + "-closed";
        }, 500);
    });

    productSliderModal.querySelector("a.close").addEventListener("click", psmClose = function(e) {
        e.preventDefault();
        productSliderModal.querySelector("a.close-overlay").click();
    });



    //Fetch product data
    //Using a timer to delay the requests in order to keep navigation/animations fluidity
    setTimeout(function() { 
        productSliderModal.querySelectorAll(".slider-item").forEach(sliderItem => {
            psFetch(sliderItem.getAttribute("data-sku"), sliderItem.getAttribute("id"));
        });
    }, 500);
}

function psFetch($sku, $item) {
    var myProduct;

    /*
    ======================
    Read localStorage
    ======================
    */
    var hasCache = false;
    var psmCache = localStorage.getItem("productSliderModal");

    if(psmCache) {
        psmCache = JSON.parse(psmCache);

        for (var i = 0; i < psmCache.length; i++){
            if (psmCache[i].sku == $sku && psmCache[i].lang == lang) {
                hasCache = true;
                //Set myProduct
                myProduct = psmCache[i];
                console.log("[psFetch] Read [" + $sku + "] from localStorage");

                psLoad(myProduct, $item);
                return true;
            }
        }
    }

    //Cache failed...
    //Start GraphQL instead
    var data = {query: '{products (filter: { sku: { eq: "' + $sku + '" } }) {items{name sku url_key image{url} price_range{minimum_price{regular_price{value}final_price{value}discount{percent_off}}}}}}'};
    data = JSON.stringify(data);

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://www.tiffosi.com/graphql/", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Store", lang);
    xhttp.send(data);

    xhttp.onreadystatechange = function(){ 
        if (this.readyState == 4 && this.status == 200) {
            //console.log("Response (1): " + this.responseText + " (" + this.status + ")");
            var psFetch = JSON.parse(this.responseText);

            //Error check
            if(psFetch.hasOwnProperty("errors")) {
                console.log("[psFetch] You have an error in your GraphQL query");
                return false;
            }

            if(psFetch.data.products.items.length == 0)  {
                console.log("[psFetch] No items to show");
                return false;
            }

            //Set myProduct
            myProduct = psFetch.data.products.items[0];
            myProduct.lang = lang;

            /*
            ======================
            Write localStorage
            ======================
            */

            //Get localStorage
            var existingLSEntries = JSON.parse(localStorage.getItem("productSliderModal"));

            //Fallback
            if(existingLSEntries == null) { var existingLSEntries = []; }

            //Write to localStorage
            existingLSEntries.push(myProduct);
            localStorage.setItem("productSliderModal", JSON.stringify(existingLSEntries));

            //Success
            console.log("[psFetch] Write [" + $sku + "] to localStorage");

            //Proceed
            psLoad(myProduct, $item);
        } else {
            //console.log("[psFetch] XMLHttpRequest (" + this.readyState + ") (" + this.status + ")");
        }
    }; //end xhttp.onreadystatechange
}

function psLoad($product, $item) {
    //Get element
    var myEl = document.getElementById($item);

    //Get image
    var myImage = $product.image['url'];
    myImage = myImage.substring(0, myImage.indexOf('.jpg'));

    //Assign image
    myEl.querySelector("img").src = myImage + ".jpg?width=300&quality=80";
    myEl.querySelector(".loading-spinner").remove();

    //Assign product info
    myEl.href = "https://tiffosi.com/" + lang + "/" + $product['url_key'] + ".html";
    myEl.querySelector("p.product-title").innerText = $product['name'];
    myEl.querySelector("p.product-price").innerText = $product.price_range.minimum_price.final_price['value'] + " \u20AC";

    //Show
    myEl.classList.add("loaded");
}
