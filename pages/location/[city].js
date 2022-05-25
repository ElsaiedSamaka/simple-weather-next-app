import moment from "moment-timezone";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import HourlyWeather from "../../components/HourlyWeather";
import SearchBox from "../../components/SearchBox";
import TodaysWeather from "../../components/TodaysWeather";
import cities from "../../lib/city.list.json";

export async function getServerSideProps(context) {
  const city = getCityId(context.params.city);

  if (!city) {
    return {
      notFound: true,
    };
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${city.coord.lat}&lon=${city.coord.lon}&appid=${process.env.API_KEY}&exclude=minutely&units=metric`
  );

  const data = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  const hourlyWeather = getHourlyWeather(data.hourly, data.timezone);

  const weeklyWeather = data.daily;

  return {
    props: {
      city: city,
      timezone: data.timezone,
      currentWeather: data.current,
      hourlyWeather: hourlyWeather,
      weeklyWeather: weeklyWeather,
    }, // will be passed to the page component as props
  };
}

const getCityId = (param) => {
  const cityParam = param.trim();
  // get the id of the city
  const splitCity = cityParam.split("-");
  const id = splitCity[splitCity.length - 1];

  if (!id) {
    return null;
  }

  const city = cities.find((city) => city.id.toString() == id);

  if (city) {
    return city;
  } else {
    return null;
  }
};

const getHourlyWeather = (hourlyData, timezone) => {
  const endOfDay = moment().tz(timezone).endOf("day").valueOf();
  const eodTimeStamp = Math.floor(endOfDay / 1000);

  const todaysData = hourlyData.filter((data) => data.dt < eodTimeStamp);

  return todaysData;
};

export default function City({
  city,
  weather,
  currentWeather,
  hourlyWeather,
  weeklyWeather,
  timezone,
}) {
  return (
    <div>
      <Head>
        <title>{city.name} Weather - Next Weather App</title>
      </Head>

      <div className='page-wrapper'>
        <div className='container'>
          <Link href='/'>
            <a className='back-link'>&larr; Home</a>
          </Link>
          <SearchBox />
          <TodaysWeather
            city={city}
            weather={weeklyWeather[0]}
            timezone={timezone}
          />
          <HourlyWeather hourlyWeather={hourlyWeather} timezone={timezone} />
        </div>
      </div>
    </div>
  );
}
