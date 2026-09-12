const weatherInput = document.getElementById("weather-input");
const tempEl = document.querySelector(".temp");
const humdityEl = document.querySelector(".humdity");
const windEl = document.querySelector(".wind");
const dailyEl = document.querySelector(".daily");
const container = document.querySelector(".weather-main-container");
const noResEl = document.querySelector(".no-res");
const notFoundEl = document.querySelector(".not-found");
const loadingEl = document.querySelector(".loading");
const cityMenuEl = document.querySelector(".city-menu");
const cityDetailsEl = document.querySelector(".city-details");
const weatherIcon = document.querySelector(".weather-icon");
if (weatherInput.value === "") {
  container.classList.add("remove");
  noResEl.classList.remove("remove");
}
const fetchCities = async () => {
  cityMenuEl.classList.remove("remove");
  cityMenuEl.innerHTML = `
    <p>Loading...</p>
  `;
  const geoLoc = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${weatherInput.value}&count=10`
  );
  const data = await geoLoc.json();
  const cities = data.results;
  console.log("Cities:", cities);
  console.log(cities);
  if (cities) {
    cityMenuEl.classList.remove("remove");
    cityMenuEl.innerHTML = "";
    cities.forEach((city) => {
      console.log("Admin1:", city.admin1);
      cityMenuEl.innerHTML += `
                  <div class="city-item" data-longtitude="${
                    city.longitude
                  }" data-latitude="${city.latitude}" data-city="${
        city.name
      }" data-admin1="${city.admin1}" data-country="${city.country}">
                      <p class="city-name">${city.name}</p>
                      <span class="city-props">${
                        city.admin1 ? city.admin1 + "," : ""
                      } ${city.country}</span>
                  </div>
                `;
    });
  } else {
    cityMenuEl.innerHTML = `
      <p>No Area found!</p>
    `;
    // cityMenuEl.classList.add('remove')
  }
  const allCityItems = document.querySelectorAll(".city-item");
  allCityItems.forEach((city) => {
    city.addEventListener("click", (e) => {
      const longtitude = e.currentTarget.getAttribute("data-longtitude");
      const latitude = e.currentTarget.getAttribute("data-latitude");
      const city = e.currentTarget.getAttribute("data-city");
      const admin1 = e.currentTarget.getAttribute("data-admin1");
      const country = e.currentTarget.getAttribute("data-country");
      getWeather(longtitude, latitude, city, admin1, country);
    });
  });
};
let timer;
weatherInput.addEventListener("input", async () => {
  if (weatherInput.value === "") {
    cityMenuEl.classList.add("remove");
    return;
  }

  clearTimeout(timer);

  timer = setTimeout(() => {
    fetchCities();
  }, 500);
});
function getWeatherIcon(code) {
  if (code === 0) {
    return `<i class="fa-solid fa-sun"></i>`;
  }

  if (code >= 1 && code <= 2) {
    return `<i class="fa-solid fa-cloud-sun"></i>`;
  }

  if (code === 3) {
    return `<i class="fa-solid fa-cloud"></i>`;
  }

  if (code === 45 || code === 48) {
    return `<i class="fa-solid fa-smog"></i>`;
  }

  if (code >= 51 && code <= 57) {
    return `<i class="fa-solid fa-cloud-rain"></i>`;
  }

  if (code >= 61 && code <= 67) {
    return `<i class="fa-solid fa-cloud-showers-heavy"></i>`;
  }

  if (code >= 71 && code <= 77) {
    return `<i class="fa-solid fa-snowflake"></i>`;
  }

  if (code >= 80 && code <= 82) {
    return `<i class="fa-solid fa-cloud-showers-heavy"></i>`;
  }

  if (code === 85 || code === 86) {
    return `<i class="fa-solid fa-snowflake"></i>`;
  }

  if (code === 95 || code === 96 || code === 99) {
    return `<i class="fa-solid fa-cloud-bolt"></i>`;
  }

  return `<i class="fa-solid fa-question"></i>`;
}
async function getWeather(longitude, latitude, city, admin1, country) {
  loadingEl.classList.remove("remove");
  noResEl.classList.add("remove");
  container.classList.add("remove");
  notFoundEl.classList.add("remove");
  cityMenuEl.classList.add("remove");
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&wind_speed_unit=kmh`;
    const data = await fetch(url);
    const res = await data.json();
    loadingEl.classList.add("remove");
    noResEl.classList.add("remove");
    notFoundEl.classList.add("remove");
    container.classList.remove("remove");
    const dailyMinTemp = res.daily.temperature_2m_min;
    const dailyMaxTemp = res.daily.temperature_2m_max;
    const dailyWeatherCode = res.daily.weather_code;
    const dailyWeatherArr = [];
    res.daily.time.forEach((time, index) => {
      const dailyMinTempSingle = dailyMinTemp[index];
      const dailyMaxTempSingle = dailyMaxTemp[index];
      const dailyWeatherCodeSingle = dailyWeatherCode[index];
      const date = new Date(time);
      const formatted = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
      });
      const dailyObj = {
        dailyMinTemp: dailyMinTempSingle,
        dailyMaxTemp: dailyMaxTempSingle,
        dailyWeatherCode: dailyWeatherCodeSingle,
        date: formatted,
      };
      dailyWeatherArr.push(dailyObj);
    });
    dailyEl.innerHTML = "";
    dailyWeatherArr.forEach((item) => {
      dailyEl.innerHTML += `
      <div class="daily-item">
        <p class="daily-day">${item.date.split(",")[0]}</p>
        <p class="daily-icon">${getWeatherIcon(item.dailyWeatherCode)}, ${item.dailyWeatherCode}</p>
        <div class="daily-temp">
          <p>${item.dailyMinTemp}</p>
          <p>${item.dailyMaxTemp}</p>
        </div>
      </div>
    `;
    });

    const temp = res.current.temperature_2m;
    const humdity = res.current.relative_humidity_2m;
    const wind = res.current.wind_speed_10m;
    const weatherCodeToday = res.current.weather_code;
    console.log("Weather Code: ", weatherCodeToday);
    tempEl.innerText = temp;
    humdityEl.innerText = humdity;
    windEl.innerText = wind;
    cityDetailsEl.innerHTML = `
    <span><i class="fa-solid fa-location-dot"></i> ${
      admin1 === "undefined" ? "" : admin1 + ","
    } ${country}</span>
  `;
    weatherIcon.innerHTML = getWeatherIcon(weatherCodeToday);
    console.log("Weather Response:", res);
    weatherInput.value = "";
  } catch (error) {
    console.log(error);
  }
}
