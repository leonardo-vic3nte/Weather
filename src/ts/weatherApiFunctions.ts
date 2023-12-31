import { WeatherData, ApiError } from "./weatherApiInterfaces";
import { ApiInternalError, GenericError, GeolocationRequestError, LocationNotFound } from "./errorFunctions";
import { requestGeolocation, sleep } from "./helperFunctions";

const KEY = "fdc857fd0eaa40b6a1925541230509";
const API_URL = "https://api.weatherapi.com/v1/forecast.json";

export async function getWeatherData(location: string): Promise<WeatherData> {
    const MAX_TRIES = 3;
    for (let i = 0; i < MAX_TRIES; i++) {
        try {
            const request = await fetch(`${API_URL}?key=${KEY}&days=3&q=${location}`);

            if (request.ok) {
                const sucessJson: WeatherData = await request.json();
                return sucessJson;
            }

            const errorJson: ApiError = await request.json();
            switch (errorJson.error.code) {
                case 1006:
                    throw new LocationNotFound(location);
                case 9999:
                    throw new ApiInternalError();
                default:
                    throw new GenericError();
            }
        } catch (error) {
            // If i === 2 skips the sleep
            if (error instanceof LocationNotFound || error instanceof ApiInternalError || i === 2) {
                throw error;
            }
            await sleep(500);
        }
    }

    // This is only here because of typescript noImplicitReturns rule
    throw new GenericError();
}

export async function getWeatherByIp(): Promise<WeatherData> {
    return await getWeatherData("auto:ip");
}

export async function getWeatherByGeolocation(): Promise<WeatherData> {
    try {
        /* I can safely cast the type to GeolocationPosition since any GeolocationPositionError
        would throw */
        const geolocation = (await requestGeolocation()) as GeolocationPosition;

        const [latitude, longitude] = [geolocation.coords.latitude, geolocation.coords.longitude];

        return await getWeatherData(`${latitude},${longitude}`);
    } catch (err) {
        if (err instanceof GeolocationPositionError) {
            throw new GeolocationRequestError(err);
        }
        throw err;
    }
}
