# Web application for searching and booking coworking spaces

This project is the development of a single information platform for convenient searching, comparing and booking flexible workspaces in Ukraine. The project was created as part of a qualifying bachelor's thesis.

## Live Demo
* **Frontend:** [Vercel Link](https://web-application-for-finding-coworki-one.vercel.app/)
* **Backend API:** [Render Link](https://web-application-for-finding-coworking.onrender.com/swagger/)
* **Database:** Deployed on Clever Cloud

if the web application has not been accessed for 10-15 minutes or more, it may take some time (no more than a minute) for the backend to wake up
## Technology Stack

**Frontend:**
* React 18 and TypeScript
* Build using Vite
* Tailwind CSS 4 for utility-first styling
* Zustand for global state management
* React Leaflet and OpenStreetMap for interactive map
* Recharts for visualization of statistics graphs

**Backend:**
* C# and ASP.NET Core 9 Web API
* Entity Framework Core 9 (ORM)
* JWT Bearer for secure authentication and role model
* BCrypt for password hashing

**Database:**
* Ms SQL Server 8.0

## Main functionality

The project implements complex interaction between landlords and clients with a clear separation of roles:

* **Guest (unauthorized user):**
* Viewing a public catalog of spaces with the ability to search and apply filters.
* Visually search for locations on an interactive city map.
* Viewing ratings and reading verified reviews.

* **Client:**
* Booking workspaces for a specific date and time.
* Automatic checking of booking conflicts and availability in real time.
* Generating a QR code to confirm successful booking at locations.
* Managing a list of saved coworkings (Favorites) and leaving reviews after visiting.

* **Coworking Owner:**
* Convenient personal account for creating and editing an organization and coworkings.
* Management of incoming booking requests from clients (confirmation / cancellation).
* Access to analytics: revenue graphs, popular hours and workload by day of the week.

* **Administrator:**
* Control panel for moderating new coworkings.
* View and manage all bookings on the platform.
* Access to the audit log to track critical actions in the system.

## Architecture and Security
The project is built according to the classic three-tier client-server architecture. The server layer is implemented using the “Controller – Service – DbContext” pattern, which ensures weak component coupling. All user personal data is additionally encrypted using the AES-256 algorithm immediately before being written to the database.

## Author
**Kishchuk Mykhailo** - development of architecture, frontend and backend components, database.
