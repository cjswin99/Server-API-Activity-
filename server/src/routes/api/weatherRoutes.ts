import { Router, type Request, type Response } from 'express';
const router = Router();
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

interface modifiedWeatherData {
  city: string;
  date: string; 
  icon: string; 
  iconDescription: string; 
  tempF: number; 
  windSpeed: number;
  humidity: number;
}

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  console.log(req.body)
  // TODO: GET weather data from city name
  // TODO: save city to search history
  let city = req.body.cityName
  let cityLocation = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.API_KEY}`)
  let cityLocationData = await cityLocation.json()
  let weather = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${cityLocationData[0].lat}&lon=${cityLocationData[0].lon}&units=imperial&appid=${process.env.API_KEY}`)
  let weatherData = await weather.json()
  //const fs = require('fs'); //Ask about this
  fs.readFile("./db/db.json", "utf8", (err: any, data: any) => {
    if (err) {
      console.error(err);
      return;
    }
    let parseData = JSON.parse(data)
    parseData.push({name:city})

    fs.writeFile("./db/db.json", JSON.stringify(parseData), (err: any) => {
      if (err) {
        console.error(err);
        return;} 
      })
  });
  const weatherArray: modifiedWeatherData[] = weatherData.list.map((element: any) => {
    return {
      city: city,
      date: element.dt_txt,
      icon: element.weather[0].icon,
      iconDescription: element.weather[0].description,
      tempF: element.main.temp,
      windSpeed: element.wind.speed,
      humidity: element.main.humidity, 
    }
  })
  res.json(weatherArray)
});

// TODO: GET search history
router.get('/history', async (req: Request, res: Response) => {
  fs.readFile("./db/db.json", "utf8", (err: any, data: any) => {
    if (err) {
      console.error(err);
      res.status(500).json(err)
    } else {
      res.json(JSON.parse(data))
    }
    
  });
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {});

export default router;
