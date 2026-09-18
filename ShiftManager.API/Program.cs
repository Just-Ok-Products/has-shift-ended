using Microsoft.EntityFrameworkCore;
using ShiftManager.API;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Proxy passthrough verso lefrecce.it per la feature treni (nessuna logica applicativa qui).
builder.Services.AddHttpClient("Trenitalia", client =>
{
    client.BaseAddress = new Uri("https://www.lefrecce.it/Channels.Website.BFF.WEB/");
});

// CORS ristretto agli endpoint proxy treni, unica origine ammessa: il GitHub Pages del progetto.
builder.Services.AddCors(options =>
{
    options.AddPolicy("TrainsProxy", policy =>
    {
        policy.WithOrigins("https://just-ok-products.github.io")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

#region DbContext
builder.Services.AddDbContext<ShiftManagerContext>(options =>
    {
        var connectionString = builder.Configuration.GetConnectionString("ShiftManager");
        options.UseMySQL(connectionString ?? "", x => x.MigrationsAssembly("ShiftManager.Core"));
    },
    ServiceLifetime.Scoped
    );
#endregion

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
