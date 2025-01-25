import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { lat, lng } = await request.json()
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    // Air Quality API request for current conditions
    const airQualityResponse = await fetch(
      `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          universalAqi: true,
          location: {
            latitude: lat,
            longitude: lng,
          },
          extraComputations: [
            "HEALTH_RECOMMENDATIONS",
            "POLLUTANT_CONCENTRATION",
            "LOCAL_AQI",
            "POLLUTANT_ADDITIONAL_INFO"
          ],
          languageCode: "en"
        }),
      }
    )

    // Calculate timestamps for specific points in time
    const now = new Date()
    const timePoints = [
      { label: 'Yesterday', date: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      { label: '2 days ago', date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
      { label: '1 week ago', date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      { label: '2 weeks ago', date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
      { label: '1 month ago', date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    ]

    // Fetch historical data for each time point
    const historyPromises = timePoints.map(({ date }) => 
      fetch(`https://airquality.googleapis.com/v1/history:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateTime: date.toISOString(),
          location: {
            latitude: lat,
            longitude: lng,
          },
          languageCode: "en"
        }),
      })
    )

    const historyResponses = await Promise.all(historyPromises)
    const historyResults = await Promise.all(
      historyResponses.map(async (response, index) => {
        if (response.ok) {
          const data = await response.json()
          return {
            label: timePoints[index].label,
            ...data.hoursInfo[0]
          }
        }
        console.error(`History API Error for ${timePoints[index].label}:`, await response.text())
        return null
      })
    )

    let airQualityData = null

    if (airQualityResponse.ok) {
      airQualityData = await airQualityResponse.json()
    } else {
      const errorText = await airQualityResponse.text()
      console.error('Air Quality API Error:', errorText)
    }

    // For now, return mock pollen data since the API is not working
    const mockPollenData = {
      grassIndex: Math.floor(Math.random() * 6),
      treeIndex: Math.floor(Math.random() * 6),
      weedIndex: Math.floor(Math.random() * 6)
    }

    return NextResponse.json({ 
      airQualityData, 
      historyData: historyResults.filter(Boolean),
      pollenData: mockPollenData 
    })
  } catch (error) {
    console.error('Error fetching location data:', error)
    return NextResponse.json({ error: 'Failed to fetch location data' }, { status: 500 })
  }
} 