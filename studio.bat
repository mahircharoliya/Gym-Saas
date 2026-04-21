@echo off
for /f "tokens=1,* delims==" %%a in ('type .env ^| findstr /r "^DATABASE_URL="') do set %%a=%%b
npx prisma studio --url "%DATABASE_URL%"
