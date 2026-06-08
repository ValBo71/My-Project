package testCases;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    A_RegistrationTests.class,
    B_LoginTests.class,
    C_PersonalProfileTests.class,
    D_PostsTests.class,
    E_ExplorePostsTests.class,
    F_FriendRequestTests.class,
    G_AdminTests.class
})
public class RunAllTests {
}
