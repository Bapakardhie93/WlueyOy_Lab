# Wlueoy

Wlueoy is a private, on-device menstrual cycle journal built with Expo, React Native, TypeScript, and Expo Router. It records period dates, daily flow, symptoms, mood, and notes; estimates cycle timing from recorded history; and summarizes trends without diagnosing or offering contraception advice.

## Run the app

```bash
npm install
npx expo start
```

## Main screens

- **Today**: current cycle day (when available), a qualified next-period estimate, check-in, recent entries, and a public quote card.
- **Calendar**: month navigation, actual entries, estimated period starts, and date-specific logging.
- **History**: period records and daily check-ins with edit/delete flows.
- **Insights**: cycle-length chart, averages, observed variation, and symptom counts based on saved entries.

## Data and privacy

Cycle data is saved locally with AsyncStorage and is not included in network requests. AsyncStorage is persistent but unencrypted; avoid using the app on a shared or untrusted device. The only external request fetches a generic public quote from `https://dummyjson.com/quotes/random`. A missing network connection shows a retryable error and does not affect cycle tracking.

## Module 3 learning objectives

The quote service demonstrates an external GET request, a typed `CareQuote` interface, async/await, a custom Promise with `resolve`/`reject`, timeout and response validation, plus `.then()`/`.catch()` handling. User cycle records remain local and do not depend on the practice API.
