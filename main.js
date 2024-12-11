const API_KEY = `62ea77f7fa18b4a59c6a0f031c0ae87c`;

let lat = 37.5665; // 서울의 위도
let lon = 126.9780; // 서울의 경도
const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely&lang=kr&appid=${API_KEY}`;

let currentPage = 1;

let searchLocation = document.getElementById("search-location");
let searchButton = document.getElementById("search-button");


const getWeather = async () => {
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Check for missing data
        if (!data.current || !data.hourly || !data.daily) {
            console.error("Incomplete weather data.");
            return;
        }

        render(data);
        paginationRender()
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
};

const render = (data) => {
    if (currentPage === 1) {
        renderFirstPage(data);
    } else if (currentPage === 2) {
        renderSecondPage(data);
    }
};

// 첫번째 페이지
const renderFirstPage  = (data) => {
    console.log(data)
    
    const temp = Math.round(data.current.temp);
    const hum = data.current.humidity;
    const weather = data.current.weather[0].main;
    const weatherIcon = `http://openweathermap.org/img/wn/${data.current.weather[0].icon}.png`;

    const hourly = data.hourly;
    const daily = data.daily || [];
    let timezone = data.timezone.split("/")[1];

    // 시간별 날씨(최대5시간)
    const hourlyForecastHTML = hourly
        .filter((hour) => {
            const currentTime = Date.now() / 1000;
            const maxFutureTime = currentTime + 5 * 3600;
            return hour.dt >= currentTime && hour.dt <= maxFutureTime;
        })
        .map((hour) => {
            const date = new Date(hour.dt * 1000);
            const formattedTime = date.getHours() < 10 ? `0${date.getHours()}시` : `${date.getHours()}시`;
            return `<div class="hour">
                        <span>${formattedTime}</span>
                        <span>${Math.round(hour.temp)}°</span>
                    </div>`;
        })
        .join("");

    // 일별 예측 표시
    const dailyForecastHTML = daily
        .slice(0, 7) // 일주일 예측 데이터만 표시
        .map((day) => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            const minTemp = Math.round(day.temp.min);
            const maxTemp = Math.round(day.temp.max);
            const weatherMain = day.weather[0].main;
            const weatherIcon = `http://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

            return `
                <div class="daily-item">
                    <p class="daily-forecast-text">
                        <span class="day-name">${dayName}</span>
                        <span class="weather-main">${weatherMain}
                        <img src="${weatherIcon}" alt="${weatherMain}" class="daily-weather-icon" /></span>
                        <span class="min-temp">${minTemp}°</span>
                        <span class="max-temp">${maxTemp}°</span>
                    </p>
                </div>
            `;
        })
        .join("");

    const currentWeatherHTML = `
        <div class="location">
            <h6>나의 위치</h6>
            <h1>${timezone}</h1>
            <p>${temp}°</p>
            <img src="${weatherIcon}" alt="${weather}" class="weather-icon" />
        </div>
        <div class="weather-status">
            <p>${weather}</p>
            <p>Humidity: ${hum}%</p>
        </div>
        <div class="hourly-forecast">
            ${hourlyForecastHTML}
        </div>
        <div class="daily-forecast">
            ${dailyForecastHTML}
        </div>
    `;

    document.getElementById("weather-board").innerHTML = currentWeatherHTML;
};

// 위치 검색 기능
const search = async () => {
    let location = searchLocation.value.trim();
    console.log("location", location);

    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${API_KEY}`;
    try {
        const response = await fetch(geoUrl);
        const data = await response.json();

        if (data.length > 0) {
            lat = data[0].lat;
            lon = data[0].lon;

            // Use a new variable for the URL, don't modify 'url'
            const newUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely&lang=kr&appid=${API_KEY}`;
            const weatherResponse = await fetch(newUrl);
            const weatherData = await weatherResponse.json();

            render(weatherData); // Render the weather for the searched location
        } else {
            console.log("Location not found.");
        }
    } catch (error) {
        console.error("Error fetching location or weather data:", error);
    }
};

searchButton.addEventListener("click", search);

// 두번째 페이지 
const renderSecondPage = (data) => {
    console.log("page2 data", data)
    const humidity = data.current.humidity;
    const windSpeed = data.current.wind_speed;
    const sunrise = new Date(data.current.sunrise * 1000);
    const sunset = new Date(data.current.sunset * 1000);

    const sunriseTime = sunrise.toLocaleTimeString();
    const sunsetTime = sunset.toLocaleTimeString();
    let timezone = data.timezone.split("/")[1];
    const detailsHTML = `
        <div class="location">
            <h6>나의 위치</h6>
            <h1>${timezone}</h1>
            </div>
        <div class="weather-details">
            <div class="box-container">
                <div class="weather-box">
                    <p>Humidity: ${humidity}%</p>
                    <p>Wind Speed: ${windSpeed} m/s</p>
                </div>
                <div class="weather-box">
                    <p>Sunrise: ${sunriseTime}</p>
                    <p>Sunset: ${sunsetTime}</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById("weather-board").innerHTML = detailsHTML;
};

// 페이지네이션
const paginationRender = () => {
    const paginationHTML = `
        <ul class="pagination">
            <li class="page-item ${currentPage === 1 ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(1)">1</a>
            </li>
            <li class="page-item ${currentPage === 2 ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(2)">2</a>
            </li>
        </ul>
    `;

    document.querySelector(".pagination").innerHTML = paginationHTML;
};

const changePage = (page) => {
    currentPage = page;
    console.log("page", currentPage)
    getWeather(); 
};

getWeather(); 
