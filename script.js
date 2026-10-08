const apiKey = "da9706a3b98075dfb4869685fe0cec4d";
const currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&lang=uz&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&lang=uz&q=";

const searchBox = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const errorMsg = document.getElementById("error-msg");
const weatherInfo = document.getElementById("weather-info");
const forecastList = document.getElementById("forecast-list");

// Oy va Kun nomlari (O'zbekcha)
const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const days = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

function formatDate(dateObj) {
    const dayName = days[dateObj.getDay()];
    const day = dateObj.getDate();
    const monthName = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${dayName}, ${day} ${monthName}, ${year}`;
}

async function checkWeather(city) {
    if (!city.trim()) return;

    try {
        // 1. Joriy Ob-Havo olish
        const resCurrent = await fetch(currentWeatherUrl + encodeURIComponent(city) + `&appid=${apiKey}`);
        
        if (resCurrent.status === 404) {
            errorMsg.style.display = "block";
            weatherInfo.style.opacity = "0.2";
            return;
        }

        const dataCurrent = await resCurrent.json();

        // bugungi sanani yangilash
        document.getElementById("current-date").innerText = formatDate(new Date());
        
        document.getElementById("city-name").innerText = dataCurrent.name;
        document.getElementById("temp").innerText = Math.round(dataCurrent.main.temp);
        document.getElementById("humidity").innerText = dataCurrent.main.humidity + "%";
        document.getElementById("wind-speed").innerText = dataCurrent.wind.speed + " m/s";
        document.getElementById("pressure").innerText = dataCurrent.main.pressure + " hPa";
        document.getElementById("feels-like").innerText = Math.round(dataCurrent.main.feels_like) + "°C";
        document.getElementById("weather-desc").innerText = dataCurrent.weather[0].description;
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${dataCurrent.weather[0].icon}@4x.png`;

        // 2. Kunlik Prognozlarni olish (5 Kunlik / 3 Soatlik oraliq)
        const resForecast = await fetch(forecastUrl + encodeURIComponent(city) + `&appid=${apiKey}`);
        const dataForecast = await resForecast.json();

        renderForecast(dataForecast.list);

        errorMsg.style.display = "none";
        weatherInfo.style.opacity = "1";

    } catch (error) {
        console.error("Xatolik:", error);
    }
}

// 5 Kunlik bashorat kartochkalarini yaratish
function renderForecast(list) {
    forecastList.innerHTML = "";
    
    // API har 3 soatlik ma'lumot beradi. Har bir kundan soat 12:00 dagi ma'lumotni saralab olamiz (kunlik ko'rsatkich sifatida)
    const dailyData = list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach(item => {
        const dateObj = new Date(item.dt * 1000);
        const dayName = days[dateObj.getDay()];
        const formattedShortDate = `${dateObj.getDate()} ${months[dateObj.getMonth()].substring(0, 3)}`;

        const itemHtml = `
            <div class="forecast-item">
                <div class="forecast-day-group">
                    <span class="forecast-day">${dayName}</span>
                    <span class="forecast-date">${formattedShortDate}</span>
                </div>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="icon">
                <span class="forecast-temp">${Math.round(item.main.temp)}°C</span>
            </div>
        `;
        forecastList.innerHTML += itemHtml;
    });
}

// Qidiruv voqealari
searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        checkWeather(searchBox.value);
        searchBox.blur();
    }
});

// Boshlang'ich shahar
checkWeather("Tashkent");