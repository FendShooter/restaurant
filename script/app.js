class ZOMATO {
  constructor() {
    this.api = "eb3e0fa583cb97ab1b27c3ec3a8363cc";
    this.header = {
      method: "GET",
      headers: {
        "user-key": this.api,
        "content-type": "application/json"
      },
      credentials: "same-origin"
    };
  }

  async serachApi(city, categoryID) {
    // cagetory url
    const categoryUrl = `https://developers.zomato.com/api/v2.1/categories`;
    //city url
    const cityUrl = `https://developers.zomato.com/api/v2.1/cities?q=${city}`;
    // categories
    const categoryInfo = await fetch(categoryUrl, this.header);
    const categoryJson = await categoryInfo.json();
    const categories = await categoryJson.categories;

    const cityInfo = await fetch(cityUrl, this.header);
    const cityjson = await cityInfo.json();
    const cityLocation = await cityjson.location_suggestions;

    let cityID = 0;
    if (cityLocation.length > 0) {
      cityID = await cityLocation[0].id;
    }
    //search restaurant
    const restaurantUrl = `https://developers.zomato.com/api/v2.1/search?entity_id=${cityID}
    &entity_type=city&category=${categoryID}&sort=rating`;

    const restaurantInfo = await fetch(restaurantUrl,this.header);
    const restaurantjson = await restaurantInfo.json();
    const restaurants = await restaurantjson.restaurants;
    return {
      categories,
      cityID,
      restaurants
    };
  }
}

class UI {
  constructor() {
    this.loader = document.querySelector(".anim");
    this.restaurantList = document.getElementById("restaurantList");
  }

    showloader() {
        this.loader.classList.add('dblock') ;
  }
    hideloader() {
        this.loader.classList.remove('dblock') ;
  }
  getRestaurants(restaurants) {
    this.hideloader();
    if (restaurants.length === 0) {
      this.errMsg('No such ctegory in th slected city')
    }
    else {
      restaurants.forEach(restaurant => {
        const {
          thumb: img,
          name,
          location: { address },
          user_rating: { aggregate_rating },
          cuisines,
          average_cost_for_two: cost,
          menu_url,
          url
        } = restaurant.restaurant;
        if (img !== '') {
          this.showRestaurant(
            img,
            name,
            address,
            aggregate_rating,
            cuisines,
            cost,
            menu_url,
            url
          );

        }
    })
    }
  }
  showRestaurant(img, name, address, aggregate_rating, cuisines, cost, menu_url, url) {
    let info = '';
info += `<div class="card">
                <div class="top">
                  <div class="dish__pic">
                    <img
                      src="${img}"
                      class="img-thumbnail"
                      alt=""
                    />
                  </div>
                  <div class="top_detail">
                    <div class="name">${name}</div>
                    <div class="street">${address}</div>
                  </div>
                  <div class="star">${aggregate_rating}</div>
                </div>
                <hr />
                <div class="middle">
                  <div class="cuisine">
                    <label class="label">Cuisine:</label>
                    <div class="cuisineR">${cuisines}</div>
                  </div>
                  <div class="cost">
                    <label class="label">Cost for two:</label>
                    <div class="costR">${cost}</div>
                  </div>
                </div>
                <hr />
                <div class="bottom">
                  <a href="${menu_url}" class="btn btn-outline-danger">
                    <i class="fas fa-book"></i> Menu</a
                  >
                  <a href="${url}" class="btn btn-outline-danger"
                    ><i class="fas fa-book"></i> WEBSITE</a
                  >
                </div>
              </div>`;
    const cards = document.querySelector('.cards');
    cards.innerHTML += info;
  }
  addSelectOptions(categories) {
    const search = document.getElementById("searchCategory");
    let output = `<option value='0' selected >Select category </option>`;
    categories.forEach(category => {
      output += `<option value="${category.categories.id}">${
        category.categories.name
      }</option>`;
      search.innerHTML = output;
    });
  }

  errMsg(text) {
    const feedback = document.querySelector(".feedback");
    feedback.classList.add("showitem");
    feedback.innerHTML = text;
    setTimeout(() => {
      feedback.classList.remove("showitem");
      feedback.innerHTML = "";
    }, 3000);
  }
}

(function() {
  const zomato = new ZOMATO();
  const ui = new UI();
  const searchForm = document.getElementById("searchForm");
  const searchCategory = document.getElementById("searchCategory");
  const searchCity = document.getElementById("searchCity");
  // add select options

  document.addEventListener("DOMContentLoaded", () => {
    zomato.serachApi().then(data => ui.addSelectOptions(data.categories));
  });

  // submit form
  searchForm.addEventListener("submit", e => {
    e.preventDefault();
    const city = searchCity.value;
    const categoryID = parseInt(searchCategory.value);
    console.log(city, categoryID);
    if (city === "" || categoryID === 0) {
      ui.errMsg("Please enter a correct value");
    } else {
        zomato.serachApi(city).then(cityData => {
            
            if (cityData.cityID === 0) {
                ui.errMsg('Please enter a correct city')
            }
            else {
                ui.showloader();
              zomato.serachApi(city, categoryID).then(data => {
                  ui.getRestaurants(data.restaurants)
                })
            }
        });
    }
  });
})();
