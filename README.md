# Beachside Racetrack Real-Time System

## Overview

## Table of Contents

- **[Getting Started](#getting-started)**
- **[Environment Variables](#environment-variables)**
- **[Exposing Interfaces with LocalTunnel](#exposing-interfaces-with-localtunnel)**
  - **[Setting Up LocalTunnel](#setting-up-localtunnel)**
  - **[Start the Server](#start-the-server)**
  - **[Access Public URL](#access-public-url)**
- **[User Interfaces](#user-interfaces)**
  - **[Front Desk Interface](#front-desk-interface)**
  - **[Race Control Interface](#race-control-interface)**
  - **[Lap-line Tracker Interface](#lap-line-tracker-interface)**
  - **[Leader Board Interface](#leader-board-interface)**
  - **[Next Race Interface](#next-race-interface)**
  - **[Race Countdown Interface](#race-countdown-interface)**
  - **[Race Flag Interface](#race-flag-interface)**
- **[Security](#security)**
- **[Persisting Data](#persisting-data)**
   
## Getting Started
1. Clone the repository:

`git clone https://gitea.koodsisu.fi/denyshorban/racetrack.git `

2. Install Dependencies:

Ensure you have Node.js installed. Navigate to the project directory and run:

`npm install`

### Environment Variables
You must set the following environment variables before starting the server. The variables are stored in the **.env** file in the root of the project. These keys are used to secure access to different employee interfaces.

**RECEPTIONIST_KEY:** Access key for the Front Desk Interface.  
**OBSERVER_KEY:** Access key for the Lap-line Tracker Interface.    
**SAFETY_KEY:** Access key for the Race Control Interface.

### Exposing Interfaces with LocalTunnel
To make the user interfaces accessible on different networks, we use LocalTunnel. LocalTunnel creates a public URL for your local server, allowing you to share it with others.

####  Setting Up LocalTunnel
LocalTunnel is already included as a dependency and configured in the project. Follow these steps to use it:

#### Start the Server:
- **For production mode:**

`npm start`

This command starts the server in production mode and also launches LocalTunnel to expose the interfaces.

- **For development mode (with a 1-minute race timer):**

`npm run dev`

This command starts the server in development mode (with a 1-minute race timer) and launches LocalTunnel.

- **If you prefer to run the server locally without using LocalTunnel, use the following command:**

`node server.js`

####  Access Public URL:

After running the server, LocalTunnel will provide a public URL.
This URL will be logged in the terminal and can be used to access the interfaces remotely.
It typically looks like https://your-subdomain.loca.lt. Follow instructions on the page to activate URL.

### Access the Interfaces:
Open your web browser and navigate to the appropriate URLs for each interface (see [User Interfaces](#user-interfaces)).
If your using LocalTunnel use the public URL to access different interfaces by appending their routes.

### User Interfaces
Each user interface serves a specific role in managing the racetrack operations and informing participants. Here’s a guide to each interface:

#### Front Desk Interface
- **Route:** /front-desk  
- **Access Key:** receptionist_key
- **Description:**
This interface is used by the receptionist to configure race sessions, manage drivers, and assign cars.   
**It allows the receptionist to:**
  - View a list of upcoming race sessions.
  - Add, remove, or edit race sessions and drivers.
  - Assign drivers to cars.

**Usage:**
- Enter the receptionist access key.
- Use the provided controls to manage race sessions and drivers.



#### Race Control Interface
- **Route:** /race-control
- **Access Key:** safety_key
- **Description:** The Safety Official uses this interface to control the race, change race modes, and declare the start and end of races.
**It allows Safety Official to:**
  - Start the race.
  - Change race modes (Safe, Hazard, Danger, Finish).
  - End the race session.

**Usage:**
- Enter the safety official access key.
- Use the buttons to control race operations.


##### Lap-line Tracker Interface
- **Route:** /lap-line-tracker
- **Access Key:** observer_key
- **Description:** The Lap-line Observer records lap times for each car. The interface displays large buttons for each car, which are pressed as cars cross the lap line.
- **This interface:**
  - Shows buttons with car numbers.
  - Disables buttons once the race is ended.

**Usage:**
- Enter the observer access key.
- Press the car number buttons as cars cross the lap line.


##### Leader Board Interface
- **Route:** /leader-board
- **Access Key:** None
- **Description:** This public interface displays real-time lap times, driver rankings, and race information for spectators.
- **It shows:**
  - A list of drivers and cars for the current race.
  - The fastest lap times.
  - Remaining race time.
  - Current race mode.

**Usage:**
- Access the interface via /leader-board or from the main page.


##### Next Race Interface
- **Route:** /next-race
- **Access Key:** None
- **Description:** Displays the upcoming race session details for drivers.
- **It shows:**
  - The list of drivers for the next race.
  - Assigned car numbers.
  - Access the interface via /next-race.
  - Drivers can view their race details.

**Usage:**
- Access the interface via /next-race or from the main page.


#### Race Countdown Interface
- **Route:** /race-countdown
- **Access Key:** None
- **Description:** Shows a countdown timer for the race session, viewable by drivers.
- **It shows**:
  - Displays the remaining time.

**Usage:**
- Access the interface via /race-countdown or from the main page.


#### Race Flag Interface
- **Route: /race-flags**
- **Access Key:** None
- **Description:** Displays the current race mode using flag colors on screens around the track.
- **It Shows the flag corresponding to the race mode:**
  - Green (Safe)
  - Yellow (Hazard)
  - Red (Danger)
  - Chequered (Finish)


### Security
Employee interfaces are protected by access keys. Users must enter the correct access key to configure races, input lap times, or issue commands. If an incorrect access key is entered, a 500ms delay is introduced, and an error message is displayed.

### Persisting Data
The system now persists data using an SQLite database. The database schema includes tables for race sessions, drivers, laps, ongoing races, last finished races, race status updates, and the leaderboard.
This ensures that all race data, driver assignments, lap times, and race status updates are stored and can be reinstated when the server restarts.
The database is initialized in **racetrack.db** and is managed through the sqlite3 library.