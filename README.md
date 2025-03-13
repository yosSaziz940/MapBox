# MapBox Project

## Overview
This project is a web application built with React and Next.js, utilizing Mapbox for interactive maps. The app allows users to search for locations, and highlight the target building.

## Features
- **Mapbox Integration**: Displays interactive maps.
- **Geocoding**: Converts addresses into coordinates.
- **Building Highlighting**: Dynamically highlights buildings based on search results.


## Installation
### Prerequisites
- Node.js (>= 14.x recommended)
- npm or yarn

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/MapBox-main.git
   cd MapBox-main
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open the application in a browser at `http://localhost:3000`.

## Configuration
- Update the `.env` file (if required) with your Mapbox API key:
  ```sh
  MAPBOX_TOKEN=your_mapbox_access_token
  ```

## Project Structure
```
MapBox-main/
├── app/
│   ├── layout.js       # Main layout component
│   ├── page.js         # Main page component
├── styles/
│   ├── globals.css     # Global styles
├── package.json        # Project metadata and dependencies
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md           # Project documentation
```

## Usage
1. Search for an address.
2. The map will center on the location and highlight the nearest building.



