# Multi-stage build. Il progetto ha una ProjectReference verso ../ShiftManager.Core,
# quindi va buildato con il contesto sulla ROOT del repo:
#   docker build -f ShiftManager.API/Dockerfile -t shiftmanager-api .
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

COPY ShiftManager.API/ShiftManager.API.csproj ShiftManager.API/
COPY ShiftManager.Core/ShiftManager.Core.csproj ShiftManager.Core/
RUN dotnet restore ShiftManager.API/ShiftManager.API.csproj

COPY ShiftManager.API/ ShiftManager.API/
COPY ShiftManager.Core/ ShiftManager.Core/
RUN dotnet publish ShiftManager.API/ShiftManager.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ShiftManager.API.dll"]
