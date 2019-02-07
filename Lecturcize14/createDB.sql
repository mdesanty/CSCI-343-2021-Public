DROP DATABASE IF EXISTS USERTEST;

CREATE DATABASE USERTEST;

use USERTEST;

CREATE TABLE USER (
    USER_ID int NOT NULL AUTO_INCREMENT,
    USER_EMAIL varchar(255) UNIQUE NOT NULL,
    USER_PASS varchar(60) NOT NULL,
    PRIMARY KEY (USER_ID)
);