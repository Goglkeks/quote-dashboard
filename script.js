//импорт дом и цитат
import { quotes } from './JS/quotes.js'
import { 
  quoteText, 

  quoteAuthor, 

  newQuoteBtn, 

  saveQuoteBtn,

  copyQuoteBtn,

  favoritesList,

  weatherDiv,

  cityInput,
  
  cityBtn 
} from './JS/dom.js'

//=======избранное=======

// Ключ localStorage
const STORAGE_KEY = 'favorite-quotes'

// Загружаем избранное из localStorage
let favoriteQuotes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

// Функция сохранения
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteQuotes))
}

// Функция отображения избранного
function renderFavorites() {
  // чищим список
  favoritesList.innerHTML = ''
  
  // Если избранное пустое
  if (favoriteQuotes.length === 0) {
    favoritesList.innerHTML = '<li>Пока ничего нет</li>'
    return
  }
  
  // список цитат
  favoriteQuotes.forEach((quote, index) => {
    const li = document.createElement('li')
    li.innerHTML = `
      <span>"${quote.text}" — ${quote.author}</span>
      <button class="delete-favorite" data-index="${index}">❌</button>
    `
    favoritesList.appendChild(li)
  })
  
  // Добавляем обработчики на кнопки удаления
  document.querySelectorAll('.delete-favorite').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.dataset.index
      removeFromFavorites(index)
    })
  })
}

// Функция добавления в избранное
function addToFavorites(quote) {
  // Проверяем, есть ли уже такая цитата
  const isDuplicate = favoriteQuotes.some(q => 
    q.text === quote.text && q.author === quote.author
  )
  
  if (isDuplicate) {
    alert('❌ Эта цитата уже в избранном')
    return
  }
  
  // Добавляем
  favoriteQuotes.push(quote)
  saveToStorage()
  renderFavorites()
  console.log('⭐ Добавлено в избранное:', quote)
}

// Функция удаления из избранного
function removeFromFavorites(index) {
  const removed = favoriteQuotes.splice(index, 1)
  saveToStorage()
  renderFavorites()
  console.log('🗑 Удалено из избранного:', removed[0])
}

//=========цитатки=======

// функция для рандома цитат
function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex]
}

//отображение первой цитаты при загрузке
const firstQuote = quotes[0]
quoteText.textContent = `"${firstQuote.text}"`
quoteAuthor.textContent = `— ${firstQuote.author}`

function displayQuote() {
  const randomQuote = getRandomQuote()
  quoteText.textContent = `"${randomQuote.text}"`
  quoteAuthor.textContent = `— ${randomQuote.author}`
  
  //отладка
  console.log('Цитата на рандом', randomQuote)
}

//======ивентики======

//клик новой цитаты
newQuoteBtn.addEventListener('click', displayQuote)

saveQuoteBtn.addEventListener('click', () => {
  // Берем эту
  const currentQuote = {
    text: quoteText.textContent.replace(/"/g, ''),
    author: quoteAuthor.textContent.replace('— ', '')
  }
  addToFavorites(currentQuote)
})

function copyQuoteToClipboard() {
  // Собираем циттату
  const text = quoteText.textContent
  const author = quoteAuthor.textContent
  const fullQuote = `${text} ${author}`
  
  // Копируем в буфер обмена
  navigator.clipboard.writeText(fullQuote).then(() => {
    // анимка
    const originalText = copyQuoteBtn.textContent
    copyQuoteBtn.textContent = '✅ скопировано!'
    copyQuoteBtn.style.background = '#48bb78'
    
    // и бэкаем обратно кнопку
    setTimeout(() => {
      copyQuoteBtn.textContent = originalText
      copyQuoteBtn.style.background = ''
    }, 2000)
    
    console.log('📋 Цитата скопирована:', fullQuote)
  })
}

// Вешаем событие на кнопку копирования
copyQuoteBtn.addEventListener('click', copyQuoteToClipboard)

//======рендеры========

//рендер при загрузке
renderFavorites()

console.log('скрипт цитат робит')

window.debugFavorites = favoriteQuotes
window.debugRender = renderFavorites

//рендер

window.favs = favoriteQuotes
window.forceRender = () => {
  console.log('🔄 Принудительный рендер')
  renderFavorites()
}

//погода

// Функция получения названия города по координатам
async function getCityName(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ru`)
    const data = await response.json()
    return data.address.city || data.address.town || data.address.village || 'Неизвестно'
  } catch {
    return 'Ваше местоположение'
  }
}

// Эмодзи для погоды
function getWeatherEmoji(code) {
  if (code === 0) return '☀️'
  if (code === 1 || code === 2) return '⛅'
  if (code === 3) return '☁️'
  if (code >= 45 && code <= 49) return '🌫'
  if (code >= 51 && code <= 55) return '🌧'
  if (code >= 61 && code <= 65) return '☔'
  if (code >= 71 && code <= 75) return '❄️'
  if (code >= 95) return '⛈'
  return '🌡'
}

// Описание погоды
function getWeatherDescription(code) {
  if (code === 0) return 'Ясно'
  if (code === 1 || code === 2) return 'Облачно'
  if (code === 3) return 'Пасмурно'
  if (code >= 45 && code <= 49) return 'Туман'
  if (code >= 51 && code <= 55) return 'Морось'
  if (code >= 61 && code <= 65) return 'Дождь'
  if (code >= 71 && code <= 75) return 'Снег'
  if (code >= 95) return 'Гроза'
  return 'Разное'
}

// Функция для получения погоды по координатам (НОВАЯ)
function getWeatherByCoords(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&windspeed_unit=ms&timezone=auto`
  
  weatherDiv.innerHTML = '⏳ Загружаем погоду...'
  
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Ошибка загрузки')
      return response.json()
    })
    .then(data => {
      const temp = Math.round(data.current_weather.temperature)
      const windSpeed = data.current_weather.windspeed
      const weatherCode = data.current_weather.weathercode
      const humidity = data.hourly.relativehumidity_2m[0]
      
      // Получаем название города и показываем
      getCityName(lat, lon).then(city => {
        weatherDiv.innerHTML = `
          <div style="background: linear-gradient(145deg, #e6f0fa, #d4e4f5); padding: 20px; border-radius: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <p style="font-size: 2.5rem; margin: 0; font-weight: bold;">${temp}°C</p>
                <p style="margin: 5px 0; font-size: 1.2rem;">📍 ${city}</p>
              </div>
              <div style="font-size: 4rem;">${getWeatherEmoji(weatherCode)}</div>
            </div>
            <p style="margin: 10px 0 5px; font-size: 1.2rem;">${getWeatherDescription(weatherCode)}</p>
            <div style="display: flex; gap: 20px; margin-top: 15px;">
              <p style="margin: 0;">💧 ${humidity}%</p>
              <p style="margin: 0;">🌬 ${windSpeed} м/с</p>
            </div>
          </div>
        `
      })
    })
    .catch(error => {
      weatherDiv.innerHTML = `❌ Ошибка: ${error.message}`
    })
}

// Функция для поиска погоды по названию города
function getWeatherByCity(city) {
  if (!city.trim()) {
    alert('Введите город')
    return
  }
  
  weatherDiv.innerHTML = '⏳ Ищем город...'
  
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}&limit=1&accept-language=ru`)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) throw new Error('Город не найден')
      
      const lat = data[0].lat
      const lon = data[0].lon
      const cityName = data[0].display_name.split(',')[0]
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&windspeed_unit=ms&timezone=auto`
      
      return fetch(url)
        .then(res => res.json())
        .then(weatherData => {
          const temp = Math.round(weatherData.current_weather.temperature)
          const windSpeed = weatherData.current_weather.windspeed
          const weatherCode = weatherData.current_weather.weathercode
          const humidity = weatherData.hourly.relativehumidity_2m[0]
          
          weatherDiv.innerHTML = `
            <div style="background: linear-gradient(145deg, #e6f0fa, #d4e4f5); padding: 20px; border-radius: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <p style="font-size: 2.5rem; margin: 0; font-weight: bold;">${temp}°C</p>
                  <p style="margin: 5px 0; font-size: 1.2rem;">📍 ${cityName}</p>
                </div>
                <div style="font-size: 4rem;">${getWeatherEmoji(weatherCode)}</div>
              </div>
              <p style="margin: 10px 0 5px; font-size: 1.2rem;">${getWeatherDescription(weatherCode)}</p>
              <div style="display: flex; gap: 20px; margin-top: 15px;">
                <p style="margin: 0;">💧 ${humidity}%</p>
                <p style="margin: 0;">🌬 ${windSpeed} м/с</p>
              </div>
            </div>
          `
        })
    })
    .catch(error => {
      weatherDiv.innerHTML = `❌ ${error.message}`
    })
}

// Получаем местоположение
function getLocationAndWeather() {
  weatherDiv.innerHTML = '⏳ Определяем местоположение...'
  
  if (!navigator.geolocation) {
    weatherDiv.innerHTML = '❌ Геолокация не поддерживается'
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lon = position.coords.longitude
      console.log('Координаты:', lat, lon)
      getWeatherByCoords(lat, lon)
    },
    (error) => {
      weatherDiv.innerHTML = '❌ Не удалось определить местоположение. Введите город вручную.'
      console.log('Ошибка геолокации:', error)
    }
  )
}

// События для ручного ввода
cityBtn.addEventListener('click', () => {
  getWeatherByCity(cityInput.value)
})

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    getWeatherByCity(cityInput.value)
  }
})

// Запускаем погоду
getLocationAndWeather()