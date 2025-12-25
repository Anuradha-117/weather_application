// POINTERS
const searchInput = document.querySelector('.search-input');
const suggestionsDropdown = document.getElementById('suggestions-dropdown');
const locationDisplay = document.getElementById('location-display');
const dateDisplay = document.getElementById('date-display');
const tempDisplay = document.getElementById('temp-display');
const conditionDisplay = document.getElementById('condition-display');
const mainIcon = document.getElementById('main-icon');
const bgImg = document.getElementById('bg-img');

const humidityVal = document.getElementById('humidity-val');
const windVal = document.getElementById('wind-val');
const visVal = document.getElementById('vis-val');
const pressureVal = document.getElementById('pressure-val');

// API KEY
const API_KEY = "7c789b66ae5f48acaf871239252312";

// TIMEOUT FOR AUTOCOMPLETE
let searchTimeout;

// MAIN FETCH FUNCTION
function fetchWeather(city) {
    let url = "https://api.weatherapi.com/v1/forecast.json?key=" + API_KEY + "&q=" + city + "&days=2&aqi=no&alerts=no";

    fetch(url)
        .then(res => res.json())
        .then(data => {
            //UPDATE CURRENT WEATHER
            locationDisplay.textContent = data.location.name + ", " + data.location.country;
            dateDisplay.textContent = data.location.localtime;
            tempDisplay.textContent = data.current.temp_c + "°C";
            conditionDisplay.textContent = data.current.condition.text;
            humidityVal.textContent = data.current.humidity + "%";
            windVal.textContent = data.current.wind_kph + " km/h";
            visVal.textContent = data.current.vis_km + " km";
            pressureVal.textContent = data.current.pressure_mb + " hPa";

            // Icon & Background Image
            let iconPath = getMyIcon(data.current.condition.text, data.current.is_day);
            mainIcon.src = iconPath;
            updateBackground(data.current.condition.text, data.current.is_day);

            //UPDATE HOURLY FORECAST
            let localTime = data.location.localtime;
            let cityHour = parseInt(localTime.split(" ")[1].split(":")[0]);
            let todayData = data.forecast.forecastday[0].hour;
            let tomorrowData = data.forecast.forecastday[1].hour;
            let allHours = todayData.concat(tomorrowData);
            updateHourlyBoxes(allHours, cityHour);
            console.log("Success for: " + data.location.name);
        })
        .catch(err => {
            console.error(err);
            alert("City not found or API error!");
        });
}

//FUNCTIONS TO UPDATE HOURLY BOXES
function updateHourlyBoxes(hourList, currentHourNum) {
    for (let i = 1; i <= 10; i++) {
        let nextHourData = hourList[currentHourNum + i];
        if (nextHourData) {
            let timeBox = document.getElementById('time-' + i);
            let tempBox = document.getElementById('temp-' + i);
            let iconBox = document.getElementById('icon-' + i);
            if (timeBox) timeBox.textContent = nextHourData.time.split(" ")[1];
            if (tempBox) tempBox.textContent = Math.round(nextHourData.temp_c) + "°";
            if (iconBox) iconBox.src = getMyIcon(nextHourData.condition.text, nextHourData.is_day);
        }
    }
}

// CHOOSE THE WEATHER ICON
function getMyIcon(conditionText, isDay) {
    let text = conditionText.toLowerCase();
    let fileName = "cloudyicon.svg"; 

    if (text.includes("snow") || text.includes("blizzard") || text.includes("sleet") || text.includes("ice")) {
        fileName = "snowicon.svg";
    }
    else if (text.includes("heavy rain") || text.includes("torrential") || text.includes("extreme")) {
        fileName = "extreme-rain.svg"; 
    }
    else if (text.includes("thunder") || text.includes("storm")) {
        fileName = "thunder.svg";
    }
    else if (text.includes("patchy") || text.includes("light rain") || text.includes("drizzle")) {
        fileName = (isDay === 1) ? "drizzle.svg" : "rain.svg"; 
    }
    else if (text.includes("rain") || text.includes("shower")) {
        fileName = "rain.svg";
    }
    else if (text.includes("sun") || text.includes("clear")) {
        fileName = (isDay === 1) ? "clear-day.svg" : "clear-night.svg";
    } 
    else if (text.includes("mist") || text.includes("fog") || text.includes("overcast")) {
        fileName = "mist.svg";
    }

    return "assets/img/" + fileName;
}

// BACKGROUND .SVG UPDATER
function updateBackground(conditionText, isDay) {
    let text = conditionText.toLowerCase();
    let bgFileName = "sunny.svg";
    if (isDay === 0) {
        bgFileName = "night.svg";
    }
    else {
        if (text.includes("snow") || text.includes("ice") || text.includes("blizzard") || text.includes("sleet")) {
            bgFileName = "snow.svg";
        }
        else if (text.includes("rain") || text.includes("drizzle") || text.includes("shower") || text.includes("thunder")) {
            bgFileName = "rainy.svg";
        }
        else if (text.includes("cloud") || text.includes("overcast") || text.includes("mist") || text.includes("fog")) {
            bgFileName = "cloudy.svg";
        }
        else {
            bgFileName = "sunny.svg";
        }
    }
    bgImg.src = "assets/img/" + bgFileName;
}

// INPUT LISTENER FOR ENTER KEY
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchWeather(searchInput.value);
        suggestionsDropdown.style.display = 'none';
    }
});

// --- AUTOCOMPLETE SEARCH LOGIC ---

// 1. INPUT LISTENER
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        suggestionsDropdown.style.display = 'none';
        return;
    }
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchCitySuggestions(query);
    }, 300);
});

// 2. CLOSE DROPDOWN WHEN CLICKING OUTSIDE
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
        suggestionsDropdown.style.display = 'none';
    }
});

// 3. FETCH AND RENDER SUGGESTIONS
function fetchCitySuggestions(query) {
    let url = "https://api.weatherapi.com/v1/search.json?key=" + API_KEY + "&q=" + encodeURIComponent(query);

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                // Clear old list
                suggestionsDropdown.innerHTML = '';
                
                // Loop through results (limit to 8)
                data.slice(0, 8).forEach(city => {
                    let li = document.createElement('li');
                    li.textContent = `${city.name}, ${city.country}`;
                    
                    // Click Event
                    li.addEventListener('click', () => {
                        searchInput.value = `${city.name}, ${city.country}`;
                        fetchWeather(`${city.name}, ${city.country}`);
                        suggestionsDropdown.style.display = 'none';
                    });
                    
                    suggestionsDropdown.appendChild(li);
                });

                // Show the list
                suggestionsDropdown.style.display = 'block';
            } else {
                suggestionsDropdown.style.display = 'none';
            }
        })
        .catch(err => {
            console.error("Autocomplete error:", err);
            suggestionsDropdown.style.display = 'none';
        });
}

// LOAD USER'S IP LOCATION ON PAGE LOAD
function loadDefaultWeather() {
    let url = "https://api.weatherapi.com/v1/current.json?key=" + API_KEY + "&q=auto:ip";

    fetch(url)
        .then(res => res.json())
        .then(data => {
            fetchWeather(`${data.location.name}, ${data.location.country}`);
        })
        .catch(err => {
            console.error("Error fetching IP location:", err);
            fetchWeather("London");
        });
}

// INITIAL PAGE LOAD
window.addEventListener('load', () => {
    loadDefaultWeather();
});