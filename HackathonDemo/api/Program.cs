using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://localhost:5050");
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
var app = builder.Build();
app.UseCors();

var dataDirectory = Path.Combine(builder.Environment.ContentRootPath, "data");
var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true, WriteIndented = true, DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull };
var fileLock = new object();

List<Module> ReadModules() => ReadJson<List<Module>>("modules.json") ?? [];
List<User> ReadUsers() => ReadJson<List<User>>("users.json") ?? [];
List<ExecutionRun> ReadRuns() => ReadJson<List<ExecutionRun>>("runs.json") ?? [];
T? ReadJson<T>(string fileName)
{
    var path = Path.Combine(dataDirectory, fileName);
    return File.Exists(path) ? JsonSerializer.Deserialize<T>(File.ReadAllText(path), jsonOptions) : default;
}
void WriteJson<T>(string fileName, T value)
{
    Directory.CreateDirectory(dataDirectory);
    File.WriteAllText(Path.Combine(dataDirectory, fileName), JsonSerializer.Serialize(value, jsonOptions));
}

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", service = "PNC Banking API" }));
app.MapPost("/api/auth/login", (LoginRequest request) =>
{
    var user = ReadUsers().FirstOrDefault(candidate => candidate.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase) && candidate.Password == request.Password);
    return user is null ? Results.Unauthorized() : Results.Ok(new { user = new { user.Name, user.Role, user.Email } });
});
app.MapGet("/api/config", () => Results.Ok(ReadJson<AutomationConfig>("automation-config.json")));
app.MapGet("/api/modules", () => Results.Ok(ReadModules()));
app.MapPut("/api/modules/{name}/{subModule}/implementation", (string name, string subModule, ImplementationRequest request) =>
{
    lock (fileLock)
    {
        var modules = ReadModules();
        var module = modules.FirstOrDefault(candidate => candidate.Name.Equals(name, StringComparison.OrdinalIgnoreCase) && candidate.SubModule.Equals(subModule, StringComparison.OrdinalIgnoreCase));
        if (module is null) return Results.NotFound();
        module.Implemented = request.Implemented;
        WriteJson("modules.json", modules);
        return Results.Ok(module);
    }
});
app.MapGet("/api/runs", () => Results.Ok(ReadRuns().OrderByDescending(run => run.Timestamp)));
app.MapGet("/api/summary", () =>
{
    var modules = ReadModules();
    var implemented = modules.Count;
    var covered = modules.Count(module => module.Implemented);
    var missed = implemented - covered;
    return Results.Ok(new { implemented, covered, missed, coverage = Math.Round(covered * 100.0 / implemented), gap = Math.Round(missed * 100.0 / implemented), risk = "Medium", impact = "Credit Card Disputes and role access workflows" });
});
app.MapPost("/api/runs", (ExecutionRun run) =>
{
    lock (fileLock)
    {
        var runs = ReadRuns();
        var savedRun = run with { Timestamp = DateTime.UtcNow.ToString("MMM dd, yyyy HH:mm") };
        runs.Add(savedRun);
        WriteJson("runs.json", runs);
        return Results.Accepted("/api/runs", savedRun);
    }
});
app.MapGet("/api/recovery", () => Results.Ok(ReadJson<RecoveryState>("recovery-state.json")));
app.MapPost("/api/recovery", (RecoveryState recovery) => { WriteJson("recovery-state.json", recovery); return Results.Ok(recovery); });
app.MapDelete("/api/recovery", () => { WriteJson<RecoveryState?>("recovery-state.json", null); return Results.NoContent(); });
app.Run();

record LoginRequest(string Email, string Password);
class Module(string name, string subModule, string area, bool implemented, string risk, string impact)
{
    public string Name { get; init; } = name;
    public string SubModule { get; init; } = subModule;
    public string Area { get; init; } = area;
    public bool Implemented { get; set; } = implemented;
    public string Risk { get; init; } = risk;
    public string Impact { get; init; } = impact;
}
record User(string Name, string Role, string Email, string Password);
record ExecutionRun(string Id, string User, string Status, string CurrentModule, string LastAction, string Duration, string Timestamp, int Coverage);
record ImplementationRequest(bool Implemented);
record RecoveryState(string RunId, string User, string Role, string LastAction, string CurrentModule, string Timestamp, string Reason, string Status);
record AutomationConfig(string ApplicationName, string BaseUrl, int DefaultTimeoutMs, bool CaptureManualActions, bool CaptureAutomationActions, bool RecoveryEnabled, string TestDataFile, string LocatorFile, string XpathFile);
