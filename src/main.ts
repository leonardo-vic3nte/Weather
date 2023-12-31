import { displayDateTime } from "./components/CurrentDate/currentDate";
import { renderForecast } from "./components/Forecast/forecast";
import { renderGreetings } from "./components/Greetings/greetings";
import { renderHeroSection } from "./components/HeroSection/heroSection";
import { innitLocationSearch as innitSearch } from "./components/SearchBar/searchBar";
import { renderBackgroundImage, removeLoading, displayErrorPage } from "./ts/helperFunctions";
import { getWeatherByGeolocation, getWeatherByIp, getWeatherData } from "./ts/weatherApiFunctions";
import { WeatherData } from "./ts/weatherApiInterfaces";

export let currentDateTime: string;

// Exported to be used on the searchbar
export async function renderPage(data: WeatherData): Promise<void> {
    await renderBackgroundImage(data);
    await renderHeroSection(data);
    renderGreetings(data);
    displayDateTime(data);
    renderForecast(data);
    innitSearch();
    removeLoading();
}

getWeatherByIp()
    .then((data) => {
        renderPage(data);
    })
    .catch((err) => {
        console.error(err);

        getWeatherData("Fortaleza")
            .then((data) => {
                renderPage(data);
            })
            .catch((err) => {
                console.error(err);
                removeLoading();
                displayErrorPage();
            });
    });

getWeatherByGeolocation()
    .then((data) => {
        renderPage(data);
    })
    .catch((err) => console.error(err));
