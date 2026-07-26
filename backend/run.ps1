$mavenVersion = "3.9.9"
$mavenZip = "apache-maven-$mavenVersion-bin.zip"
$mavenDir = "apache-maven-$mavenVersion"
$mavenUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$mavenVersion/$mavenZip"

if (-not (Test-Path $mavenDir)) {
    Write-Host "Downloading Maven..."
    Invoke-WebRequest -Uri $mavenUrl -OutFile $mavenZip
    Write-Host "Extracting Maven..."
    Expand-Archive -Path $mavenZip -DestinationPath "." -Force
    Remove-Item $mavenZip
}

Write-Host "Setting up Java..."
$env:JAVA_HOME = "$PWD\jdk-21.0.2"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

Write-Host "Running Spring Boot..."
& ".\$mavenDir\bin\mvn.cmd" spring-boot:run
