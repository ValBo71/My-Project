CALL mvn clean install test -Dtest=A_RegistrationTests,B_LoginTests,C_PersonalProfileTests,D_PostsTests,E_ExplorePostsTests,F_FriendRequestTests,G_AdminTests
CALL allure serve "%CD%\target\surefire-reports"
