CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`priority` enum('basse','normale','haute','urgente') DEFAULT 'normale',
	`relatedEntity` varchar(100),
	`relatedId` int,
	`status` enum('active','lue','resolue') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chauffeurs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20) NOT NULL,
	`languages` varchar(255),
	`zones` text,
	`status` enum('disponible','occupe','indisponible','conge','suspendu') DEFAULT 'disponible',
	`type` enum('interne','partenaire') DEFAULT 'interne',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chauffeurs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20) NOT NULL,
	`company` varchar(255),
	`type` enum('particulier','business','hotel','agence','partenaire','vip') DEFAULT 'particulier',
	`address` text,
	`preferences` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `demands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`type` varchar(100) NOT NULL,
	`origin` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL,
	`date` timestamp NOT NULL,
	`passengers` int DEFAULT 1,
	`luggage` int DEFAULT 0,
	`vehicleType` varchar(100),
	`message` text,
	`status` enum('nouvelle','a_traiter','devis_envoye','en_attente','convertie','refusee','annulee') DEFAULT 'nouvelle',
	`priority` enum('basse','normale','haute','urgente') DEFAULT 'normale',
	`source` varchar(100) DEFAULT 'site',
	`assignedTo` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `missions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` varchar(50) NOT NULL,
	`clientId` int NOT NULL,
	`chauffeurId` int,
	`vehicleId` int,
	`quoteId` int,
	`type` varchar(100) NOT NULL,
	`origin` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL,
	`date` timestamp NOT NULL,
	`passengers` int DEFAULT 1,
	`luggage` int DEFAULT 0,
	`price` int,
	`priceHT` int,
	`paymentStatus` enum('non_paye','paye','remboursement') DEFAULT 'non_paye',
	`paymentMethod` varchar(100),
	`status` enum('a_confirmer','confirmee','en_preparation','chauffeur_assigne','vehicule_assigne','prete','en_cours','client_pris_en_charge','terminee','annulee','litige') DEFAULT 'a_confirmer',
	`notes` text,
	`specialInstructions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missions_id` PRIMARY KEY(`id`),
	CONSTRAINT `missions_number_unique` UNIQUE(`number`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`demandId` int NOT NULL,
	`number` varchar(50) NOT NULL,
	`price` int NOT NULL,
	`priceHT` int NOT NULL,
	`status` enum('brouillon','envoye','consulte','accepte','refuse','expire') DEFAULT 'brouillon',
	`validUntil` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `quotes_number_unique` UNIQUE(`number`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brand` varchar(255) NOT NULL,
	`model` varchar(255) NOT NULL,
	`registration` varchar(20) NOT NULL,
	`category` varchar(100) NOT NULL,
	`seats` int DEFAULT 4,
	`luggage` int DEFAULT 3,
	`color` varchar(100),
	`year` int,
	`mileage` int,
	`status` enum('disponible','reserve','en_mission','entretien','indisponible','hors_service') DEFAULT 'disponible',
	`nextMaintenance` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_registration_unique` UNIQUE(`registration`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','gestionnaire','chauffeur','client') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `language` enum('fr','en') DEFAULT 'fr' NOT NULL;