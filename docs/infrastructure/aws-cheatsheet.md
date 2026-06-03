# Rofo AWS / Production Cheat Sheet

## Production App

SSH:

ssh -i ~/Downloads/rofo-vpc.pem ec2-user@52.1.209.213

Production App Instance:

Production APP

Volumes:

/dev/xvda → boot
/dev/xvdf → mounted as /ebs1
/dev/xvdg → mounted as /ebs2

---

## Important Mounts

### /ebs1

Legacy app + code + configs

/ebs1/rofo/www
/ebs1/rofo/system

Important:

/ebs1/rofo/system/mysql.ini.php

Contains:

* DB host
* username
* password
* database name

### /ebs2

Large media archive

Building photos:

/ebs2/rofo/content/buildings5

Listing photos:

/ebs2/rofo/content/listings4

Photo structure:

building_id_hash.jpg

listing_id_hash.jpg

---

## Database

Database:

rofo

Connect:

mysql -h HOST -u rofo -p rofo

Useful checks:

SHOW TABLES;

SELECT COUNT(*) FROM listings;

SELECT COUNT(*) FROM buildings;

---

## Counts (June 2026)

Listings:

3,265,631

Buildings:

2,145,358

Listing photos:

453,856

Building photos:

1,487,119

---

## Useful Commands

Mounted volumes:

lsblk -f

Disk usage:

df -h

Inspect volume:

sudo ls -lah /ebs1
sudo ls -lah /ebs2

Test DB connectivity:

nc -vz HOST 3306

---

## Representative Evidence Workflow

Production DB

↓

SQL export

↓

TSV export

↓

Copy locally using SCP

↓

Place in:

data/external/representative-evidence/

↓

Codex consumes exports

---

## Export Folder

EC2 export location:

~/rofo-evidence-exports

Local repo location:

data/external/representative-evidence
