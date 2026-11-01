@echo off
title Fundraiser Platform - Backend Server
echo ========================================================
echo   Starting Fundraiser Platform Backend (Express + MongoDB)
echo ========================================================
cd /d "%~dp0server"
npm run dev
pause
