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

    // Fetch pollen data from Google Pollen API
    const pollenResponse = await fetch(
      `https://pollen.googleapis.com/v1/forecast:lookup?key=${apiKey}&location.longitude=${lng}&location.latitude=${lat}&days=1&languageCode=en`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
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
    let pollenData = null

    if (airQualityResponse.ok) {
      airQualityData = await airQualityResponse.json()
    } else {
      const errorText = await airQualityResponse.text()
      console.error('Air Quality API Error:', errorText)
    }

    if (pollenResponse.ok) {
      const pollenResult = await pollenResponse.json()
      const pollenTypes = pollenResult.dailyInfo[0]?.pollenTypeInfo || []
      
      const getPollenInfo = (code: string) => {
        const info = pollenTypes.find(p => p.code === code)
        if (!info) {
          return {
            index: 0,
            risk: "Unknown",
            inSeason: false,
            recommendations: []
          }
        }
        
        if (!info.inSeason) {
          return {
            index: 0,
            risk: "Out of Season",
            inSeason: false,
            recommendations: []
          }
        }

        return {
          index: info.indexInfo?.value ?? 0,
          risk: info.indexInfo?.category ?? "Unknown",
          inSeason: true,
          recommendations: info.healthRecommendations ?? []
        }
      }

      pollenData = {
        grass: getPollenInfo('GRASS'),
        tree: getPollenInfo('TREE'),
        weed: getPollenInfo('WEED')
      }
    } else {
      const errorText = await pollenResponse.text()
      console.error('Pollen API Error Status:', pollenResponse.status)
      console.error('Pollen API Error:', errorText)
    }

    return NextResponse.json({ 
      airQualityData, 
      historyData: historyResults.filter(Boolean),
      pollenData 
    })
  } catch (error) {
    console.error('Error fetching location data:', error)
    return NextResponse.json({ error: 'Failed to fetch location data' }, { status: 500 })
  }
} 