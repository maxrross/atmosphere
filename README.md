# Atmosphere - Environmental Health Dashboard

![Atmosphere Logo](public/favicon.ico)

Atmosphere is a comprehensive environmental health monitoring dashboard that provides real-time insights into air quality, UV exposure, and pollen levels across the globe. Built with modern web technologies and designed with a beautiful, intuitive interface, it helps users make informed decisions about their outdoor activities.

## 🌟 Features

### 🗺️ Interactive Global Map

- Beautiful hybrid satellite/terrain view with custom styling
- Global coverage with detailed street-level data
- Integrated Street View for ground-level exploration
- Air quality heatmap overlay option

### 📊 Environmental Metrics

- **Air Quality Index (AQI)**

  - Real-time AQI measurements
  - Detailed pollutant breakdowns (PM2.5, PM10, NO2, SO2, O3, CO)
  - Historical AQI data
  - Region-specific standards (US EPA / UAQI)

- **UV Index**

  - Current UV levels
  - Daily maximum forecasts
  - Safe exposure time recommendations
  - Risk level indicators

- **Pollen Levels**

  - Grass pollen concentrations
  - Tree pollen levels
  - Weed pollen measurements
  - Risk assessments for each type

- **🧠 Custom ML Model**
  - Custom-built spatiotemporal ML model for AQI forecasting
  - Deep neural network architecture with 7 input features
  - Trained on comprehensive EPA dataset (2000-2023)
  - Real-time predictions for:
    - O₃, CO, SO₂, NO₂ concentrations
    - Pollutant-specific AQI values
    - Peak hours and maximum values
    - Overall air quality risk assessment
  - Custom data preprocessing pipeline for geocoding and feature engineering
  - Check out our [ML Repository](https://github.com/blakerand/atmosphere-ml) to see how the model was built and [EPA Dataset](https://www.kaggle.com/datasets/guslovesmath/us-pollution-data-200-to-2022/data) to see the data used to train the model.

### 🏥 Health Recommendations

- Personalized activity guidelines
- Sensitive group warnings
- Best times for outdoor activities
- Real-time health risk assessments

### 🎯 Additional Features

- Location search with autocomplete
- Elevation data
- Responsive design
- Beautiful UI with glassmorphism effects
- Real-time data updates

## 🛠️ Technologies Used

### Frontend

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) - Beautiful icon set
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components

### Maps & Geolocation

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
  - Maps rendering
  - Street View
  - Places Autocomplete
  - Elevation Service
  - Geocoding Service

### Machine Learning & Data Processing

- [TensorFlow.js](https://www.tensorflow.org/js) - Deep learning model deployment
- Custom Neural Network Architecture
  - Multi-layer perceptron
  - Temporal feature engineering
  - Geospatial data integration
- Data Processing Pipeline
  - Census Batch Geocoding API
  - EPA historical data integration
  - Custom feature normalization
  - Cyclic time encoding

### Environmental Data APIs

- [Google Air Quality API](https://developers.google.com/maps/documentation/air-quality)
  - Real-time air quality data
  - Air quality heatmap tiles
- [OpenUV API](https://www.openuv.io/)
  - UV index data
  - Safe exposure times
- [Tomorrow.io](https://www.tomorrow.io/)
  - Pollen forecasts
  - Additional weather metrics

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/atmosphere.git
   cd atmosphere
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:

   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   OPENUV_API_KEY=your_openuv_key
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Design Philosophy

Atmosphere was designed with these key principles:

- **Intuitive**: Easy to understand and navigate
- **Informative**: Comprehensive data presented clearly
- **Beautiful**: Modern UI with attention to detail
- **Responsive**: Works seamlessly on all devices
- **Accessible**: Built with web accessibility in mind

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Maps Platform for their comprehensive mapping solutions
- OpenUV for UV index data
- Tomorrow.io for pollen data
- The open-source community for the amazing tools and libraries

## 🏆 Hackathon Context

This project was developed for Swamphacks with the goal of creating a comprehensive environmental health monitoring solution. It addresses the growing need for accessible, real-time environmental data to help people make informed decisions about their outdoor activities and health precautions.

### Problem Statement

With increasing environmental concerns and health consciousness, there's a need for a unified platform that provides comprehensive environmental health data in an accessible and actionable format.

### Solution

Atmosphere combines multiple environmental health metrics into a single, intuitive interface, making it easy for users to:

- Monitor local environmental conditions
- Plan outdoor activities safely
- Take necessary health precautions
- Make informed decisions about their daily routines

### Impact

- Helps sensitive groups (elderly, children, those with respiratory conditions) stay safe
- Enables better planning of outdoor activities
- Raises awareness about environmental health factors
- Provides actionable health recommendations

### Future Enhancements

- Mobile app development
- Push notifications for environmental alerts
- Personal health profile integration
- Historical data analysis and trends
- Community features and sharing capabilities
