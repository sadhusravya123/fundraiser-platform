@echo off
title Fundraiser Platform - Seed Database
echo ========================================================
echo   Seeding MongoDB with Demo Campaigns, Users & Donations
echo ========================================================
cd /d "%~dp0server"
npm run seed
pause
