# System Architecture

## Overview

Hop In is a three-tier web application connecting **Passengers** and **Drivers** for intercity travel across Albania. The system is split into a React.js frontend, a Node.js/Express.js backend, and a PostgreSQL database.

---

## End-to-End Request Flow

**1. Passenger searches for a trip (Frontend)**  
The passenger enters an origin city, destination city, and travel date on the Trip Search page. The React frontend sends a `GET /api/trips?origin=X&destination=Y&date=Z` request to the backend, attaching the passenger's JWT token in the Authorization header.

**2. Backend validates the request**  
The Express.js middleware verifies the JWT token and confirms the user has the `passenger` role. The TripService constructs a parameterized SQL query to prevent injection attacks.

**3. Backend queries the Database**  
PostgreSQL queries the `Trips` table joined with `Pickup_Points` and `Users`, returning only trips where `status = 'active'` and `available_seats > 0` that match the search filters.

**4. Backend sends results back to the Frontend**  
The API returns a 200 OK response with a JSON array of matching trips, sorted by `departure_time ASC`. The React frontend renders them as trip cards showing driver name, rating, seats, pickup points, and price.

**5. Passenger selects a trip and books a seat (Frontend)**  
The passenger selects a trip, chooses a preferred pickup point, and clicks **Book Seat**. The frontend sends a `POST /api/bookings` request with `trip_id` and `pickup_id`.

**6. Backend validates and stores the booking**  
The backend checks that `available_seats > 0` and that the passenger has not already booked this trip. If valid, it inserts a new record into the `Bookings` table with `status = 'pending'` and inserts a notification for the driver into the `Notifications` table.

**7. Driver approves the booking (Frontend → Backend → Database)**  
The driver sees the pending request on their dashboard and approves it. The backend updates the booking to `status = 'confirmed'`, decrements `available_seats` by 1 in the `Trips` table, and sends a confirmation notification to the passenger.

**8. Trip completes and ratings are submitted**  
After the departure date passes, the system marks the trip as `completed`. Both the driver and passenger can then submit a star rating (1–5) and a written review, stored in the `Ratings` table and reflected in each user's `average_rating`.


Website/Program used to create the diagrams: ["Draw-Io"](https://app.diagrams.net/)
