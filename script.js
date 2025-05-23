const apiKey = "8a6c1a7f4d0d9bf301e865dd0a32adaa"; // Personal API key

// DOM Elements selecting
const searchBtn = document.getElementById("search-btn");
const currentLocationBtn = document.getElementById("current-location-btn");
const cityInput = document.getElementById("city-input");
const recentCities = document.getElementById("recent-cities");
const temperature = document.getElementById("temperature");
const weatherIcon = document.getElementById("weather-icon");
const weatherCondition = document.getElementById("weather-condition");
const cityName = document.getElementById("city-name");
const date1 = document.getElementById("date1");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const feelsLike = document.getElementById("feels-like");
const forecast = document.getElementById("forecast");

// Load Recent Cities from Local Storage
const loadRecentCities = () => {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentCities.innerHTML = '<option value="">Recently Searched</option>';
  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCities.appendChild(option);
  });
};

// Save Recent City to Local Storage
const saveRecentCity = (city) => {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities = [city, ...cities].slice(0, 10); // Keep only the latest 5 cities
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
};

// Fetch Weather Data
const fetchWeather = async (city) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
  );
  if (!res.ok) throw new Error("City not found");
  const data = await res.json();
  updateNowCard(data);
  saveRecentCity(city);
  loadRecentCities();
};

// Fetch Forecast Data
const fetchForecast = async (city) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
  );
  if (!res.ok) throw new Error("City not found");
  const data = await res.json();
  updateForecast(data);
};

// Update Current Weather Card
const updateNowCard = (data) => {
  // getting date
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  cityName.textContent = `City: ${data.name}`;
  date1.textContent = `Date: ${currentDate}`; // Dynamically setting the current date
  temperature.textContent = `${data.main.temp}°C`;
  weatherCondition.textContent = data.weather[0].description;
  weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  humidity.textContent = `${data.main.humidity}%`;
  pressure.textContent = `${data.main.pressure} hPa`;
  visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  feelsLike.textContent = `${data.main.feels_like}°C`;
};
// Update 5-Day Forecast
const updateForecast = (data) => {
  forecast.innerHTML = "";
  for (let i = 0; i < data.list.length; i += 8) {
    const day = data.list[i];
    forecast.innerHTML += `
      <div class="bg-purple-900 rounded-lg shadow-lg p-4 text-center">
        <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
        <img src="http://openweathermap.org/img/wn/${
          day.weather[0].icon
        }@2x.png" alt="Weather Icon" class="h-15 w-15 mx-auto">
        <p>Temp: ${day.main.temp}°C</p>
        <p>Wind: ${day.wind.speed} m/s</p>
        <p>Humidity: ${day.main.humidity}%</p>
      </div>
    `;
  }
};

// Current Location finder by coordinates
const fetchWeatherByCoords = async (lat, lon) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
  );
  if (!res.ok) throw new Error("Location not found");
  const data = await res.json();
  updateNowCard(data);
};

// Event Listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  //error handling for both API calls
  Promise.all([fetchWeather(city), fetchForecast(city)]).catch(
    () => alert("Invalid location. Please enter a valid city name.") // Invalid Location fetch - show alert
  );
});

currentLocationBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude).catch(
        () => alert("Unable to fetch weather for your current location.") // Unable to fetch current location - show alert
      );
    },
    () => alert("Unable to fetch location. Please enable location services.") // Unable to fetch - show alert
  );
});

recentCities.addEventListener("change", (e) => {
  const city = e.target.value;
  if (city) {
    Promise.all([fetchWeather(city), fetchForecast(city)]).catch(
      () => alert("Invalid location. Please enter a valid city name.") // Invalid Location - show alert
    );
  }
});

// Initialize App and Add default location Delhi
loadRecentCities();
fetchWeather("Delhi");
fetchForecast("Delhi");
