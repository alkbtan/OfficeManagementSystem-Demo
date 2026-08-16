FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["OfficeManagementAPI.csproj", "./"]
RUN dotnet restore "OfficeManagementAPI.csproj"
COPY . .
RUN dotnet publish "OfficeManagementAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "OfficeManagementAPI.dll"]
