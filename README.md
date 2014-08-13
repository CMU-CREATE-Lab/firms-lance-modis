firms-lance-modis
=================

WebGL based visualizations of active fire data

MySQl
=====
mysql> create database `lance_firms_modis`;
mysql> create table `firms84781383933007` (id int auto_increment primary key, latitude DOUBLE, longitude DOUBLE, brightness FLOAT, scan FLOAT, track FLOAT, acq_date DATE,acq_time CHAR(5), satellite CHAR,confidence INT, version FLOAT, bright_t31 FLOAT,frp FLOAT);
$ /usr/local/mysql/bin/mysqlimport  --ignore-lines=1 --fields-terminated-by=, --columns='latitude,longitude,brightness,scan,track,acq_date, acq_time,satellite,confidence,version,bright_t31,frp' --local -u root lance_firms_modis csv/raw/firms84781383933007.csv 

