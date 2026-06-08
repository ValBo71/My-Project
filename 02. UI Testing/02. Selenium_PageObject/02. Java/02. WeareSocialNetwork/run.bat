CALL mvn clean install test -Dtest=RunAllTests
CALL allure serve "%CD%\target\surefire-reports"
