CREATE DATABASE  IF NOT EXISTS `coworking_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `coworking_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: coworking_db
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__efmigrationshistory`
--

DROP TABLE IF EXISTS `__efmigrationshistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__efmigrationshistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__efmigrationshistory`
--

LOCK TABLES `__efmigrationshistory` WRITE;
/*!40000 ALTER TABLE `__efmigrationshistory` DISABLE KEYS */;
INSERT INTO `__efmigrationshistory` VALUES ('20260325164055_InitialCreate','8.0.25'),('20260404125553_AddNotifications','8.0.25'),('20260405120446_AddAuditLogAndRateLimit','8.0.25'),('20260407150018_AddOrganizationFields','8.0.25'),('20260427113732_AddEncryptionToUserFields','8.0.25'),('20260427180422_AddOrganizationContactInfo','8.0.25');
/*!40000 ALTER TABLE `__efmigrationshistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditlogs`
--

DROP TABLE IF EXISTS `auditlogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditlogs` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `UserEmail` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Action` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Entity` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `EntityId` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `IpAddress` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_AuditLogs_UserId` (`UserId`),
  CONSTRAINT `FK_AuditLogs_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditlogs`
--

LOCK TABLES `auditlogs` WRITE;
/*!40000 ALTER TABLE `auditlogs` DISABLE KEYS */;
INSERT INTO `auditlogs` VALUES (1,4,'client1@gmail.com','BOOKING_CREATED','Booking','20','Коворкінг: Чудовий Коворкінг, 15.04.2026 14:00–16:00','::1','2026-04-05 12:10:13.235454'),(2,1,'admin@coworking.ua','BOOKING_CONFIRMED','Booking','20','Підтверджено бронювання #20','::1','2026-04-05 12:10:25.601045'),(3,1,'admin@coworking.ua','BOOKING_CONFIRMED','Booking','19','Підтверджено бронювання #19','::1','2026-04-05 12:10:26.487259'),(4,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-04-05 16:24:12.211201'),(5,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-05 18:33:35.380079'),(6,4,'client1@gmail.com','BOOKING_CREATED','Booking','21','Коворкінг: WorkHub Central, 14.04.2026 09:00–21:00','::1','2026-04-05 18:34:23.183805'),(7,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-04-05 18:35:27.904727'),(8,1,'admin@coworking.ua','BOOKING_CONFIRMED','Booking','21','Підтверджено бронювання #21','::1','2026-04-05 18:36:11.811234'),(9,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-05 18:37:56.707975'),(10,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-04-05 18:38:29.418438'),(11,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-05 18:39:54.733295'),(12,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-07 14:53:53.505073'),(13,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-07 14:54:40.644682'),(14,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-07 14:55:51.270875'),(15,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','127.0.0.1','2026-04-07 15:13:04.561065'),(16,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','127.0.0.1','2026-04-07 15:13:42.417706'),(17,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','127.0.0.1','2026-04-07 15:16:03.348475'),(18,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: owner2@workhub.ua','127.0.0.1','2026-04-07 15:17:02.457842'),(19,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: owner2@workhub.ua','127.0.0.1','2026-04-07 15:17:12.798167'),(20,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: owner2@workhub.ua','127.0.0.1','2026-04-07 15:17:24.174549'),(21,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner2@spacemk.ua','127.0.0.1','2026-04-07 15:17:46.310976'),(22,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner2@spacemk.ua','::1','2026-04-07 21:34:50.226131'),(23,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-04-07 21:35:40.397348'),(24,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-07 21:36:16.764786'),(25,4,'client1@gmail.com','BOOKING_CREATED','Booking','22','Коворкінг: SpaceWork MK, 02.05.2026 10:00–14:00','::1','2026-04-07 21:37:26.856034'),(26,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-04-07 21:37:48.969611'),(27,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-07 21:39:02.514107'),(28,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-04-07 21:42:29.361978'),(29,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-04-07 21:43:07.707153'),(30,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-07 21:43:52.050811'),(31,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-07 21:47:42.175881'),(32,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-04-07 21:49:09.363912'),(33,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-08 14:34:35.831037'),(34,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-04-08 15:29:50.101125'),(35,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-04-08 16:00:51.373605'),(36,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-08 16:19:47.910640'),(37,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-04-09 19:12:55.390490'),(38,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-04-09 19:14:21.678383'),(39,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-27 09:32:29.661023'),(40,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-04-27 11:19:54.842029'),(41,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-04-27 11:21:37.961840'),(42,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: client1@gmail.com','::1','2026-04-27 18:23:34.924651'),(43,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: owner1@workhub.ua','::1','2026-04-27 18:23:44.550041'),(44,NULL,'anonymous','REGISTER','User',NULL,'Новий користувач: derewashchka@gmail.com (client)','::1','2026-04-27 18:24:12.692442'),(45,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: derewashchka@gmail.com','::1','2026-04-27 18:38:05.720921'),(46,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: derewashchka@gmail.com','::1','2026-04-27 18:38:13.196202'),(47,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: owner1@workhub.ua','::1','2026-04-27 18:50:56.176260'),(48,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: owner1@workhub.ua','::1','2026-04-27 18:52:15.250548'),(49,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: admin@coworking.ua','::1','2026-04-27 21:39:30.083606'),(50,NULL,'anonymous','REGISTER','User',NULL,'Новий користувач: derewashchka1@gmail.com (client)','::1','2026-04-27 21:39:47.980478'),(51,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: admin@coworking.ua','::1','2026-04-27 21:56:34.392158'),(52,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: client1@gmail.com','::1','2026-04-27 21:56:41.024102'),(53,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: client1@gmail.com','::1','2026-04-27 22:16:55.628721'),(54,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: client1@gmail.com','::1','2026-04-27 22:17:09.925751'),(55,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: derewashchka@gmail.com','::1','2026-04-27 22:18:22.068747'),(56,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: derewashchk1@gmail.com','::1','2026-04-27 22:18:28.911586'),(57,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: derewashchk1@gmail.com','::1','2026-04-27 22:18:34.691251'),(58,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: derewashchka1@gmail.com','::1','2026-04-27 22:18:39.640864'),(59,NULL,'anonymous','LOGIN_FAILED','Auth',NULL,'Спроба входу: derewashchka1@gmail.com','::1','2026-04-27 22:18:49.501998'),(60,NULL,'anonymous','REGISTER','User',NULL,'Новий користувач: derewashchka11@gmail.com (client)','::1','2026-04-27 22:19:03.350027'),(61,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-04-27 22:40:29.797397'),(62,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-04-27 22:41:46.865235'),(63,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-04-27 22:45:12.883237'),(64,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-05-22 11:34:18.869663'),(65,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-05-22 11:36:08.281629'),(66,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-05-22 12:32:42.307537'),(67,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-05-22 12:33:17.809882'),(68,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner2@spacemk.ua','::1','2026-05-22 12:43:37.523140'),(69,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-05-22 12:46:44.394822'),(70,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-05-22 18:02:38.297112'),(71,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-05-25 10:31:10.444979'),(72,4,'client1@gmail.com','BOOKING_CREATED','Booking','23','Коворкінг: WorkHub Central, 28.05.2026 10:00–17:00','::1','2026-05-25 10:31:38.622142'),(73,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-05-25 10:32:14.104637'),(74,2,'owner1@workhub.ua','BOOKING_CONFIRMED','Booking','23','Підтверджено бронювання #23','::1','2026-05-25 10:32:30.011070'),(75,2,'owner1@workhub.ua','BOOKING_CONFIRMED','Booking','18','Підтверджено бронювання #18','::1','2026-05-25 10:32:32.352041'),(76,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-05-25 11:27:31.886033'),(77,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-05-25 11:29:47.571373'),(78,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-05-25 11:33:58.842065'),(79,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-05-26 10:32:33.938435'),(80,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-05-26 10:37:10.953795'),(81,2,'owner1@workhub.ua','BOOKING_CONFIRMED','Booking','4','Підтверджено бронювання #4','::1','2026-05-26 10:44:30.466794'),(82,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-05-26 10:48:28.136773'),(83,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-05-28 00:26:43.916390'),(84,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: client1@gmail.com','::1','2026-05-29 13:52:31.228355'),(85,4,'client1@gmail.com','BOOKING_CREATED','Booking','24','Коворкінг: SpaceWork MK, 30.05.2026 14:00–17:00','::1','2026-05-29 13:53:19.868312'),(86,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-05-29 13:56:19.297416'),(87,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-05-29 13:58:24.868629'),(88,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner2@spacemk.ua','::1','2026-05-29 13:58:55.216946'),(89,3,'owner2@spacemk.ua','BOOKING_CONFIRMED','Booking','24','Підтверджено бронювання #24','::1','2026-05-29 13:59:40.291519'),(90,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: admin@coworking.ua','::1','2026-05-29 14:00:06.007070'),(91,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-05-29 14:02:15.001252'),(92,NULL,'anonymous','LOGIN','Auth',NULL,'Успішний вхід: owner1@workhub.ua','::1','2026-06-14 17:01:49.630246');
/*!40000 ALTER TABLE `auditlogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CoworkingId` int NOT NULL,
  `UserId` int NOT NULL,
  `DateFrom` datetime(6) NOT NULL,
  `DateTo` datetime(6) NOT NULL,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `TotalPrice` decimal(10,2) NOT NULL,
  `PaymentId` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Bookings_CoworkingId` (`CoworkingId`),
  KEY `IX_Bookings_UserId` (`UserId`),
  CONSTRAINT `FK_Bookings_Coworkings_CoworkingId` FOREIGN KEY (`CoworkingId`) REFERENCES `coworkings` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Bookings_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,4,'2024-05-10 09:00:00.000000','2024-05-10 17:00:00.000000','confirmed',960.00,'PAY_001_STRIPE','2026-03-25 17:02:05.396235'),(2,3,4,'2024-05-20 10:00:00.000000','2024-05-20 14:00:00.000000','confirmed',240.00,'PAY_002_STRIPE','2026-03-25 17:02:05.396602'),(3,1,5,'2024-06-01 08:00:00.000000','2024-06-01 12:00:00.000000','confirmed',480.00,'PAY_003_STRIPE','2026-03-25 17:02:05.396602'),(4,2,5,'2026-04-15 09:00:00.000000','2026-04-15 18:00:00.000000','confirmed',675.00,NULL,'2026-03-25 17:02:05.396602'),(5,2,4,'2024-07-05 13:00:00.000000','2024-07-05 17:00:00.000000','cancelled',300.00,NULL,'2026-03-25 17:02:05.396602'),(6,2,4,'2026-04-22 00:00:00.000000','2026-04-24 14:00:00.000000','cancelled',4650.00,NULL,'2026-04-03 12:08:45.047108'),(7,2,4,'2026-05-02 10:00:00.000000','2026-05-05 09:00:00.000000','confirmed',5325.00,NULL,'2026-04-03 12:18:53.090942'),(8,2,4,'2026-05-07 10:00:00.000000','2026-05-09 06:00:00.000000','confirmed',3300.00,NULL,'2026-04-03 12:19:07.266689'),(9,1,4,'2026-04-04 15:00:00.000000','2026-04-10 15:00:00.000000','confirmed',17280.00,NULL,'2026-04-03 18:58:05.250463'),(10,3,4,'2026-04-15 17:00:00.000000','2026-04-16 15:00:00.000000','confirmed',1320.00,NULL,'2026-04-03 19:16:01.348561'),(11,7,4,'2026-04-03 21:00:00.000000','2026-04-10 21:00:00.000000','confirmed',18648.00,NULL,'2026-04-04 00:04:59.263126'),(12,7,5,'2026-04-03 21:00:00.000000','2026-04-10 21:00:00.000000','confirmed',18648.00,NULL,'2026-04-04 00:20:10.580653'),(13,7,5,'2026-04-03 21:00:00.000000','2026-04-10 21:00:00.000000','confirmed',18648.00,NULL,'2026-04-04 00:20:17.604066'),(14,7,5,'2026-04-03 21:00:00.000000','2026-04-10 21:00:00.000000','confirmed',18648.00,NULL,'2026-04-04 00:20:26.665688'),(15,2,5,'2026-04-04 10:00:00.000000','2026-04-04 15:00:00.000000','confirmed',375.00,NULL,'2026-04-04 12:02:56.797173'),(16,7,5,'2026-04-15 09:00:00.000000','2026-04-15 11:00:00.000000','confirmed',222.00,NULL,'2026-04-04 13:00:01.510834'),(17,3,4,'2026-04-23 13:00:00.000000','2026-04-23 16:00:00.000000','confirmed',180.00,NULL,'2026-04-04 14:19:44.199283'),(18,2,4,'2026-04-15 08:00:00.000000','2026-04-15 15:00:00.000000','confirmed',525.00,NULL,'2026-04-04 14:26:59.868271'),(19,3,4,'2026-04-29 09:00:00.000000','2026-04-29 11:00:00.000000','confirmed',120.00,NULL,'2026-04-04 16:56:20.319178'),(20,7,4,'2026-04-15 14:00:00.000000','2026-04-15 16:00:00.000000','confirmed',222.00,NULL,'2026-04-05 12:10:13.092933'),(21,1,4,'2026-04-14 09:00:00.000000','2026-04-14 21:00:00.000000','confirmed',1440.00,NULL,'2026-04-05 18:34:23.147425'),(22,3,4,'2026-05-02 10:00:00.000000','2026-05-02 14:00:00.000000','pending',240.00,NULL,'2026-04-07 21:37:26.803115'),(23,1,4,'2026-05-28 10:00:00.000000','2026-05-28 17:00:00.000000','confirmed',840.00,NULL,'2026-05-25 10:31:38.576369'),(24,3,4,'2026-05-30 14:00:00.000000','2026-05-30 17:00:00.000000','confirmed',180.00,NULL,'2026-05-29 13:53:19.833576');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coworkings`
--

DROP TABLE IF EXISTS `coworkings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coworkings` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int DEFAULT NULL,
  `Name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `City` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `PricePerHour` decimal(10,2) NOT NULL,
  `Rating` double NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `PhotoUrl` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `Latitude` double DEFAULT NULL,
  `Longitude` double DEFAULT NULL,
  `TotalSeats` int NOT NULL,
  `IsApproved` tinyint(1) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Coworkings_OrganizationId` (`OrganizationId`),
  CONSTRAINT `FK_Coworkings_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coworkings`
--

LOCK TABLES `coworkings` WRITE;
/*!40000 ALTER TABLE `coworkings` DISABLE KEYS */;
INSERT INTO `coworkings` VALUES (1,1,'WorkHub Central','Київ','вул. Хрещатик, 10','WiFi,Принтер,Кухня,Переговорна,Кава,Паркінг',120.00,5,'Сучасний коворкінг у центрі Києва. Тихі зони, швидкий інтернет 1 Гбіт, переговорні кімнати, власна кав\'ярня. Відкритий 24/7.','https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',50.4501,30.5234,30,1,'2026-03-25 17:02:05.335030'),(2,1,'WorkHub Podil','Київ','вул. Сагайдачного, 22','WiFi,Кухня,Кава,Лаундж',75.00,2.5,'Затишний простір на Подолі. Ідеально для фрілансерів та невеликих команд. Гнучкі тарифи.','https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',50.4644,30.522,19,1,'2026-03-25 17:02:05.335524'),(3,2,'SpaceWork MK','Миколаїв','пр. Центральний, 5','WiFi,Принтер,Переговорна,Кухня,Кава',60.00,4.5,'Перший коворкінг бізнес-класу в Миколаєві. 3 переговорні кімнати, безкоштовна кава.','https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',46.975,31.9946,25,1,'2026-03-25 17:02:05.335525'),(4,NULL,'OdesaWork Hub','Одеса','вул. Дерибасівська, 7','WiFi,Кухня,Кава,Тераса',90.00,0,'Новий коворкінг у серці Одеси. Відкрита тераса, стильний інтер\'єр.','https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',46.4825,30.7233,15,0,'2026-03-25 17:02:05.335525'),(5,NULL,'TestCo','Миколаїв','вул. Тест','WiFi,Кухня,Принтер',100.00,0,'описописописопис','https://media.istockphoto.com/id/918170282/uk/%D1%84%D0%BE%D1%82%D0%BE/%D0%B4%D1%96%D0%BB%D0%BE%D0%B2%D1%96-%D0%BB%D1%8E%D0%B4%D0%B8-%D0%BF%D1%80%D0%B0%D1%86%D1%8E%D1%8E%D1%82%D1%8C-%D1%80%D0%B0%D0%B7%D0%BE%D0%BC-%D0%B2-%D1%81%D0%B2%D1%96%D1%82%D0%BB%D0%BE%D0%BC%D1%83-%D0%BE%D1%84%D1%96%D1%81%D1%96-%D1%81%D0%B8%D0%B4%D1%8F%D1%87%D0%B8-%D0%B7%D0%B0-%D1%81%D1%82%D0%BE%D0%BB%D0%BE%D0%BC.jpg?s=612x612&w=0&k=20&c=NzjCbWfBcaCoeoScdbO2V1MAdEh_46GSbuBBt0zyTGE=',NULL,NULL,10,1,'2026-04-03 19:00:16.933257'),(6,NULL,'КоворгінгЦентрал','Миколаїв','вул. Океанівська, 5','Кухня,Кава,WiFi,Принтер,Лаундж',122.00,0,'опис опис','https://st2.depositphotos.com/4807673/7153/v/450/depositphotos_71538941-stock-illustration-people-talking-and-working-in.jpg',50.4501,30.52,18,1,'2026-04-03 22:43:15.468827'),(7,1,'Чудовий Коворкінг','Київ','вул. Хрещатик, 1','WiFi,Кухня,Принтер,Кава,Паркінг,Переговорна,Лаундж',111.00,0,'чудовий коворкінг','https://cdn.create.vista.com/api/media/small/35304507/stock-photo-people-working-on-laptop-computer',50,30,11,1,'2026-04-03 23:46:56.236061'),(8,2,'SpaceWork MK Корабелів','Миколаїв','проспект Корабелів, 8','WiFi,Кухня,Кава,Принтер,Переговорна,Лаундж',130.00,0,'Чудове місце з зручностями','https://arcon.com.ua/components/com_jshopping/files/img_products/full_Koop34_04.jpg',46.8566,32.0067,5,1,'2026-05-22 12:46:28.067933');
/*!40000 ALTER TABLE `coworkings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `Title` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `IsRead` tinyint(1) NOT NULL,
  `Type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Notifications_UserId` (`UserId`),
  CONSTRAINT `FK_Notifications_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (2,2,'Нове бронювання','Новий клієнт забронював місце в «Чудовий Коворкінг» на 15.04.2026 09:00.',1,'info','2026-04-04 13:00:01.698409'),(3,5,'Бронювання підтверджено ✓','Ваше бронювання в «Чудовий Коворкінг» на 15.04.2026 09:00 підтверджено!',1,'success','2026-04-04 13:00:41.235103'),(4,4,'Бронювання створено','Ваше бронювання в «SpaceWork MK» на 23.04.2026 13:00 очікує підтвердження.',1,'info','2026-04-04 14:19:44.354803'),(5,3,'Нове бронювання','Новий клієнт забронював місце в «SpaceWork MK» на 23.04.2026 13:00.',1,'info','2026-04-04 14:19:44.393673'),(6,4,'Бронювання підтверджено ✓','Ваше бронювання в «SpaceWork MK» на 23.04.2026 13:00 підтверджено!',1,'success','2026-04-04 14:20:37.387006'),(7,4,'Бронювання створено','Ваше бронювання в «WorkHub Podil» на 15.04.2026 08:00 очікує підтвердження.',1,'info','2026-04-04 14:26:59.892842'),(8,2,'Нове бронювання','Новий клієнт забронював місце в «WorkHub Podil» на 15.04.2026 08:00.',1,'info','2026-04-04 14:26:59.920899'),(9,4,'Бронювання створено','Ваше бронювання в «SpaceWork MK» на 29.04.2026 09:00 очікує підтвердження.',1,'info','2026-04-04 16:56:20.487761'),(10,3,'Нове бронювання','Новий клієнт забронював місце в «SpaceWork MK» на 29.04.2026 09:00.',1,'info','2026-04-04 16:56:20.525635'),(11,4,'Бронювання створено','Ваше бронювання в «Чудовий Коворкінг» на 15.04.2026 14:00 очікує підтвердження.',1,'info','2026-04-05 12:10:13.263653'),(12,2,'Нове бронювання','Новий клієнт забронював місце в «Чудовий Коворкінг» на 15.04.2026 14:00.',1,'info','2026-04-05 12:10:13.299964'),(13,4,'Бронювання підтверджено ✓','Ваше бронювання в «Чудовий Коворкінг» на 15.04.2026 14:00 підтверджено!',1,'success','2026-04-05 12:10:25.619139'),(15,4,'Бронювання створено','Ваше бронювання в «WorkHub Central» на 14.04.2026 09:00 очікує підтвердження.',1,'info','2026-04-05 18:34:23.196461'),(16,2,'Нове бронювання','Новий клієнт забронював місце в «WorkHub Central» на 14.04.2026 09:00.',1,'info','2026-04-05 18:34:23.233170'),(17,4,'Бронювання підтверджено ✓','Ваше бронювання в «WorkHub Central» на 14.04.2026 09:00 підтверджено!',1,'success','2026-04-05 18:36:11.829997'),(18,4,'Бронювання створено','Ваше бронювання в «SpaceWork MK» на 02.05.2026 10:00 очікує підтвердження.',1,'info','2026-04-07 21:37:26.878884'),(19,3,'Нове бронювання','Новий клієнт забронював місце в «SpaceWork MK» на 02.05.2026 10:00.',1,'info','2026-04-07 21:37:26.936168'),(20,4,'Бронювання створено','Ваше бронювання в «WorkHub Central» на 28.05.2026 10:00 очікує підтвердження.',1,'info','2026-05-25 10:31:38.633472'),(21,2,'Нове бронювання','Новий клієнт забронював місце в «WorkHub Central» на 28.05.2026 10:00.',1,'info','2026-05-25 10:31:38.668764'),(22,4,'Бронювання підтверджено ✓','Ваше бронювання в «WorkHub Central» на 28.05.2026 10:00 підтверджено!',1,'success','2026-05-25 10:32:30.032932'),(23,4,'Бронювання підтверджено ✓','Ваше бронювання в «WorkHub Podil» на 15.04.2026 08:00 підтверджено!',1,'success','2026-05-25 10:32:32.362361'),(24,5,'Бронювання підтверджено ✓','Ваше бронювання в «WorkHub Podil» на 15.04.2026 09:00 підтверджено!',0,'success','2026-05-26 10:44:30.491890'),(25,4,'Бронювання створено','Ваше бронювання в «SpaceWork MK» на 30.05.2026 14:00 очікує підтвердження.',1,'info','2026-05-29 13:53:19.879334'),(26,3,'Нове бронювання','Новий клієнт забронював місце в «SpaceWork MK» на 30.05.2026 14:00.',0,'info','2026-05-29 13:53:19.904100'),(27,4,'Бронювання підтверджено ✓','Ваше бронювання в «SpaceWork MK» на 30.05.2026 14:00 підтверджено!',0,'success','2026-05-29 13:59:40.309600');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PlanType` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `Description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `LogoUrl` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `PremiumUntil` datetime(6) DEFAULT NULL,
  `ContactInfo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'WorkHub Ukraine','вул. Хрещатик, 10, Київ','premium','2026-03-25 17:02:04.798012',NULL,NULL,NULL,'{\"email\":\"support@workhub.com\"}'),(2,'SpaceOwner Mykolaiv','пр. Центральний, 5, Миколаїв','basic','2026-03-25 17:02:04.798230',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CoworkingId` int NOT NULL,
  `UserId` int NOT NULL,
  `Rating` int NOT NULL,
  `Comment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Reviews_CoworkingId` (`CoworkingId`),
  KEY `IX_Reviews_UserId` (`UserId`),
  CONSTRAINT `FK_Reviews_Coworkings_CoworkingId` FOREIGN KEY (`CoworkingId`) REFERENCES `coworkings` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Reviews_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,4,5,'Відмінний коворкінг! Дуже швидкий інтернет, зручні меблі та чудова кава. Буду повертатись обов\'язково.','2026-03-25 17:02:05.427587'),(2,3,4,4,'Хороший варіант для Миколаєва. Переговорна кімната добре обладнана, персонал привітний.','2026-03-25 17:02:05.427731'),(3,1,5,5,'Найкращий коворкінг у Києві, де мені доводилось працювати. Ідеально для продуктивної роботи.','2026-03-25 17:02:05.427732'),(4,3,5,4,'Зручне розташування, хороша інфраструктура. Рекомендую для тих, хто часто буває у Миколаєві.','2026-03-25 17:02:05.427732'),(8,2,4,2,'не сподобалось, доступ до WiFi виявився платним','2026-04-04 12:01:30.398016'),(9,2,5,3,'Непогано','2026-04-04 12:03:54.187044');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `OrganizationId` int DEFAULT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Role` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FirstName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Phone` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Users_Email` (`Email`),
  KEY `IX_Users_OrganizationId` (`OrganizationId`),
  CONSTRAINT `FK_Users_Organizations_OrganizationId` FOREIGN KEY (`OrganizationId`) REFERENCES `organizations` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'U25xoWdp8IiJD5toUajcuoAiFNyFBBuaP0xN6ecU8Zs=','$2a$11$u7hhfYO9ekGhO02an36fsedVFqDAr6ShdsgNVDUmnDiKneN9YsXZK','admin','aNfv0/yUUeX9Cv3sR9irqQ==','wwm0aswf9waczf9dtAQb4g==',NULL,'2026-03-25 17:02:05.262801'),(2,1,'WUfOPaHBhCmL4n3eTYc1o18V1MnwUWttAZXSg1vzdM4=','$2a$11$u7hhfYO9ekGhO02an36fsedVFqDAr6ShdsgNVDUmnDiKneN9YsXZK','owner','YXAm9enFuSH/FdjFK5dh7Q==','UbPzsb62RION/uNgX7v8tHHoPA5UcOjAp6YX1sfEMsc=','beA+zeWU1YI8Krhkw81+sw==','2026-03-25 17:02:05.263029'),(3,2,'FIn2i/hnhwPsvjPOUtsAZbHc/Y9vvI0CE2kl2ZU9Als=','$2a$11$u7hhfYO9ekGhO02an36fsedVFqDAr6ShdsgNVDUmnDiKneN9YsXZK','owner','dNVgeTDa70tLZw2sr3o8Mw==','0qFPRciP8LlewiPgT2CJ4A==','lLn10/dOk33EcQ0cpvPwNA==','2026-03-25 17:02:05.263103'),(4,NULL,'xH5tGd+RIjm6qcMf0eFLiJMH+e5vzHuPkMA3Wricl6U=','$2a$11$GlkHvXFe74FcSwzDX937XOxOyQpvezpUW5LKX9umPjffcaaJsvmCa','client','9VnyUD/+baa3UCEgo22//Q==','VwZYybejMy5SkDXz+NQbhe4lI4U3xR+tI4JsJW6VrHM=',NULL,'2026-03-25 17:02:05.263103'),(5,NULL,'smVvSPY3aIJlo6MOnfHB9rVlUFbdaYrvV6R2Ha91ZUU=','$2a$11$u7hhfYO9ekGhO02an36fsedVFqDAr6ShdsgNVDUmnDiKneN9YsXZK','client','9twwr+wUrJq3zWewpd2wiw==','MvPB+PqwbxdqufaXc5SNcw==','yKBe1BTv9AVuY9YZea1Eig==','2026-03-25 17:02:05.263103'),(6,NULL,'moWZAnht+fZX5JAfhX5lWp8OWfDAIKk7QnGo8nGX9bk=','$2a$11$eUG1yAuk2wRwWpqi9uxqROh766h1StIbLg4QoSA3AAcNBgztfyBzu','client','7m2urEvOjr/Zi260z3+QIg==','w7NXjai3Big75G+44CzFUQ==','W+9T12+lZwXHjSXQqYnRzQ==','2026-04-27 18:24:12.343920'),(7,NULL,'vioEQcjoyeXr4CaEVAcAdWOryOQOYNG82ZXC9L8CGxE=','$2a$11$n/kdlPMVi7Qd6hQaNexbW.l7UhwBlUSPyYSE5UolvweWaneWOf1fO','client','7m2urEvOjr/Zi260z3+QIg==','w7NXjai3Big75G+44CzFUQ==','W+9T12+lZwXHjSXQqYnRzQ==','2026-04-27 21:39:47.625710'),(8,NULL,'Y3TIMEf3Rr+JS2xPJmHy/0iQRZ194G+nuYFXakMIdAQ=','$2a$11$O7jwZdeZci/REZGfkFLW2.ZkYdQBSm23WZFoAzjD1N7lwf9sRwiXq','client','7m2urEvOjr/Zi260z3+QIg==','w7NXjai3Big75G+44CzFUQ==','W+9T12+lZwXHjSXQqYnRzQ==','2026-04-27 22:19:03.004078');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-13 12:11:32
