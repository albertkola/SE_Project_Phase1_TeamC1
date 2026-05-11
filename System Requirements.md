# System Requirements

## Project Title: Intercity Carpooling System with Pickup Points in Albania (Hop In)



## 1. Chosen Development Model

**Model:** Agile (Scrum)

**Justification:**
The Agile model was selected because the Hop In platform involves evolving requirements, multiple interconnected modules (authentication, trip management, booking, ratings), and a small cross-functional team. Agile allows us to develop and deliver the system in iterative sprints, get early feedback, and adapt quickly to changes. Its flexibility suits a student project where requirements may be refined as development progresses, and its sprint-based structure keeps the team accountable to deadlines.

---

## 2. User Requirements

### a. Stakeholders

| Stakeholder | Role | Interest |
|---|---|---|
| **Drivers** | End-users offering rides | Post trips, manage bookings, earn cost-sharing |
| **Passengers** | End-users seeking rides | Find and book affordable intercity travel |
| **Administrators** | Platform managers | Ensure platform integrity, manage users and trips |
| **Development Team** | Builders and maintainers | Deliver a functional, maintainable system |


### b. User Stories

1. As a **passenger**, I want to register an account so that I can search for and book trips.
2. As a **driver**, I want to register and select the driver role so that I can offer seats on my intercity trips.
3. As a **driver**, I want to post a trip with a departure city, destination, date, time, price per seat, available seats, and pickup points so that passengers can find and join my ride.
4. As a **passenger**, I want to search for available trips by origin, destination, and date so that I can find a suitable ride quickly.
5. As a **passenger**, I want to filter search results by price, available seats, and pickup point so that I can choose the most convenient option.
6. As a **passenger**, I want to book a seat and select my preferred pickup point so that I can secure my travel arrangements.
7. As a **driver**, I want to approve or reject booking requests so that I can decide who travels with me.
8. As a **passenger**, I want to receive in-app notifications when my booking is confirmed or rejected so that I stay informed about my travel status.
9. As a **passenger**, I want to cancel my booking before departure so that I can free up the seat if my plans change.
10. As a **driver**, I want to cancel an upcoming trip and have all booked passengers notified automatically so that no one is left without information.
11. As a **passenger**, I want to rate and review a driver after the trip is completed so that other passengers can make informed decisions.
12. As a **driver**, I want to rate a passenger after the trip so that other drivers can assess their reliability.
13. As a **user (driver or passenger)**, I want to view my trip and booking history so that I can keep track of my past and upcoming travel.
14. As an **admin**, I want to view all registered users and their activity so that I can monitor platform usage.
15. As an **admin**, I want to deactivate or remove accounts that violate platform policies so that the community remains safe and trustworthy.

---

## 3. Functional Requirements

### a. Description

**Authentication & User Management**
- FR-01: The system shall allow new users to register with their full name, email address, phone number, password, and role (driver or passenger).
- FR-02: The system shall validate that the email address is unique during registration.
- FR-03: The system shall authenticate users via email and password on login.
- FR-04: The system shall issue a JWT (JSON Web Token) upon successful login to manage user sessions.
- FR-05: The system shall allow users to log out, invalidating their session token.
- FR-06: The system shall allow users to reset their password by receiving a link to their registered email.
- FR-07: The system shall allow users to update their profile information (name, phone number, profile picture).

**Trip Management**
- FR-08: The system shall allow drivers to create a trip by specifying: departure city, destination city, date, departure time, number of available seats, price per seat, and at least one pickup point.
- FR-09: The system shall allow drivers to edit trip details before any bookings are made.
- FR-10: The system shall allow drivers to cancel a trip at any time, triggering notifications to all confirmed passengers.
- FR-11: The system shall automatically mark trips as completed after the departure date and time have passed.

**Trip Search & Discovery**
- FR-12: The system shall allow passengers to search for trips by origin city, destination city, and travel date.
- FR-13: The system shall allow passengers to filter search results by maximum price, number of available seats, and preferred pickup point.
- FR-14: The system shall display search results sorted by departure time in ascending order by default.
- FR-15: The system shall show trip details including driver name, average rating, available seats, pickup points, and price.

**Booking Management**
- FR-16: The system shall allow passengers to book a seat on a trip and select their preferred pickup point.
- FR-17: The system shall prevent a passenger from booking more seats than are available on a trip.
- FR-18: The system shall prevent a passenger from booking the same trip twice.
- FR-19: The system shall send the driver a notification when a new booking request is received.
- FR-20: The system shall allow drivers to approve or reject incoming booking requests.
- FR-21: The system shall reduce the available seat count when a booking is approved.
- FR-22: The system shall notify the passenger when their booking request is approved or rejected.
- FR-23: The system shall allow passengers to cancel their booking before the trip departure time.
- FR-24: The system shall restore the available seat count when a booking is cancelled.

**Ratings & Reviews**
- FR-25: The system shall allow a passenger to submit a star rating (1–5) and a written review for a driver after a trip is marked as completed.
- FR-26: The system shall allow a driver to submit a star rating (1–5) and a written review for a passenger after a trip is marked as completed.
- FR-27: The system shall display the average rating and number of reviews on each user's profile.

**Notifications & History**
- FR-28: The system shall display in-app notifications for booking confirmations, rejections, trip cancellations, and upcoming trip reminders.
- FR-29: The system shall provide each user with a trip and booking history page showing past and upcoming activity.

**Admin Panel**
- FR-30: The system shall provide an admin dashboard displaying platform statistics (total users, total trips, total bookings).
- FR-31: The system shall allow admins to view, deactivate, or permanently delete user accounts.
- FR-32: The system shall allow admins to remove trips or bookings that violate platform policies.

---

### b. Acceptance Criteria

#### FR-01 — User Registration
- [ ] User can access the registration page without being logged in.
- [ ] User fills in full name, email, phone number, password, and selects a role (driver or passenger).
- [ ] System rejects registration if any required field is empty.
- [ ] System rejects registration if the email is already in use and displays an appropriate error message.
- [ ] System rejects registration if the password does not meet minimum requirements (at least 8 characters).
- [ ] On successful registration, the user is redirected to the login page or automatically logged in.

#### FR-03 & FR-04 — User Login
- [ ] User can access the login page from the homepage.
- [ ] User enters a valid email and password and is authenticated.
- [ ] System issues a JWT token and stores it securely (httpOnly cookie or localStorage).
- [ ] User is redirected to their dashboard after successful login.
- [ ] System displays an error message for invalid email or password.
- [ ] System displays an error message if required fields are left empty.

#### FR-12 & FR-13 — Trip Search and Filtering
- [ ] Passenger can enter origin city, destination city, and date in the search form.
- [ ] System returns a list of matching trips with key details (driver, time, seats, price, pickup points).
- [ ] Passenger can apply filters for max price, minimum available seats, and pickup point.
- [ ] Results update dynamically when filters are applied.
- [ ] System displays a "no trips found" message when no results match the search criteria.

#### FR-16 — Seat Booking
- [ ] Passenger can select a trip from search results and view its details.
- [ ] Passenger selects a preferred pickup point from the available options.
- [ ] Passenger confirms the booking and receives a pending confirmation message.
- [ ] System prevents booking if no seats are available.
- [ ] System prevents the same passenger from booking the same trip twice.
- [ ] Driver receives a notification of the new booking request.

#### FR-25 & FR-26 — Ratings and Reviews
- [ ] Rating option appears for a passenger only after their trip is marked as completed.
- [ ] Passenger can select a star rating (1–5) and optionally write a review.
- [ ] Driver can rate a passenger with a star rating (1–5) after the trip.
- [ ] Ratings are saved and reflected in the user's average rating on their profile.
- [ ] A user cannot rate the same trip/person more than once.

---

## 4. Non-Functional Requirements

### a. Description

**Performance**
- NFR-01: The system shall load all pages within 2 seconds under normal network conditions.
- NFR-02: The trip search results shall be returned and displayed within 3 seconds.
- NFR-03: The booking confirmation process shall complete within 5 seconds.
- NFR-04: The system shall support at least 500 concurrent users without performance degradation.

**Reliability & Availability**
- NFR-05: The system shall maintain an uptime of at least 99% per calendar month.
- NFR-06: The database shall be backed up automatically every 24 hours.
- NFR-07: The system shall gracefully handle server errors and display user-friendly error pages (e.g., 404, 500).

**Security**
- NFR-08: All user passwords shall be hashed using bcrypt before storage plain-text passwords shall never be stored.
- NFR-09: All client-server communication shall be secured using HTTPS/TLS.
- NFR-10: JWT session tokens shall expire after a maximum of 24 hours.
- NFR-11: The system shall implement role-based access control (passenger, driver, admin) to restrict unauthorized access to protected routes.
- NFR-12: All user inputs shall be sanitized on both the client and server side to prevent SQL injection and XSS attacks.
- NFR-13: Admin routes and dashboard shall be accessible only to users with the admin role.

**Usability**
- NFR-14: The user interface shall be designed for desktop use, with a minimum supported screen resolution of 1280×720 pixels.
- NFR-15: The system shall be accessible and functional on modern browsers including Chrome, Firefox, Safari, and Edge.
- NFR-16: The system shall display clear, descriptive error messages for all failed user actions.
- NFR-17: The system shall use a consistent design language (colors, typography, button styles) throughout all pages.

**Maintainability & Scalability**
- NFR-18: The codebase shall follow RESTful API design principles with clearly documented endpoints.
- NFR-19: The backend shall be structured in a modular, layered architecture (routes, controllers, services, models) to facilitate maintenance.
- NFR-20: The system shall be deployable in a containerized environment using Docker.
- NFR-21: The database shall be designed to support at least 10,000 registered users and 50,000 trip records without structural changes.

**Compliance & Data**
- NFR-22: The system shall comply with GDPR guidelines, including user consent for data collection and the right to account deletion.
- NFR-23: All admin actions (user deactivations, trip removals) shall be logged with timestamps for audit purposes.
- NFR-24: Notification emails shall be delivered within 60 seconds of the triggering event (booking approval, rejection, cancellation).
- NFR-25: The system shall validate all form inputs on both the client side (immediate feedback) and server side (security enforcement).

---

### b. Acceptance Criteria

#### NFR-01 & NFR-02 — Performance
- [ ] Homepage loads within 2 seconds on a standard broadband connection.
- [ ] Dashboard page loads within 2 seconds after login.
- [ ] Trip search results are displayed within 3 seconds of submitting the search form.
- [ ] Performance is verified using browser developer tools (Network tab) or a tool such as Lighthouse.

#### NFR-08 & NFR-09 — Security (Password & Communication)
- [ ] Passwords stored in the database are hashed (bcrypt) and unreadable in plain text.
- [ ] No plain-text password appears in any database record, log file, or API response.
- [ ] All API requests and page loads are served over HTTPS.
- [ ] Attempting to access the app via HTTP redirects to HTTPS.

#### NFR-11 — Role-Based Access Control
- [ ] A passenger cannot access driver-only routes (e.g., create trip).
- [ ] A driver cannot access admin-only routes (e.g., user management dashboard).
- [ ] An unauthenticated user cannot access any protected route and is redirected to the login page.
- [ ] Roles are correctly assigned at registration and enforced on both frontend and backend.

#### NFR-14 — Desktop Layout
- [ ] All pages render correctly at a minimum resolution of 1280×720 pixels.
- [ ] Navigation, tables, forms, and cards are properly aligned and usable on a standard desktop browser window.
- [ ] No layout breakage occurs when resizing the browser window between 1280px and 1920px widths.
- [ ] Tested on Chrome, Firefox, and Edge at full desktop window size.

#### NFR-25 — Input Validation
- [ ] All required form fields show an inline error if submitted empty.
- [ ] Email fields reject values that do not match a valid email format.
- [ ] Server returns a 400 Bad Request response for any API call with missing or malformed data.
- [ ] SQL injection attempts (e.g., `' OR '1'='1`) in form fields do not affect the database.
- [ ] XSS payloads (e.g., `<script>alert('xss')</script>`) entered in text fields are escaped and not executed.

---

## 5. Application Specifications

### a. Architecture

The Hop In platform follows a **three-tier client-server architecture**:

- **Frontend (Presentation Layer):** A React.js single page application (SPA) served to the user's browser. It handles all user interface rendering, routing, and state management. It communicates with the backend exclusively via HTTP REST API calls.

- **Backend (Business Logic Layer):** A Node.js application using the Express.js framework. It exposes a RESTful API, handles authentication (JWT), enforces business rules (seat availability, role permissions), and communicates with the database.

- **Database (Data Layer):** A PostgreSQL relational database that stores all persistent data including users, trips, bookings, pickup points, ratings, and notifications.

**Request Flow:**
User Browser (React) → HTTPS → Express REST API (Node.js) → PostgreSQL Database


Authentication is handled via JWT tokens: the client stores the token and sends it in the `Authorization: Bearer <token>` header with every protected request. The backend verifies the token and enforces role-based access before processing the request.

---

### b. Database Model

The database consists of the following core tables:

**Users**
- `user_id` (PK), `full_name`, `email` (UNIQUE), `phone`, `password_hash`, `role` (ENUM: driver, passenger, admin), `profile_picture`, `average_rating`, `created_at`

**Trips**
- `trip_id` (PK), `driver_id` (FK → Users), `departure_city`, `destination_city`, `departure_date`, `departure_time`, `total_seats`, `available_seats`, `price_per_seat`, `status` (ENUM: active, completed, cancelled), `created_at`

**Pickup_Points**
- `pickup_id` (PK), `trip_id` (FK → Trips), `location_name`, `pickup_time`

**Bookings**
- `booking_id` (PK), `trip_id` (FK → Trips), `passenger_id` (FK → Users), `pickup_id` (FK → Pickup_Points), `status` (ENUM: pending, confirmed, rejected, cancelled), `booked_at`

**Ratings**
- `rating_id` (PK), `trip_id` (FK → Trips), `reviewer_id` (FK → Users), `reviewee_id` (FK → Users), `stars` (1–5), `review_text`, `created_at`

**Notifications**
- `notification_id` (PK), `user_id` (FK → Users), `message`, `is_read` (BOOLEAN), `created_at`

**Key Relationships:**
- Each trip belongs to one driver (user with driver role).
- A trip can have multiple pickup points.
- Each booking links one passenger to one trip and one pickup point.
- Ratings link a reviewer and reviewee through a completed trip.
- Notifications are sent to individual users.

---

### c. Technologies Used

| Technology | Purpose | Reason for Selection |
|---|---|---|
| **React.js** | Frontend SPA framework | Component-based, reusable UI, large ecosystem |
| **Tailwind CSS** | Frontend styling | Utility-first CSS framework for consistent, structured desktop layouts |
| **Node.js** | Backend runtime | JavaScript across full stack, non-blocking I/O |
| **Express.js** | Backend web framework | Lightweight, flexible REST API development |
| **PostgreSQL** | Relational database | Robust, supports complex queries and relational integrity |
| **JWT** | Authentication tokens | Stateless, secure, widely adopted for REST APIs |
| **bcrypt** | Password hashing | Industry-standard one-way hashing for secure storage |
| **Axios** | HTTP client (frontend) | Promise-based, easy integration with React |
| **Docker** | Containerization | Consistent deployment environment |
| **Git / GitHub** | Version control | Collaborative development, branch management |

---

### d. User Interface Design

The interface follows a clean, minimal design with a consistent color scheme (navy blue and white with orange accent for actions). Navigation is fixed at the top with links adapting to the user's role.

**Key Pages:**

- **Landing Page:** Introduction to Hop In, call-to-action buttons for "Find a Ride" and "Offer a Ride", brief explanation of how the platform works.
- **Registration Page:** A two-step form personal details (name, email, phone, password) followed by role selection (Driver or Passenger) with visual card options.
- **Login Page:** Email and password fields with a "Forgot Password?" link. Redirects to role-appropriate dashboard after login.
- **Driver Dashboard:** Overview of active and past trips. Quick-access button to create a new trip. Pending booking requests shown with approve/reject actions.
- **Create Trip Page:** Form with fields for departure city, destination, date, time, seats, price, and a dynamic section to add multiple pickup points with times.
- **Trip Search Page (Passenger):** Search bar at the top (origin, destination, date) with a filter sidebar (price range, pickup point, available seats). Results displayed as cards with key trip info and a "Book" button.
- **Booking Confirmation Page:** Summary of selected trip and pickup point. Confirm booking button. Shows pending status after submission.
- **Profile Page:** Displays user information, average rating, review history, and edit profile option.
- **Trip History Page:** List of past and upcoming trips/bookings with status indicators (confirmed, pending, completed, cancelled).
- **Admin Dashboard:** Tables for users and trips with management controls. Summary statistics (total users, trips, bookings).

All forms include inline validation feedback. The design targets desktop browsers, with layouts optimized for standard widescreen resolutions (1280px and above) using a structured grid system.

---

### e. Security Measures

- **Authentication:** All protected routes require a valid JWT token sent in the `Authorization: Bearer` header. Tokens expire after 24 hours.
- **Password Security:** Passwords are hashed using **bcrypt** (minimum 10 salt rounds) before being stored in the database. Plain-text passwords are never stored or logged.
- **HTTPS:** All communication between the client and server is encrypted using TLS/HTTPS to protect data in transit.
- **Role-Based Access Control (RBAC):** Middleware on the backend verifies the user's role (passenger, driver, admin) before granting access to protected endpoints. Frontend routes are also conditionally rendered based on role.
- **Input Sanitization:** All user inputs are sanitized server-side to prevent SQL injection and XSS. Parameterized queries are used for all database interactions.
- **CORS Policy:** The backend enforces a strict CORS policy, only accepting requests from the authorized frontend origin.
- **Rate Limiting:** Login and registration endpoints are rate-limited to prevent brute-force attacks.
- **Data Privacy:** The system complies with GDPR principles — users may request account deletion, and personal data is not shared with third parties.
- **Admin Protection:** Admin accounts are created only through a secure internal process; self-registration as admin is not permitted through the public interface.
