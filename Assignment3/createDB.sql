DROP DATABASE IF EXISTS GuessingGameDb;

CREATE DATABASE GuessingGameDb;

use GuessingGameDb;

CREATE TABLE Games (
    Id int NOT NULL AUTO_INCREMENT,
    TotalGuesses int NOT NULL,
    PRIMARY KEY (Id)
);