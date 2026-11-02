# HungerHub Billing App

A local full-stack billing application for a small shop.

## Stack
- Java 17, Spring Boot 3.4, Spring Data JPA, Maven
- MySQL 8+
- React 18, Vite, plain CSS
- jsPDF for client-side bill PDF downloads

## Features
- Four-digit unique product codes; add, edit, delete, list
- Stock-in adds quantity to existing stock
- Customer records and customer bill history
- Billing by product code, fixed product price, stock validation
- Convenience fee: none / 5% / 10%
- Unique bill numbers (`HH-0001`, etc.), date and time
- Stock is deducted transactionally when a bill is saved
- Bill history, daily sales summary
- WhatsApp text sharing and PDF download + WhatsApp handoff

## Prerequisites
- JDK 17+
- Maven 3.9+
- MySQL 8+
- Node.js 18+

## 1. Create the database
```sql
CREATE DATABASE hungerhub;
```

## 2. Configure the backend
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```
The default URL is `jdbc:mysql://localhost:3306/hungerhub`. Hibernate creates/updates tables using `ddl-auto=update`.

## 3. Run the backend
```bash
cd backend
mvn spring-boot:run
```
API base URL: `http://localhost:8080/api`

## 4. Run the frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Notes
- This is a local starter app. Add authentication, backups, role permissions, and production deployment hardening before using it for sensitive or high-volume business operations.
- Product code is stored as a string so leading zeroes are preserved.
- The backend calculates prices and totals; the browser is not trusted for bill amounts.
- PDF generation runs in the browser. WhatsApp does not support attaching a file through a `wa.me` URL, so the app downloads the PDF and opens the chat for manual attachment.
